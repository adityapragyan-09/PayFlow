import React from "react";
import { Sparkles, Brain, CheckCircle2, Lightbulb } from "lucide-react";
import BlockerBadge from "../common/BlockerBadge";
import ConfidenceBar from "../common/ConfidenceBar";

export default function AiAnalysisCard({ analysis, blocker }) {
  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 via-white to-white rounded-xl border-2 border-indigo-200/90 shadow-sm overflow-hidden">
      {/* Header with AI accent */}
      <div className="bg-indigo-600 px-5 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white/20">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              PayFlow Neural Analysis
            </h3>
            <p className="text-[11px] text-indigo-100">
              Autonomous Root-Cause Diagnostic & Strategy Recommendation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-indigo-700/80 px-2.5 py-1 rounded-md border border-indigo-400/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-semibold">AI Verified</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Top Grid: Detected Blocker & Confidence Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          {/* Detected Blocker */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              AI Detected Blocker
            </div>
            <div className="flex items-center gap-2">
              <BlockerBadge blocker={analysis.detectedBlocker || blocker} />
            </div>
            {analysis.sentiment && (
              <p className="text-xs text-slate-500 mt-2">
                <span className="font-medium text-slate-700">Sentiment: </span>
                {analysis.sentiment}
              </p>
            )}
          </div>

          {/* AI Confidence */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Model Confidence
              </span>
              <span className="text-xs font-bold text-indigo-600">
                High Precision
              </span>
            </div>
            <div className="py-1">
              <ConfidenceBar confidence={analysis.confidence} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cross-checked against contract terms, AP history, and correspondence.
            </p>
          </div>
        </div>

        {/* Reason / Diagnostic Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Root Cause Reason</span>
          </div>
          <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {analysis.reason}
          </div>
        </div>

        {/* Key Signals Extracted */}
        {analysis.keySignals && analysis.keySignals.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Corroborating Evidence Signals:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.keySignals.map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 bg-white p-2 rounded-md border border-slate-200/70"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prominent Recommended Action Box */}
        <div className="bg-indigo-900 text-white rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Recommended Recovery Action
            </span>
            <span className="text-[11px] bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700">
              Optimal Strategy
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-white leading-snug">
            {analysis.recommendedAction}
          </p>
        </div>
      </div>
    </div>
  );
}
