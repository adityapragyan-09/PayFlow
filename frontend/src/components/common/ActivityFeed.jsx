import React from "react";
import {
  FileText,
  Brain,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
} from "lucide-react";

const EVENT_ICON_MAP = {
  system: {
    icon: FileText,
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },
  communication: {
    icon: MessageSquare,
    style: "bg-blue-50 text-blue-600 border-blue-200",
  },
  ai: {
    icon: Brain,
    style: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  warning: {
    icon: AlertTriangle,
    style: "bg-amber-50 text-amber-600 border-amber-200",
  },
  recovery: {
    icon: Send,
    style: "bg-purple-50 text-purple-600 border-purple-200",
  },
  success: {
    icon: CheckCircle2,
    style: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
};

export default function ActivityFeed({ events = [], title = "Activity Timeline" }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
        No activity recorded.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{title}</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {events.map((evt) => {
          const config = EVENT_ICON_MAP[evt.type] || EVENT_ICON_MAP.system;
          const Icon = config.icon;

          return (
            <div key={evt.id} className="relative group">
              {/* Event node bullet */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${config.style} shadow-2xs`}
              >
                <Icon className="w-3 h-3" />
              </div>

              {/* Event content */}
              <div className="text-xs">
                <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                  <span className="font-semibold text-slate-900 text-sm">
                    {evt.eventName}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {evt.timestamp}
                  </span>
                  {evt.actor && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {evt.actor}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
