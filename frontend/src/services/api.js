// PayFlow API client.
// The React UI keeps its existing view-model. This module translates the
// Express backend contract ({ success, data } on /api/*) into that shape.
// The backend does not implement authentication, so requests are unauthenticated.

import { ApiError, request } from "./http.js";
import { DEFAULT_CURRENCY, formatCurrency } from "../utils/currency.js";

const REASON_LABELS = {
  missing_po: "Missing documentation",
  approval_pending: "Approval pending",
  invoice_error: "Payment processing issue",
  amount_dispute: "Invoice dispute",
  no_response: "Customer clarification required",
  other: "Other",
};

const ACTION_LABELS = {
  request_po: "Request the missing purchase order and reissue the invoice",
  request_approval_followup: "Follow up on the pending internal approval",
  send_corrected_invoice: "Send a corrected invoice",
  schedule_dispute_resolution: "Schedule dispute resolution and adjust the invoice",
  escalate_reminder: "Escalate a payment reminder to the customer",
  manual_review: "Review this invoice manually before outreach",
  standard_followup: "Send a standard payment follow-up",
};

const STATUS_LABELS = {
  pending: "Pending",
  overdue: "Overdue",
  in_recovery: "Recovery Ready",
  recovered: "Paid",
  disputed: "Blocked",
  cancelled: "Cancelled",
};

const EVENT_META = {
  invoice_created: { type: "system", name: "Invoice Issued", actor: "Billing Engine" },
  communication_logged: { type: "communication", name: "Communication Logged", actor: "PayFlow" },
  ai_analysis: { type: "ai", name: "AI Analysis Completed", actor: "PayFlow AI Engine" },
  recovery_action_executed: { type: "recovery", name: "Recovery Action Initiated", actor: "PayFlow Recovery" },
  status_changed: { type: "warning", name: "Invoice Status Updated", actor: "PayFlow" },
};

const CHANNEL_LABELS = {
  email: "Email",
  sms: "SMS",
  call_log: "Call log",
  portal_message: "Portal message",
};

export const recoveryPipelineSteps = [
  {
    step: 1,
    id: "analyze",
    title: "1. Analyze",
    subtitle: "Ingest & Understand",
    description: "Monitors overdue invoices and reads customer communications.",
    details: "Uses invoice terms plus the communication thread stored for each invoice.",
    icon: "Brain",
  },
  {
    step: 2,
    id: "detect",
    title: "2. Detect Blocker",
    subtitle: "Root Cause Classification",
    description: "Classifies why payment is stalled using the PayFlow AI analysis.",
    details: "Categories include missing PO, approval, invoice error, dispute, and no response.",
    icon: "ShieldAlert",
  },
  {
    step: 3,
    id: "recommend",
    title: "3. Recommend Action",
    subtitle: "Strategy Formulation",
    description: "Returns a recommended recovery action and a customer-ready reply.",
    details: "The draft comes from the latest AI analysis on the invoice.",
    icon: "Sparkles",
  },
  {
    step: 4,
    id: "recover",
    title: "4. Recover",
    subtitle: "Automated Execution",
    description: "Records the recovery action and moves the invoice into recovery.",
    details: "The activity timeline keeps an audit trail of the dispatch.",
    icon: "ArrowUpRight",
  },
];

