import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import BlockerBadge from "../common/BlockerBadge";

export default function InvoiceTable({ invoices = [], emptyLabel = "No invoices found matching current filter criteria." }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Detected Blocker</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  tabIndex={0}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/invoices/${inv.id}`);
                    }
                  }}
                  className="hover:bg-slate-50/90 focus:bg-indigo-50/60 focus:outline-hidden transition-colors cursor-pointer group"
                >
                  {/* Invoice # */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {inv.invoiceNumber}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0 border border-slate-200">
                        {inv.customer.initials}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 leading-tight">
                          {inv.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inv.customer.domain}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {inv.formattedAmount}
                  </td>

                  {/* Due Date & Overdue Tag */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                    <div>{inv.dueDate}</div>
                    {inv.daysOverdue > 0 ? (
                      <span className="text-[11px] font-medium text-rose-600">
                        {inv.daysOverdue}d overdue
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Within terms</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>

                  {/* Blocker */}
                  <td className="py-3.5 px-4">
                    <BlockerBadge blocker={inv.blocker} />
                  </td>

                  {/* Recommended Action */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-slate-700 truncate" title={inv.recommendedAction}>
                      {inv.recommendedAction}
                    </p>
                  </td>

                  {/* Action / View */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/invoices/${inv.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>View Invoice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
