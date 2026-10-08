import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  title = "Unable to load PayFlow data",
  message = "Something went wrong while contacting the server.",
  onRetry,
}) {
  return (
    <div className="p-10 text-center bg-white rounded-xl border border-slate-200" role="alert">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
        >
          Try again
        </button>
      )}
    </div>
  );
}
