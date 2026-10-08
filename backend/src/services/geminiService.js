const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const logger = require('../utils/logger');

const ALLOWED_REASON_CATEGORIES = [
  'missing_po',
  'approval_pending',
  'invoice_error',
  'amount_dispute',
  'no_response',
  'other'
];

/**
 * Validates the parsed AI response structure
 */
function validateAnalysisResult(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned non-object response');
  }

  // 1. Validate reason_category
  if (!data.reason_category || typeof data.reason_category !== 'string') {
    throw new Error("Missing or invalid 'reason_category' in AI response");
  }
  const normalizedCategory = data.reason_category.toLowerCase().trim();
  if (!ALLOWED_REASON_CATEGORIES.includes(normalizedCategory)) {
    throw new Error(`Invalid 'reason_category': '${data.reason_category}'. Must be one of: ${ALLOWED_REASON_CATEGORIES.join(', ')}`);
  }

  // 2. Validate confidence
  if (data.confidence === undefined || data.confidence === null || typeof data.confidence !== 'number' || isNaN(data.confidence)) {
    throw new Error("Missing or non-numeric 'confidence' in AI response");
  }
  let confidence = data.confidence;
  if (confidence > 1 && confidence <= 100) {
    confidence = confidence / 100;
  }
  if (confidence < 0 || confidence > 1) {
    throw new Error(`Confidence value ${data.confidence} out of valid range (0.0 - 1.0)`);
  }
  confidence = Math.round(confidence * 100) / 100;

  // 3. Validate explanation
  if (!data.explanation || typeof data.explanation !== 'string' || data.explanation.trim().length === 0) {
    throw new Error("Missing or empty 'explanation' in AI response");
  }

  // 4. Validate recommended_action
  if (!data.recommended_action || typeof data.recommended_action !== 'string' || data.recommended_action.trim().length === 0) {
    throw new Error("Missing or empty 'recommended_action' in AI response");
  }

  // 5. Validate generated_response
  if (!data.generated_response || typeof data.generated_response !== 'string' || data.generated_response.trim().length === 0) {
    throw new Error("Missing or empty 'generated_response' in AI response");
  }

  return {
    reason_category: normalizedCategory,
    confidence,
    explanation: data.explanation.trim(),
    recommended_action: data.recommended_action.trim(),
    generated_response: data.generated_response.trim()
  };
}

/**
 * Build the prompt for Gemini given an invoice and its communications history
 */
function buildPrompt(invoice, communications) {
  const commsText = communications && communications.length > 0
    ? communications.map((c, idx) => `[Message ${idx + 1}] (${c.timestamp || 'N/A'}) [${c.communication_type || 'email'}] From: ${c.sender}\nMessage: "${c.message}"`).join('\n\n')
    : 'No prior communications recorded.';

  return `
You are the AI Payment Recovery Intelligence Engine for PayFlow.
Analyze the following invoice and customer communication thread to determine why the payment is delayed/stuck,
categorize the reason, calculate confidence, recommend the next recovery action, and draft a polite, professional, and actionable customer response.

### INVOICE DETAILS:
- Invoice Number: ${invoice.invoice_number}
- Customer Name: ${invoice.customer_name}
- Customer Company: ${invoice.customer_company || 'N/A'}
- Customer Email: ${invoice.customer_email}
- Amount: ${invoice.amount} ${invoice.currency || 'INR'}
- Issue Date: ${invoice.issue_date}
- Due Date: ${invoice.due_date}
- Payment Terms: ${invoice.payment_terms || 'N/A'}
- Purchase Order: ${invoice.purchase_order || 'N/A'}
- Current Status: ${invoice.status}
- Description: ${invoice.description || 'N/A'}
- Notes: ${invoice.notes || 'N/A'}

### COMMUNICATIONS HISTORY:
${commsText}

### INSTRUCTIONS:
1. Identify why the payment is stuck based on the communications and invoice status.
2. Select the single most accurate "reason_category" strictly from this allowed list:
   - "missing_po" (Customer waiting for PO number or purchasing order missing)
   - "approval_pending" (Internal routing, manager/VP sign-off, or committee approval pending)
   - "invoice_error" (Tax mismatch, wrong billing address, incorrect calculation, missing attachment)
   - "amount_dispute" (Customer disputes billable hours, rate, promotional discount, or deliverable)
   - "no_response" (Customer has gone unresponsive to multiple reminders, unread messages)
   - "other" (Any other valid reason)
3. Assign a "confidence" score between 0.00 and 1.00 based on certainty.
4. Provide a clear, concise "explanation" (1-2 sentences).
5. Specify a concise "recommended_action" (e.g. "request_po", "request_approval_followup", "send_corrected_invoice", "schedule_dispute_resolution", "escalate_reminder", "manual_review").
6. Draft a tailored "generated_response" addressed to ${invoice.customer_name} regarding invoice ${invoice.invoice_number}. Mention relevant details politely and provide a clear call to action.

### STRICT OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object. No explanation text outside JSON, no markdown codeblocks if possible.
Required JSON schema:
{
  "reason_category": "missing_po | approval_pending | invoice_error | amount_dispute | no_response | other",
  "confidence": 0.95,
  "explanation": "Concise explanation of the bottleneck.",
  "recommended_action": "action_code_or_name",
  "generated_response": "Polite customer communication message."
}
`;
}

