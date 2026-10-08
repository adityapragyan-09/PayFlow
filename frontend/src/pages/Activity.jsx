import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityService } from "../services/api";
import ErrorState from "../components/common/ErrorState";
import {
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

const CATEGORY_MAP = {
  all: "All Events",
  ai: "AI Diagnostics",
  blocker: "Blocker Alerts",
  recovery: "Recovery Outreach",
  communication: "Communications",
  success: "Settlements",
};

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadActivity = () => {
    let cancelled = false;
    activityService
      .getGlobalActivity()
      .then((data) => {
        if (cancelled) return;
        setActivities(data);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Unable to load activity.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => loadActivity(), []);

  const filtered =
    selectedCategory === "all"
      ? activities
      : activities.filter((act) => act.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Audit Stream
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            System Activity Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time chronological telemetry across invoice ingestion, AI diagnostics, and recovery dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Auto-syncing with ERP & Mail Gateways</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Activities Feed Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading activity events...
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadActivity} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No events found in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">
                      {item.eventName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.timestamp}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.statusBadge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="font-semibold text-slate-800">
                      {item.customer}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-600 font-medium">
                      {item.invoiceNumber}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-900">
                      {item.amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* View invoice link */}
              <div className="self-end sm:self-center shrink-0">
                <Link
                  to={`/invoices/${item.invoiceId || item.invoiceNumber}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <span>Inspect Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
