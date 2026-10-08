import React from "react";
import { Mail, Clock, UserCheck } from "lucide-react";

export default function CustomerMessageCard({ communication, customer }) {
  if (!communication) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-400 text-sm">
        No external communication recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header styled like a premium enterprise communications client */}
      <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <Mail className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Customer Communication Ingested
            </span>
            <span className="ml-2 text-[11px] text-slate-500 font-mono">
              via {communication.channel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{communication.date}</span>
        </div>
      </div>

      {/* Message Metadata */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-400">From: </span>
          <span className="font-semibold text-slate-900">{communication.sender}</span>
          <span className="text-slate-400 ml-1">({customer.contactEmail})</span>
        </div>
        <div className="text-slate-700 font-medium truncate">
          <span className="text-slate-400">Subject: </span>
          <span className="text-slate-900">{communication.subject}</span>
        </div>
      </div>

      {/* Message Body */}
      <div className="p-5 bg-slate-50/30">
        <div className="bg-white rounded-lg p-4 border border-slate-200/70 shadow-2xs text-slate-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans">
          {communication.body}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified sender: {customer.domain}
          </span>
          <span>Parsed by PayFlow Ingestion Gateway</span>
        </div>
      </div>
    </div>
  );
}
