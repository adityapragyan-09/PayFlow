// Isolated API / Service Layer for PayFlow
// This layer abstracts data fetching and state mutation.
// When the Express backend is ready, replace these mock implementations with axios/fetch calls
// without modifying any React UI components.

import {
  mockKpis,
  mockInvoices,
  mockGlobalActivity,
  recoveryPipelineSteps,
} from "../data/mockData.js";

// Local mutable state cache to support interactive demo actions during hackathon presentations
let invoicesState = [...mockInvoices];
let globalActivityState = [...mockGlobalActivity];

/**
 * Invoice Service
 */
export const invoiceService = {
  /**
   * Fetch all invoices with optional filtering and search
   */
  async getAll(params = {}) {
    // Simulate slight async response time for realistic feel if needed
    await new Promise((res) => setTimeout(res, 60));

    let results = [...invoicesState];

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.name.toLowerCase().includes(q) ||
          inv.blocker.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== "All") {
      results = results.filter((inv) => inv.status === params.status);
    }

    if (params.blocker && params.blocker !== "All") {
      results = results.filter((inv) => inv.blocker.toLowerCase().includes(params.blocker.toLowerCase()));
    }

    return results;
  },

  /**
   * Fetch a single invoice by its ID (e.g. 'INV-2024-8901' or 'INV-8901')
   */
  async getById(id) {
    await new Promise((res) => setTimeout(res, 50));
    const normalized = id?.trim().toLowerCase();
    const invoice = invoicesState.find(
      (inv) =>
        inv.id.toLowerCase() === normalized ||
        inv.invoiceNumber.toLowerCase() === normalized
    );
    return invoice || null;
  },

  /**
   * Fetch high-level KPI dashboard metrics
   */
  async getKpis() {
    await new Promise((res) => setTimeout(res, 50));
    return { ...mockKpis };
  },
};

/**
 * Recovery Service
 */
export const recoveryService = {
  /**
   * Fetch invoices currently requiring recovery attention
   */
  async getRecoveryQueue() {
    await new Promise((res) => setTimeout(res, 60));
    return invoicesState.filter(
      (inv) =>
        inv.status === "Blocked" ||
        inv.status === "Recovery Ready" ||
        inv.status === "Overdue"
    );
  },

  /**
   * Get the standard 4-stage pipeline definitions
   */
  async getPipelineStages() {
    return recoveryPipelineSteps;
  },

  /**
   * Initiate automated recovery workflow on an invoice
   */
  async initiateRecovery(invoiceId, payload = {}) {
    await new Promise((res) => setTimeout(res, 180));
    const targetIdx = invoicesState.findIndex(
      (inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId
    );

    if (targetIdx === -1) {
      throw new Error("Invoice not found");
    }

    const currentInv = invoicesState[targetIdx];
    const updatedStatus = "Recovery Ready";
    const updatedWorkflowStage = "Recover";

    const newEvent = {
      id: `ev-${Date.now()}`,
      eventName: "Recovery Initiated by Operator",
      timestamp: "Just now",
      description: payload.customNote || `Automated recovery action dispatched: "${currentInv.recommendedAction}"`,
      type: "recovery",
      actor: "Operator (via PayFlow AI)",
    };

    const updatedInvoice = {
      ...currentInv,
      status: updatedStatus,
      workflowStage: updatedWorkflowStage,
      timeline: [newEvent, ...currentInv.timeline],
    };

    invoicesState[targetIdx] = updatedInvoice;

    // Add to global feed
    globalActivityState = [
      {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        invoiceNumber: currentInv.invoiceNumber,
        customer: currentInv.customer.name,
        amount: currentInv.formattedAmount,
        eventName: "Recovery action initiated",
        description: `Dispatched automated recovery proposal to ${currentInv.customer.name}.`,
        category: "recovery",
        statusBadge: "Dispatched",
      },
      ...globalActivityState,
    ];

    return updatedInvoice;
  },
};

/**
 * AI Analysis Service
 */
export const analysisService = {
  /**
   * Trigger AI re-analysis on an invoice and its customer communications
   */
  async analyzePayment(invoiceId) {
    // Simulate real AI processing latency
    await new Promise((res) => setTimeout(res, 650));
    const targetIdx = invoicesState.findIndex(
      (inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId
    );

    if (targetIdx === -1) {
      throw new Error("Invoice not found");
    }

    const currentInv = invoicesState[targetIdx];

    const updatedTimeline = [
      {
        id: `ev-${Date.now()}`,
        eventName: "AI Analysis Refreshed",
        timestamp: "Just now",
        description: `PayFlow AI neural engine re-verified communication signals with ${currentInv.aiAnalysis.confidence}% confidence.`,
        type: "ai",
        actor: "PayFlow AI Engine",
      },
      ...currentInv.timeline,
    ];

    const updatedInvoice = {
      ...currentInv,
      timeline: updatedTimeline,
    };

    invoicesState[targetIdx] = updatedInvoice;
    return updatedInvoice;
  },
};

/**
 * Activity Feed Service
 */
export const activityService = {
  /**
   * Fetch global activity audit trail
   */
  async getGlobalActivity() {
    await new Promise((res) => setTimeout(res, 50));
    return [...globalActivityState];
  },

  /**
   * Fetch timeline events for a specific invoice
   */
  async getInvoiceActivity(invoiceId) {
    const invoice = await invoiceService.getById(invoiceId);
    return invoice ? invoice.timeline : [];
  },
};
