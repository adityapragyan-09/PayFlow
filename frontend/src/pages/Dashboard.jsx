import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { invoiceService, recoveryService } from "../services/api";
import KpiCard from "../components/dashboard/KpiCard";
import PipelineBanner from "../components/dashboard/PipelineBanner";
import RecoveryQueue from "../components/dashboard/RecoveryQueue";
import InvoiceTable from "../components/invoices/InvoiceTable";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [recoveryQueue, setRecoveryQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpiData, invoiceList, queueList] = await Promise.all([
          invoiceService.getKpis(),
          invoiceService.getAll(),
          recoveryService.getRecoveryQueue(),
        ]);
        setKpis(kpiData);
        setInvoices(invoiceList);
        setRecoveryQueue(queueList);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading PayFlow Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Concept Banner */}
      <PipelineBanner />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Receivables"
          value={kpis.totalReceivables.value}
          change={kpis.totalReceivables.change}
          subtext={kpis.totalReceivables.subtext}
        />
        <KpiCard
          title="Overdue Amount"
          value={kpis.overdueAmount.value}
          change={kpis.overdueAmount.change}
          subtext={kpis.overdueAmount.subtext}
        />
        <KpiCard
          title="Blocked Invoices"
          value={kpis.blockedInvoices.value}
          change={kpis.blockedInvoices.change}
          subtext={kpis.blockedInvoices.subtext}
        />
        <KpiCard
          title="Recovery Opportunity"
          value={kpis.recoveryOpportunity.value}
          change={kpis.recoveryOpportunity.change}
          subtext={kpis.recoveryOpportunity.subtext}
        />
      </div>

      {/* High-Attention Recovery Queue */}
      <RecoveryQueue queue={recoveryQueue} />

      {/* Invoices Directory Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              All Receivables & Payment Statuses
            </h3>
            <p className="text-xs text-slate-500">
              Click any invoice row to inspect customer communications and AI root-cause analysis.
            </p>
          </div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
          >
            <span>View All {invoices.length} Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