/**
 * Intelligent Rule-based fallback analyzer (Used if MOCK_AI=true or when Gemini API key is intentionally in test mode)
 */
function analyzeWithHeuristics(invoice, communications) {
  const allText = [
    invoice.description || '',
    ...(communications || []).map(c => `${c.sender}: ${c.message}`)
  ].join(' ').toLowerCase();

  let category = 'other';
  let explanation = 'Invoice payment is delayed and requires review.';
  let recommended = 'manual_review';
  let responseMsg = `Hi ${invoice.customer_name}, we are following up regarding invoice ${invoice.invoice_number} for ${invoice.amount} ${invoice.currency || 'INR'}. Please let us know the current payment status.`;
  let confidence = 0.85;

  if (allText.includes('po') || allText.includes('purchase order') || allText.includes('procurement')) {
    category = 'missing_po';
    explanation = 'The invoice cannot be processed by accounts payable because the required Purchase Order (PO) number is missing.';
    recommended = 'request_po';
    responseMsg = `Hi ${invoice.customer_name}, we noticed that invoice ${invoice.invoice_number} is pending a Purchase Order (PO) number. Could you please share the approved PO number so we can update the invoice and proceed with payment processing?`;
    confidence = 0.94;
  } else if (allText.includes('approv') || allText.includes('sign-off') || allText.includes('authorization') || allText.includes('vp') || allText.includes('manager')) {
    category = 'approval_pending';
    explanation = 'The invoice has been routed internally and is awaiting management sign-off or authorization.';
    recommended = 'request_approval_followup';
    responseMsg = `Hi ${invoice.customer_name}, following up on invoice ${invoice.invoice_number}. We understand it is currently in your internal approval queue. Could you let us know if additional documentation is needed from our side to expedite the sign-off?`;
    confidence = 0.91;
  } else if (allText.includes('tax') || allText.includes('error') || allText.includes('incorrect') || allText.includes('mismatch') || allText.includes('reissue') || allText.includes('address')) {
    category = 'invoice_error';
    explanation = 'Customer identified a discrepancy or billing error in the invoice details that requires correction.';
    recommended = 'send_corrected_invoice';
    responseMsg = `Hi ${invoice.customer_name}, thank you for bringing the invoice discrepancy to our attention regarding ${invoice.invoice_number}. We have corrected the details and attached the revised invoice for payment.`;
    confidence = 0.93;
  } else if (allText.includes('dispute') || allText.includes('discount') || allText.includes('rate') || allText.includes('hours') || allText.includes('deliverable') || allText.includes('capped')) {
    category = 'amount_dispute';
    explanation = 'Customer is actively disputing the invoice line items, billed hours, or rates.';
    recommended = 'schedule_dispute_resolution';
    responseMsg = `Hi ${invoice.customer_name}, thank you for your feedback on invoice ${invoice.invoice_number}. We would like to schedule a quick 10-minute sync to review the billed items and resolve any discrepancies immediately.`;
    confidence = 0.90;
  } else if (communications && communications.length > 0 && !communications.some(c => c.sender === 'customer')) {
    category = 'no_response';
    explanation = 'Multiple reminders have been sent to the customer without any acknowledgment or payment confirmation.';
    recommended = 'escalate_reminder';
    responseMsg = `Hi ${invoice.customer_name}, we have sent multiple reminders regarding overdue invoice ${invoice.invoice_number} (${invoice.amount} ${invoice.currency || 'INR'}). Please respond urgently to avoid service disruption or escalation.`;
    confidence = 0.88;
  }

  return {
    reason_category: category,
    confidence,
    explanation,
    recommended_action: recommended,
    generated_response: responseMsg
  };
}

