import React from "react";

export default function ConfidenceBar({ confidence = 85, showLabel = true }) {
  // Determine gradient color based on confidence score
  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700";
  let badgeBg = "bg-emerald-50 border-emerald-200";

  if (confidence < 70) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700";
    badgeBg = "bg-amber-50 border-amber-200";
  } else if (confidence < 85) {
    barColor = "bg-indigo-500";
    textColor = "text-indigo-700";
    badgeBg = "bg-indigo-50 border-indigo-200";
  }

  return (
    <div className="flex items-center gap-3 w-full max-w-[200px]">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeBg} ${textColor} shrink-0`}
        >
          {confidence}%
        </span>
      )}
    </div>
  );
}
