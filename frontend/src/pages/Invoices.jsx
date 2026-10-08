import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { invoiceService } from "../services/api";
import InvoiceTable from "../components/invoices/InvoiceTable";
import ErrorState from "../components/common/ErrorState";
import { Plus, Search, RefreshCw, X } from "lucide-react";

const STATUSES = ["All", "Blocked", "Recovery Ready", "Overdue", "Pending", "Paid"];
const BLOCKERS = [
  "All",
  "Missing documentation",
  "Invoice dispute",
  "Approval pending",
  "Payment processing issue",
  "Customer clarification required",
  "Other",
];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [blockerFilter, setBlockerFilter] = useState("All");

  const loadAllInvoices = () => {
    setLoading(true);
    setError("");
    invoiceService
      .getAll()
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load invoices.");
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    invoiceService
      .getAll()
      .then((data) => {
        if (isMounted) {
          setInvoices(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Unable to load invoices.");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.name.toLowerCase().includes(q) ||
          inv.customer.contactName.toLowerCase().includes(q) ||
          inv.customer.contactEmail.toLowerCase().includes(q) ||
          inv.blocker.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    if (blockerFilter !== "All") {
      result = result.filter((inv) =>
        inv.blocker.toLowerCase().includes(blockerFilter.toLowerCase())
      );
    }

    return result;
  }, [invoices, search, statusFilter, blockerFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setBlockerFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoices Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage receivables, detect collection bottlenecks, and inspect AI recovery workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAllInvoices}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Ledger</span>
          </button>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Invoice</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, invoice #, or blocker keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              {STATUSES.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Blocker Filter */}
          <div className="md:col-span-3">
            <select
              value={blockerFilter}
              onChange={(e) => setBlockerFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Blocker Categories</option>
              {BLOCKERS.filter((b) => b !== "All").map((b) => (
                <option key={b} value={b}>
                  Blocker: {b}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex items-center">
            {(search || statusFilter !== "All" || blockerFilter !== "All") && (
              <button
                onClick={clearFilters}
                className="w-full py-2 px-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                title="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="md:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick status tabs pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Quick Filter:</span>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadAllInvoices} />
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-slate-900">No invoices yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Create your first invoice to start monitoring payments and using AI-powered recovery.
          </p>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Invoice
          </Link>
        </div>
      ) : (
        <InvoiceTable invoices={filteredInvoices} />
      )}
    </div>
  );
}
