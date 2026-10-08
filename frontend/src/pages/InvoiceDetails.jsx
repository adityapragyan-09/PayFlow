import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceService, analysisService, recoveryService } from "../services/api";
import StatusBadge from "../components/common/StatusBadge";
import BlockerBadge from "../components/common/BlockerBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import CustomerMessageCard from "../components/invoices/CustomerMessageCard";
import AiAnalysisCard from "../components/recovery/AiAnalysisCard";
import ResponseDraftCard from "../components/recovery/ResponseDraftCard";
import WorkflowPipeline from "../components/recovery/WorkflowPipeline";
import ActivityFeed from "../components/common/ActivityFeed";
import RecoveryActionModal from "../components/recovery/RecoveryActionModal";
import {
  ArrowLeft,
  Send,
  Building,
  FileText,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoading(true);
        const data = await invoiceService.getById(id);
        if (data) {
          setInvoice(data);
        } else {
          // If not found by exact ID, fallback to first mock invoice
          const all = await invoiceService.getAll();
          setInvoice(all[0]);
        }
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAnalyzePayment = async () => {
    if (!invoice) return;
    setAnalyzing(true);
    try {
      const updated = await analysisService.analyzePayment(invoice.id);
      setInvoice(updated);
      showToast("PayFlow AI: Re-analyzed customer intent and re-verified blocker detection.");
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmRecovery = async (_options) => {
    if (!invoice) return;
    try {
      const updated = await recoveryService.initiateRecovery(invoice.id, {
        customNote: `Dispatched ${invoice.recommendedAction} with 1-click settlement link.`,
      });
      setInvoice(updated);
      showToast(`Recovery Initiated! Customer outreach sent to ${invoice.customer.contactName}.`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading Invoice Analysis...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-800">Invoice not found</h3>
        <p className="text-xs text-slate-500 mt-1">Please return to the invoices dashboard.</p>
        <button
          onClick={() => navigate("/invoices")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-900">
                {invoice.invoiceNumber}
              </span>
              <StatusBadge status={invoice.status} />
              <PriorityBadge priority={invoice.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-800">{invoice.customer.name}</span>
            </p>
          </div>
        </div>

        {/* PRIMARY ACTIONS: Analyze Payment & Recover Payment */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleAnalyzePayment}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${analyzing ? "animate-spin" : ""}`} />
            <span>{analyzing ? "Re-Analyzing..." : "Analyze Payment"}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Recover Payment</span>
          </button>
        </div>
      </div>

      {/* Full 4-Stage Recovery Pipeline Progress */}
      <WorkflowPipeline currentStage={invoice.workflowStage} />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Communication, AI Analysis, Generated Response */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prominent AI Payment Analysis Card */}
          <AiAnalysisCard
            analysis={invoice.aiAnalysis}
            blocker={invoice.blocker}
          />

          {/* Customer Communication (Realistic & Visually Distinct) */}
          <CustomerMessageCard
            communication={invoice.communication}
            customer={invoice.customer}
          />

          {/* Generated Customer Response */}
          <ResponseDraftCard
            responseDraft={invoice.generatedResponse}
            onSendRecovery={() => setModalOpen(true)}
          />
        </div>

        {/* Right Column (5 cols): Invoice Info Card & Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Invoice Information Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Invoice Ledger Information</span>
              </h3>
              <StatusBadge status={invoice.status} size="sm" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {invoice.invoiceNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Due:</span>
                <span className="text-base font-bold text-slate-900">
                  {invoice.formattedAmount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-medium text-slate-700">{invoice.issueDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Maturity Due Date:</span>
                <span className="font-medium text-slate-700">{invoice.dueDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Days Overdue:</span>
                <span className={`font-semibold ${invoice.daysOverdue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {invoice.daysOverdue > 0 ? `${invoice.daysOverdue} days past due` : "Current"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1.5">Detected Blocker:</span>
                <BlockerBadge blocker={invoice.blocker} />
              </div>
            </div>

            {/* Customer Details */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Account Details
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.customer.name}
                </div>
                <div className="text-slate-600">
                  Contact: <span className="font-medium">{invoice.customer.contactName}</span> ({invoice.customer.contactTitle})
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {invoice.customer.contactEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline for this Invoice */}
          <ActivityFeed
            events={invoice.timeline}
            title="Invoice Audit Trail"
          />
        </div>
      </div>

      {/* Recovery Confirmation Modal */}
      <RecoveryActionModal
        invoice={invoice}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRecovery}
      />
    </div>
  );
}
