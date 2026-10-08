import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { invoiceService } from "../../services/api";
import {
  LayoutDashboard,
  Receipt,
  GitBranch,
  Activity,
  Bot,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
    badgeKey: null,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: Receipt,
    badge: null,
    badgeKey: "invoices",
  },
  {
    name: "Recovery Queue",
    path: "/recovery",
    icon: GitBranch,
    badge: null,
    badgeKey: "queue",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Activity",
    path: "/activity",
    icon: Activity,
    badge: "Live",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [counts, setCounts] = useState({ invoices: null, queue: null, confidence: null });

  useEffect(() => {
    let cancelled = false;
    invoiceService
      .getAll()
      .then((rows) => {
        if (cancelled) return;
        const queue = rows.filter(
          (invoice) =>
            invoice.status === "Blocked" ||
            invoice.status === "Recovery Ready" ||
            invoice.status === "Overdue"
        );
        const confidenceValues = rows
          .map((invoice) => invoice.blockerConfidence)
          .filter((value) => value > 0);
        const confidence = confidenceValues.length
          ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
          : null;
        setCounts({
          invoices: rows.length,
          queue: queue.length,
          confidence,
        });
      })
      .catch(() => {
        if (!cancelled) setCounts({ invoices: null, queue: null, confidence: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white tracking-tight">PayFlow</span>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Payment Recovery System</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {(item.badge || (item.badgeKey && counts[item.badgeKey] != null)) && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badgeKey ? counts[item.badgeKey] : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* AI System Status widget */}
        <div className="p-4 m-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">PayFlow Neural Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Continuously analyzing B2B customer communications and automating recovery workflows.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Avg. Confidence</span>
            <span className="font-semibold text-emerald-400">
              {counts.confidence == null ? "—" : `${counts.confidence}%`}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Hackathon MVP v1.0</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Bot className="h-3.5 w-3.5 text-indigo-400" /> Auto-Pilot
          </span>
        </div>
      </aside>
    </>
  );
}
