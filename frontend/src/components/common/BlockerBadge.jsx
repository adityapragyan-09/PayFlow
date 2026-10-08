import React from "react";
import { AlertCircle, FileQuestion, Clock, CreditCard, HelpCircle, CheckCircle2 } from "lucide-react";

const BLOCKER_CONFIGS = {
  "Cash flow issue": {
    bg: "bg-amber-50 text-amber-800 border-amber-200/80",
    icon: Clock,
  },
  "Invoice dispute": {
    bg: "bg-rose-50 text-rose-800 border-rose-200/80",
    icon: AlertCircle,
  },
  "Missing documentation": {
    bg: "bg-orange-50 text-orange-800 border-orange-200/80",
    icon: FileQuestion,
  },
  "Approval pending": {
    bg: "bg-blue-50 text-blue-800 border-blue-200/80",
    icon: Clock,
  },
  "Payment processing issue": {
    bg: "bg-purple-50 text-purple-800 border-purple-200/80",
    icon: CreditCard,
  },
  "Customer clarification required": {
    bg: "bg-sky-50 text-sky-800 border-sky-200/80",
    icon: HelpCircle,
  },
  None: {
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    icon: CheckCircle2,
  },
};

export default function BlockerBadge({ blocker }) {
  if (!blocker || blocker === "None") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
        No Blocker
      </span>
    );
  }

  // Handle resolved blockers
  if (blocker.toLowerCase().includes("resolved")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Resolved
      </span>
    );
  }

  const config = BLOCKER_CONFIGS[blocker] || {
    bg: "bg-slate-50 text-slate-700 border-slate-200",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} whitespace-nowrap`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{blocker}</span>
    </span>
  );
}
