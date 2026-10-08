import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import RecoveryWorkflow from "./pages/RecoveryWorkflow";
import Activity from "./pages/Activity";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="recovery" element={<RecoveryWorkflow />} />
          <Route path="activity" element={<Activity />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
