import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoiceService } from "../services/api";
import {
  Brain,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
} from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import BlockerBadge from "../components/common/BlockerBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import ErrorState from "../components/common/ErrorState";

const STAGES = [
  {
    id: "all",
    label: "All Pipeline Stages",
    count: 6,
  },
  {
    id: "Analyze",
    step: "01",
    label: "1. Analyze",
    desc: "Ingests invoice telemetry & communications (emails, AP portals, tickets).",
    icon: Brain,
    color: "indigo",
  },
  {
    id: "Detect Blocker",
    step: "02",
    label: "2. Detect Blocker",
    desc: "Neural diagnostic isolates root cause (cash flow, dispute, docs, approvals).",
    icon: ShieldAlert,
    color: "amber",
  },
  {
    id: "Recommend Action",
    step: "03",
    label: "3. Recommend Action",
    desc: "Synthesizes tailored recovery strategy & drafts persuasive customer correspondence.",
    icon: Sparkles,
    color: "purple",
  },
  {
    id: "Recover",
    step: "04",
    label: "4. Recover",
    desc: "Executes recovery action: 1-tap sign-offs, payment plans, and tracking.",
    icon: CheckCircle2,
    color: "emerald",
  },
];

export default function RecoveryWorkflow() {
  const [selectedStage, setSelectedStage] = useState("all");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    let cancelled = false;
    invoiceService
      .getAll()
      .then((all) => {
        if (cancelled) return;
        setInvoices(all);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Unable to load the recovery pipeline.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => load(), []);

  // Filter invoices according to selected stage tab
  const filteredInvoices =
    selectedStage === "all"
      ? invoices.filter((i) => i.status !== "Paid")
      : invoices.filter((i) => i.workflowStage === selectedStage);

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          Autonomous AI Payment Recovery Pipeline
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Recovery Workflow Engine
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          PayFlow replaces manual dunning cycles with an intelligent 4-stage pipeline that pinpoints why payments are stalled and drives accelerated B2B cash recovery.
        </p>
      </div>

      {/* 4-Stage Architectural Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.filter((s) => s.step).map((stage) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative bg-white flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                  : "border-slate-200/90 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400">
                    STAGE {stage.step}
                  </span>
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {stage.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-600">
                  {invoices.filter((i) => i.workflowStage === stage.id).length} Active Invoices
                </span>
                <span className="text-slate-400">Filter →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Pipeline Stage View:{" "}
              <span className="text-indigo-600 font-semibold">
                {selectedStage === "all" ? "All Unresolved" : selectedStage}
              </span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
              {filteredInvoices.length} invoices
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedStage("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedStage === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Stages
            </button>
            {STAGES.filter((s) => s.step).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedStage === s.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of items */}
        <div className="divide-y divide-slate-100">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No invoices currently stalled in this stage.
            </div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Invoice info */}
                <div className="flex items-start gap-3 min-w-[260px]">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {inv.customer.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {inv.customer.name}
                      </span>
                      <PriorityBadge priority={inv.priority} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-medium text-slate-700">
                        {inv.invoiceNumber}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-900">
                        {inv.formattedAmount}
                      </span>
                      <span>•</span>
                      <span className="text-rose-600 font-medium">
                        {inv.daysOverdue}d overdue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blocker & Stage Details */}
                <div className="flex-1 lg:px-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={inv.status} size="sm" />
                    <BlockerBadge blocker={inv.blocker} />
                    <span className="text-xs text-slate-400">
                      Stage: <span className="font-medium text-slate-700">{inv.workflowStage}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    <span className="font-semibold text-slate-800">Action: </span>
                    {inv.recommendedAction}
                  </p>
                </div>

                {/* Right button */}
                <div className="self-end lg:self-center shrink-0">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
