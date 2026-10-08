import React from "react";
import { Brain, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

const STAGES = [
  {
    id: "Analyze",
    step: 1,
    name: "Analyze",
    desc: "Ingests invoice & customer communication",
    icon: Brain,
  },
  {
    id: "Detect Blocker",
    step: 2,
    name: "Detect Blocker",
    desc: "Identifies why payment is stuck",
    icon: ShieldAlert,
  },
  {
    id: "Recommend Action",
    step: 3,
    name: "Recommend Action",
    desc: "Formulates optimal recovery strategy",
    icon: Sparkles,
  },
  {
    id: "Recover",
    step: 4,
    name: "Recover",
    desc: "Initiates action & recovers cash",
    icon: CheckCircle2,
  },
];

// Helper to determine stage status given the active workflowStage string
function getStageStatus(stageIndex, currentStage) {
  const stageMap = {
    Analyze: 0,
    "Detect Blocker": 1,
    "Recommend Action": 2,
    Recover: 3,
    "Recovery Ready": 3,
    Recovered: 4,
  };

  const currentIndex = stageMap[currentStage] ?? 2;

  if (stageIndex < currentIndex) {
    return "Completed";
  } else if (stageIndex === currentIndex) {
    return "Current";
  } else {
    return "Pending";
  }
}

export default function WorkflowPipeline({ currentStage = "Recommend Action" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recovery Pipeline Status
          </h3>
          <p className="text-xs text-slate-500">
            Real-time stage progression across PayFlow's 4-step recovery architecture
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1 text-indigo-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> Current
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Pending
          </span>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(idx, currentStage);
          const Icon = stage.icon;

          // Stage styling
          let cardStyle = "bg-slate-50/70 border-slate-200 text-slate-400";
          let badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
          let iconStyle = "bg-slate-100 text-slate-400 border-slate-200";

          if (status === "Completed") {
            cardStyle = "bg-emerald-50/40 border-emerald-200 text-slate-700";
            badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
            iconStyle = "bg-emerald-600 text-white border-emerald-600";
          } else if (status === "Current") {
            cardStyle = "bg-indigo-50/70 border-indigo-300 text-slate-900 shadow-2xs ring-1 ring-indigo-500/20";
            badgeStyle = "bg-indigo-600 text-white border-indigo-600";
            iconStyle = "bg-indigo-600 text-white border-indigo-600";
          }

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${cardStyle}`}
            >
              <div>
                {/* Top header with status badge and icon */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}
                  >
                    {status}
                  </span>
                  <div className={`p-2 rounded-lg border ${iconStyle}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500 mb-0.5">
                  Stage 0{stage.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {stage.name}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {/* Subdued connector arrow for larger screens */}
              {idx < STAGES.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 font-bold text-xs pointer-events-none">
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
