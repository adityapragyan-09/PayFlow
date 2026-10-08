import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Brain,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function PipelineBanner() {
  const steps = [
    {
      num: "01",
      name: "Overdue Invoice",
      desc: "Unpaid or delayed payment",
      icon: FileText,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    },
    {
      num: "02",
      name: "AI Analysis",
      desc: "Ingests emails, portal & tickets",
      icon: Brain,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
    {
      num: "03",
      name: "Detect Blocker",
      desc: "Cash flow, dispute or approvals",
      icon: ShieldAlert,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      num: "04",
      name: "Recommend Action",
      desc: "Tailored resolution response",
      icon: Sparkles,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      num: "05",
      name: "Recover Funds",
      desc: "Automated dispatch & settlement",
      icon: CheckCircle,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Autonomous Recovery Pipeline
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            How PayFlow Recovers Blocked Revenue
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Instead of generic dunning emails, PayFlow diagnoses the exact blocker behind every unpaid invoice and generates tailored, high-conversion recovery actions.
          </p>
        </div>

        <Link
          to="/recovery"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors shrink-0 shadow-md shadow-indigo-600/30 self-start md:self-auto"
        >
          <span>Explore Pipeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/60 rounded-xl p-3.5 relative flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    STEP {step.num}
                  </span>
                  <div className={`p-1.5 rounded-md ${step.color} border`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-slate-100">
                  {step.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-indigo-400/60 font-bold">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