/**
 * Main Gemini Analysis Function
 */
async function analyzeInvoice(invoice, communications) {
  // Check if API key is provided
  if (!config.geminiApiKey || config.geminiApiKey.trim() === '' || config.geminiApiKey === 'your_gemini_api_key_here') {
    if (process.env.ALLOW_MOCK_AI === 'true') {
      logger.info(`[GeminiService] GEMINI_API_KEY not configured. ALLOW_MOCK_AI=true is enabled; using heuristic analysis.`);
      return analyzeWithHeuristics(invoice, communications);
    }
    logger.error('[GeminiService] GEMINI_API_KEY is not configured and ALLOW_MOCK_AI is not enabled.');
    const err = new Error('AI analysis is unavailable right now. Please try again later.');
    err.statusCode = 503;
    throw err;
  }

  // Prepare list of models to try (primary from config, then standard fallbacks)
  const primaryModel = config.geminiModel || 'gemini-3.8-flash';
  const modelsToTry = [primaryModel, 'gemini-2.5-flash', 'gemini-3.8-flash'].filter((v, i, a) => a.indexOf(v) === i);

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const prompt = buildPrompt(invoice, communications);
  let lastError = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        logger.info(`[GeminiService] Calling Gemini API (${modelName}, attempt ${attempt + 1}) for invoice #${invoice.invoice_number}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        logger.debug('[GeminiService] Raw Gemini response:', text);

        // Clean text in case of surrounding markdown codeblocks
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanedText);
        } catch (parseError) {
          logger.error('[GeminiService] Failed to parse JSON from Gemini:', text);
          throw new Error(`Gemini returned malformed JSON: ${parseError.message}`);
        }

        // Validate the AI output strictly
        const validatedData = validateAnalysisResult(parsed);
        logger.info(`[GeminiService] Successfully validated AI analysis via ${modelName} for invoice #${invoice.invoice_number}: category=${validatedData.reason_category}, confidence=${validatedData.confidence}`);

        return validatedData;
      } catch (error) {
        lastError = error;
        const isOverloaded = error.message && (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('overloaded'));
        if (isOverloaded && attempt === 0) {
          logger.warn(`[GeminiService] Model ${modelName} temporary 503 spike. Retrying after 1500ms...`);
          await new Promise(res => setTimeout(res, 1500));
          continue;
        }
        logger.warn(`[GeminiService] Model ${modelName} attempt failed: ${error.message}. Checking alternatives...`);
        break;
      }
    }
  }

  logger.error('[GeminiService] All Gemini model attempts failed:', lastError ? lastError.message : 'Unknown error');
  if (process.env.ALLOW_MOCK_AI === 'true') {
    logger.warn('[GeminiService] Falling back to heuristic analysis due to ALLOW_MOCK_AI=true');
    return analyzeWithHeuristics(invoice, communications);
  }
  const failure = new Error('AI analysis is unavailable right now. Please try again later.');
  failure.statusCode = 503;
  throw failure;
}

module.exports = {
  analyzeInvoice,
  validateAnalysisResult,
  analyzeWithHeuristics,
  ALLOWED_REASON_CATEGORIES
};
