import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Clock } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import BlockerBadge from "../common/BlockerBadge";
import PriorityBadge from "../common/PriorityBadge";

export default function RecoveryQueue({ queue = [] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Recovery Action Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
              {queue.length} Needing Action
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-flagged invoices with classified blockers and ready-to-dispatch recovery proposals.
          </p>
        </div>

        <Link
          to="/recovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <span>View Recovery Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Queue items */}
      <div className="divide-y divide-slate-100">
        {queue.slice(0, 4).map((invoice) => (
          <div
            key={invoice.id}
            className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            {/* Left: Customer & Invoice basics */}
            <div className="flex items-start gap-3.5 min-w-[240px]">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                {invoice.customer.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">
                    {invoice.customer.name}
                  </span>
                  <PriorityBadge priority={invoice.priority} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-slate-600">{invoice.invoiceNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <Clock className="w-3 h-3" /> {invoice.daysOverdue}d overdue
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.formattedAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Blocker & Recommended Action */}
            <div className="flex-1 lg:px-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <StatusBadge status={invoice.status} size="sm" />
                <BlockerBadge blocker={invoice.blocker} />
                <span className="text-[11px] text-slate-400">
                  Confidence: {invoice.blockerConfidence}%
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-700 bg-indigo-50/60 rounded-md p-2 border border-indigo-100/70">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="line-clamp-1">
                  <span className="font-medium text-indigo-950">Action: </span>
                  {invoice.recommendedAction}
                </p>
              </div>
            </div>

            {/* Right: CTA button */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <Link
                to={`/invoices/${invoice.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Review & Recover</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
