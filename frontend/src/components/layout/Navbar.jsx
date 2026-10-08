import React from "react";
import { Menu, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ onOpenSidebar, title = "Dashboard" }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Hackathon banner indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs text-indigo-700 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Autonomous Payment Recovery</span>
        </div>

        {/* Quick link to Recovery Queue */}
        <Link
          to="/recovery"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <span>Recovery Queue</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
