import React from "react";

const STATUS_CONFIGS = {
  Paid: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Pending: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  Overdue: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Blocked: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  "Recovery Ready": {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const config = STATUS_CONFIGS[status] || {
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  };

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : "text-xs font-medium px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
