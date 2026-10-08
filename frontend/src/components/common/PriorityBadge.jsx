import React from "react";

const PRIORITY_STYLES = {
  Critical: "text-rose-700 bg-rose-50 border-rose-200",
  High: "text-amber-700 bg-amber-50 border-amber-200",
  Medium: "text-blue-700 bg-blue-50 border-blue-200",
  Low: "text-slate-600 bg-slate-50 border-slate-200",
};

export default function PriorityBadge({ priority = "Medium" }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${style}`}
    >
      {priority}
    </span>
  );
}
