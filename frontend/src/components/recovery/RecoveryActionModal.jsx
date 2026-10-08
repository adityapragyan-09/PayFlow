import React, { useState } from "react";
import { X, Send, ShieldCheck, Clock } from "lucide-react";

export default function RecoveryActionModal({ invoice, isOpen, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleOption, setScheduleOption] = useState("immediate");
  const [includePortalLink, setIncludePortalLink] = useState(true);

  if (!isOpen || !invoice) return null;

  const handleExecute = async () => {
    setIsSubmitting(true);
    await onConfirm({
      scheduleOption,
      includePortalLink,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Send className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Initiate Payment Recovery
              </h3>
              <p className="text-xs text-indigo-200">
                Invoice {invoice.invoiceNumber} • {invoice.customer.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Recovery Action Summary */}
          <div className="bg-indigo-50/70 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold mb-1">
              <span>Strategy to Dispatch:</span>
              <span className="font-bold text-indigo-700">{invoice.formattedAmount}</span>
            </div>
            <p className="text-sm font-bold text-indigo-950 leading-snug">
              {invoice.recommendedAction}
            </p>
          </div>

          {/* Delivery Configuration */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recipient Target:
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900">
                    {invoice.customer.contactName}
                  </span>
                  <span className="text-slate-500 ml-1">
                    ({invoice.customer.contactEmail})
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Contact
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Dispatch Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleOption("immediate")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    scheduleOption === "immediate"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Send Instantly</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Deliver right now via email & AP gateway
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleOption("scheduled")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    scheduleOption === "scheduled"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Business Hours</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Deliver tomorrow at 09:00 AM recipient time
                  </div>
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includePortalLink}
                onChange={(e) => setIncludePortalLink(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">
                Include 1-click PayFlow instant settlement / signature link
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Recovery...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Dispatch Recovery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
