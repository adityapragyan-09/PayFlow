import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { invoiceService } from "../services/api";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const EMPTY_FORM = {
  invoice_number: "",
  customer_name: "",
  customer_email: "",
  customer_company: "",
  amount: "",
  currency: "INR",
  issue_date: "2026-10-08",
  due_date: "",
  payment_terms: "",
  purchase_order: "",
  description: "",
  notes: "",
};

function Field({ label, required, children, error }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      {children}
      {error ? <span className="block text-[11px] font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.invoice_number.trim()) next.invoice_number = "Invoice number is required.";
    if (!form.customer_name.trim()) next.customer_name = "Customer name is required.";
    if (!form.customer_company.trim()) next.customer_company = "Customer company is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email.trim())) {
      next.customer_email = "Enter a valid email address.";
    }
    const amount = Number(form.amount);
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      next.amount = "Amount must be greater than 0.";
    }
    if (!/^[A-Z]{3}$/.test(form.currency)) next.currency = "Choose a valid currency.";
    if (!form.issue_date) next.issue_date = "Issue date is required.";
    if (!form.due_date) next.due_date = "Due date is required.";
    if (form.issue_date && form.due_date && form.due_date < form.issue_date) {
      next.due_date = "Due date cannot be earlier than the issue date.";
    }
    if (!form.payment_terms.trim()) next.payment_terms = "Payment terms are required.";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const created = await invoiceService.create({
        invoice_number: form.invoice_number.trim(),
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_company: form.customer_company.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        issue_date: form.issue_date,
        due_date: form.due_date,
        payment_terms: form.payment_terms.trim(),
        purchase_order: form.purchase_order.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
      });
      navigate(`/invoices/${created.id}`);
    } catch (error) {
      setFormError(error.message || "The invoice could not be created.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to invoices
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Invoice</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Add a receivable. PayFlow can then analyze the payment and recommend a recovery action.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        {formError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {formError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Invoice Number" required error={errors.invoice_number}>
            <input className={inputClass} value={form.invoice_number} onChange={(e) => setField("invoice_number", e.target.value)} placeholder="INV-2026-001" />
          </Field>
          <Field label="Customer Company" required error={errors.customer_company}>
            <input className={inputClass} value={form.customer_company} onChange={(e) => setField("customer_company", e.target.value)} placeholder="Demo Technologies Pvt Ltd" />
          </Field>
          <Field label="Customer Name" required error={errors.customer_name}>
            <input className={inputClass} value={form.customer_name} onChange={(e) => setField("customer_name", e.target.value)} placeholder="Demo Technologies" />
          </Field>
          <Field label="Customer Email" required error={errors.customer_email}>
            <input type="email" className={inputClass} value={form.customer_email} onChange={(e) => setField("customer_email", e.target.value)} placeholder="finance@demotechnologies.com" />
          </Field>
          <Field label="Invoice Amount" required error={errors.amount}>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setField("amount", e.target.value)} placeholder="25000" />
          </Field>
          <Field label="Currency" required error={errors.currency}>
            <select className={inputClass} value={form.currency} onChange={(e) => setField("currency", e.target.value)}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </Field>
          <Field label="Issue Date" required error={errors.issue_date}>
            <input type="date" className={inputClass} value={form.issue_date} onChange={(e) => setField("issue_date", e.target.value)} />
          </Field>
          <Field label="Due Date" required error={errors.due_date}>
            <input type="date" className={inputClass} value={form.due_date} onChange={(e) => setField("due_date", e.target.value)} />
          </Field>
          <Field label="Payment Terms" required error={errors.payment_terms}>
            <input className={inputClass} value={form.payment_terms} onChange={(e) => setField("payment_terms", e.target.value)} placeholder="Net 12" />
          </Field>
          <Field label="Purchase Order Number" error={errors.purchase_order}>
            <input className={inputClass} value={form.purchase_order} onChange={(e) => setField("purchase_order", e.target.value)} placeholder="Optional" />
          </Field>
        </div>

        <Field label="Invoice Description">
          <textarea className={`${inputClass} min-h-20`} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="What this invoice is for" />
        </Field>
        <Field label="Notes">
          <textarea className={`${inputClass} min-h-20`} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Optional context for AI analysis" />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/invoices" className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