function humanizeAction(action) {
  if (!action) return "Run AI analysis to recommend a recovery action";
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (action.includes("_") && !action.includes(" ")) {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return action;
}

function toPercent(confidence) {
  const value = Number(confidence);
  if (Number.isNaN(value)) return 0;
  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function formatMoney(amount, currency = DEFAULT_CURRENCY) {
  return formatCurrency(amount, currency || DEFAULT_CURRENCY);
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const normalized = String(timestamp).includes("T")
    ? String(timestamp)
    : String(timestamp).replace(" ", "T");
  const withZone = /Z$|[+-]\d{2}:\d{2}$/.test(normalized) ? normalized : `${normalized}Z`;
  const date = new Date(withZone);
  if (Number.isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function daysOverdue(dueDate, status) {
  if (!dueDate || status === "recovered" || status === "cancelled") return 0;
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function domainFromEmail(email = "") {
  const at = String(email).split("@")[1];
  return at || "";
}

function derivePriority(invoice, days) {
  if (invoice.status === "recovered" || invoice.status === "cancelled") return "Low";
  if (invoice.status === "disputed" || days >= 30 || Number(invoice.amount) >= 25000) return "Critical";
  if (days >= 14 || invoice.status === "overdue" || invoice.status === "in_recovery") return "High";
  if (invoice.status === "pending") return "Low";
  return "Medium";
}

function deriveWorkflowStage(status, hasAnalysis, hasRecovery) {
  if (status === "recovered" || status === "in_recovery" || hasRecovery) return "Recover";
  if (hasAnalysis) return "Recommend Action";
  if (status === "overdue" || status === "disputed") return "Detect Blocker";
  return "Analyze";
}

function mapCustomer(row) {
  return {
    name: row.customer_name,
    domain: domainFromEmail(row.customer_email),
    contactName: row.customer_name,
    contactTitle: "Accounts Payable",
    contactEmail: row.customer_email,
    tier: "Customer",
    initials: initialsFromName(row.customer_name),
  };
}

function mapAnalysis(analysis) {
  if (!analysis) return null;
  const blocker = REASON_LABELS[analysis.reason_category] || "Other";
  const confidence = toPercent(analysis.confidence);
  const signals = [];
  if (analysis.reason_category) {
    signals.push(`Reason category: ${analysis.reason_category.replaceAll("_", " ")}`);
  }
  if (analysis.recommended_action) {
    signals.push(`Recommended action: ${humanizeAction(analysis.recommended_action)}`);
  }
  return {
    detectedBlocker: blocker,
    confidence,
    severity: confidence >= 85 ? "High" : "Medium",
    sentiment: "",
    reason: analysis.explanation || "Analysis is available. Open the invoice to refresh the full explanation.",
    keySignals: signals,
    recommendedAction: humanizeAction(analysis.recommended_action),
  };
}

function mapGeneratedResponse(analysis, invoice) {
  if (!analysis?.generated_response) return null;
  return {
    subject: `Follow-up for ${invoice.invoice_number}`,
    tone: "Professional",
    targetAudience: invoice.customer_name,
    body: analysis.generated_response,
  };
}

function mapCommunication(communications, invoice) {
  if (!communications || communications.length === 0) return null;
  const customerMessages = communications.filter((item) => item.sender === "customer");
  const latest = customerMessages.length
    ? customerMessages[customerMessages.length - 1]
    : communications[communications.length - 1];

  let sender = latest.sender;
  if (latest.sender === "customer") sender = invoice.customer_name;
  else if (latest.sender === "finance_team") sender = "Finance Team";
  else if (latest.sender === "system") sender = "PayFlow";

  return {
    channel: CHANNEL_LABELS[latest.communication_type] || latest.communication_type || "Message",
    sender,
    date: formatTimestamp(latest.timestamp),
    subject: `Invoice ${invoice.invoice_number}`,
    preview: String(latest.message || "").slice(0, 180),
    body: latest.message || "",
  };
}

function mapTimelineEvent(event) {
  const meta = EVENT_META[event.event_type] || {
    type: "system",
    name: "Activity",
    actor: "PayFlow",
  };
  let type = meta.type;
  if (event.event_type === "status_changed" && String(event.description || "").toLowerCase().includes("recovered")) {
    type = "success";
  }
  return {
    id: String(event.id),
    eventName: meta.name,
    timestamp: formatTimestamp(event.created_at),
    description: event.description,
    type,
    actor: meta.actor,
  };
}

function mapInvoiceSummary(row) {
  const analysis = row.latest_analysis || null;
  const hasRecovery = Boolean(row.recovery_status);
  const days = daysOverdue(row.due_date, row.status);
  const blocker = analysis
    ? REASON_LABELS[analysis.reason_category] || "Other"
    : row.status === "recovered"
      ? "Resolved"
      : "None";

  return {
    id: String(row.id),
    invoiceNumber: row.invoice_number,
    customer: mapCustomer(row),
    amount: Number(row.amount) || 0,
    formattedAmount: formatMoney(row.amount, row.currency),
    issueDate: row.issue_date,
    dueDate: row.due_date,
    daysOverdue: days,
    status: STATUS_LABELS[row.status] || row.status,
    rawStatus: row.status,
    priority: derivePriority(row, days),
    blocker,
    blockerConfidence: analysis ? toPercent(analysis.confidence) : 0,
    workflowStage: deriveWorkflowStage(row.status, Boolean(analysis), hasRecovery),
    recommendedAction: analysis
      ? humanizeAction(analysis.recommended_action)
      : row.status === "recovered"
        ? "Payment recovered"
        : "Run AI analysis to recommend a recovery action",
    communication: null,
    aiAnalysis: analysis
      ? mapAnalysis({
          reason_category: analysis.reason_category,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          recommended_action: analysis.recommended_action,
        })
      : null,
    generatedResponse: null,
    timeline: [],
    description: row.description || "",
  };
}

function mapInvoiceDetail(payload) {
  const invoice = payload?.invoice;
  if (!invoice) {
    throw new ApiError("The invoice response was incomplete.", 500);
  }
  const latest = payload.latest_analysis;
  const summary = mapInvoiceSummary({
    ...invoice,
    latest_analysis: latest
      ? {
          reason_category: latest.reason_category,
          confidence: latest.confidence,
          recommended_action: latest.recommended_action,
          explanation: latest.explanation,
          analyzed_at: latest.analyzed_at,
        }
      : null,
    recovery_status: payload.recovery_status
      ? {
          action_type: payload.recovery_status.action_type,
          status: payload.recovery_status.status,
        }
      : null,
  });

  return {
    ...summary,
    communication: mapCommunication(payload.communications, invoice),
    aiAnalysis: mapAnalysis(latest),
    generatedResponse: mapGeneratedResponse(latest, invoice),
    timeline: (payload.timeline || [])
      .slice()
      .reverse()
      .map(mapTimelineEvent),
  };
}

function activityCategory(event) {
  if (event.event_type === "ai_analysis") return "ai";
  if (event.event_type === "communication_logged") return "communication";
  if (event.event_type === "recovery_action_executed") return "recovery";
  if (event.event_type === "status_changed") {
    return String(event.description || "").toLowerCase().includes("recovered") ? "success" : "blocker";
  }
  return "system";
}

function activityBadge(event, category) {
  if (category === "ai") return "Analyzed";
  if (category === "recovery") return "Dispatched";
  if (category === "communication") return "Logged";
  if (category === "success") return "Recovered";
  if (category === "blocker") return "Updated";
  return "Recorded";
}

function mapActivityItem(event) {
  const timeline = mapTimelineEvent(event);
  const category = activityCategory(event);
  return {
    id: `${event.invoice_id || "inv"}-${event.id}`,
    invoiceId: event.invoice_id != null ? String(event.invoice_id) : "",
    timestamp: timeline.timestamp,
    invoiceNumber: event.invoice_number || "",
    customer: event.customer_name || "",
    amount: formatMoney(event.amount, event.currency),
    eventName: timeline.eventName,
    description: event.description,
    category,
    statusBadge: activityBadge(event, category),
  };
}

export const invoiceService = {
  async getAll() {
    const rows = await request("/api/invoices");
    return (rows || []).map(mapInvoiceSummary);
  },

  async getById(id) {
    if (!id) return null;
    try {
      const payload = await request(`/api/invoices/${encodeURIComponent(id)}`);
      return mapInvoiceDetail(payload);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async getKpis() {
    const [dashboard, invoices] = await Promise.all([
      request("/api/dashboard"),
      request("/api/invoices"),
    ]);
    const stats = dashboard?.stats || {};
    const rows = invoices || [];
    const currency = rows[0]?.currency || DEFAULT_CURRENCY;
    const overdueRows = rows.filter((row) => row.status === "overdue");
    const overdueAmount = overdueRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const blockedRows = rows.filter((row) =>
      ["overdue", "disputed", "in_recovery"].includes(row.status)
    );
    const blockedAmount = blockedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const opportunityRows = rows.filter(
      (row) => row.latest_analysis && !["recovered", "cancelled"].includes(row.status)
    );
    const opportunityAmount = opportunityRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const confidenceValues = opportunityRows
      .map((row) => toPercent(row.latest_analysis.confidence))
      .filter((value) => value > 0);
    const averageConfidence = confidenceValues.length
      ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
      : 0;
    const totalAmount = Number(stats.total_amount) || 0;
    const overdueShare = totalAmount > 0 ? `${((overdueAmount / totalAmount) * 100).toFixed(1)}% of total` : "0% of total";

    return {
      totalReceivables: {
        label: "Total Receivables",
        value: formatMoney(stats.outstanding_amount, currency),
        rawValue: Number(stats.outstanding_amount) || 0,
        change: `${stats.total_invoices || 0} invoices`,
        changeType: "neutral",
        subtext: `${stats.pending || 0} pending · ${stats.recovered || 0} recovered`,
      },
      overdueAmount: {
        label: "Overdue Amount",
        value: formatMoney(overdueAmount, currency),
        rawValue: overdueAmount,
        change: overdueShare,
        changeType: "danger",
        subtext: `${overdueRows.length} invoices past due`,
      },
      blockedInvoices: {
        label: "Blocked Invoices",
        value: String(blockedRows.length),
        rawValue: blockedRows.length,
        change: `${formatMoney(blockedAmount, currency)} outstanding`,
        changeType: "warning",
        subtext: `${stats.disputed || 0} disputed · ${stats.in_recovery || 0} in recovery`,
      },
      recoveryOpportunity: {
        label: "Recovery Opportunity",
        value: formatMoney(opportunityAmount, currency),
        rawValue: opportunityAmount,
        change: confidenceValues.length ? `${averageConfidence}% avg confidence` : "No analysis yet",
        changeType: "success",
        subtext: `${opportunityRows.length} invoices with an AI recommendation`,
      },
    };
  },
};

export const recoveryService = {
  async getRecoveryQueue() {
    const invoices = await invoiceService.getAll();
    return invoices.filter(
      (invoice) =>
        invoice.status === "Blocked" ||
        invoice.status === "Recovery Ready" ||
        invoice.status === "Overdue"
    );
  },

  async getPipelineStages() {
    return recoveryPipelineSteps;
  },

  async initiateRecovery(invoiceId, payload = {}) {
    const body = {};
    if (payload.action_type) body.action_type = payload.action_type;
    if (payload.scheduleOption === "scheduled") body.status = "scheduled";
    else if (payload.scheduleOption === "immediate") body.status = "completed";
    if (payload.message) body.message = payload.message;

    await request(`/api/invoices/${encodeURIComponent(invoiceId)}/recover`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const updated = await invoiceService.getById(invoiceId);
    if (!updated) {
      throw new ApiError("Invoice not found after recovery.", 404);
    }
    return updated;
  },
};

export const analysisService = {
  async analyzePayment(invoiceId) {
    await request(`/api/invoices/${encodeURIComponent(invoiceId)}/analyze`, {
      method: "POST",
      timeoutMs: 60000,
    });
    const updated = await invoiceService.getById(invoiceId);
    if (!updated) {
      throw new ApiError("Invoice not found after analysis.", 404);
    }
    return updated;
  },
};

export const activityService = {
  async getGlobalActivity() {
    const invoices = await request("/api/invoices");
    const timelines = await Promise.all(
      (invoices || []).map(async (invoice) => {
        try {
          const events = await request(`/api/invoices/${encodeURIComponent(invoice.id)}/timeline`);
          return (events || []).map((event) => ({
            ...event,
            invoice_number: invoice.invoice_number,
            customer_name: invoice.customer_name,
            amount: invoice.amount,
            currency: invoice.currency,
          }));
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("Skipped timeline for invoice", invoice.id, error);
          }
          return [];
        }
      })
    );

    return timelines
      .flat()
      .sort((left, right) => {
        const byTime = String(right.created_at || "").localeCompare(String(left.created_at || ""));
        if (byTime !== 0) return byTime;
        return Number(right.id) - Number(left.id);
      })
      .map(mapActivityItem);
  },

  async getInvoiceActivity(invoiceId) {
    const events = await request(`/api/invoices/${encodeURIComponent(invoiceId)}/timeline`);
    return (events || [])
      .slice()
      .reverse()
      .map(mapTimelineEvent);
  },
};

export async function checkApiHealth() {
  return request("/api/health");
}
