import React from "react";
import { DollarSign, AlertTriangle, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

const ICON_MAP = {
  "Total Receivables": DollarSign,
  "Overdue Amount": AlertTriangle,
  "Blocked Invoices": ShieldAlert,
  "Recovery Opportunity": Sparkles,
};

const COLOR_MAP = {
  "Total Receivables": {
    iconBg: "bg-blue-50 text-blue-600",
    badge: "text-slate-600 bg-slate-100",
  },
  "Overdue Amount": {
    iconBg: "bg-amber-50 text-amber-600",
    badge: "text-rose-700 bg-rose-50 border-rose-100",
  },
  "Blocked Invoices": {
    iconBg: "bg-rose-50 text-rose-600",
    badge: "text-amber-700 bg-amber-50 border-amber-100",
  },
  "Recovery Opportunity": {
    iconBg: "bg-indigo-50 text-indigo-600",
    badge: "text-emerald-700 bg-emerald-50 border-emerald-100",
  },
};

export default function KpiCard({ title, value, change, subtext }) {
  const Icon = ICON_MAP[title] || TrendingUp;
  const colors = COLOR_MAP[title] || {
    iconBg: "bg-slate-100 text-slate-700",
    badge: "text-slate-600 bg-slate-100",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate">{subtext}</span>
        {change && (
          <span
            className={`font-medium px-2 py-0.5 rounded border text-[11px] whitespace-nowrap ml-2 ${colors.badge}`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
