import React, { useState } from "react";
import { Copy, Check, Send, Sparkles, Edit3 } from "lucide-react";

export default function ResponseDraftCard({ responseDraft, onSendRecovery }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(responseDraft?.body || "");

  if (!responseDraft) return null;

  const handleCopy = () => {
    const textToCopy = isEditing ? draftText : responseDraft.body;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        // graceful ignore
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Generated Customer Response
            </h3>
            <p className="text-[11px] text-slate-500">
              Tone: <span className="font-medium text-slate-700">{responseDraft.tone}</span> • Target: <span className="font-medium text-slate-700">{responseDraft.targetAudience}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit toggle */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Preview" : "Edit"}</span>
          </button>

          {/* Copy Response Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-2xs transition-all ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Response</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subject Line */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Subject: </span>
        <span className="font-mono text-slate-900">{responseDraft.subject}</span>
      </div>

      {/* Content */}
      <div className="p-5">
        {isEditing ? (
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={10}
            className="w-full text-xs sm:text-sm font-sans text-slate-800 p-3 rounded-lg border border-indigo-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed"
          />
        ) : (
          <div className="text-xs sm:text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/40 p-4 rounded-lg border border-slate-200/60">
            {draftText || responseDraft.body}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Engine calibrated to maximize recovery likelihood while preserving relationship goodwill.
          </span>
          {onSendRecovery && (
            <button
              type="button"
              onClick={onSendRecovery}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via PayFlow Gateway</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
