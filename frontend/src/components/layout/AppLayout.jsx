import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const ROUTE_TITLES = {
  "/dashboard": "Overview",
  "/invoices": "Invoices Directory",
  "/recovery": "Recovery Pipeline & Queue",
  "/activity": "Activity Audit Log",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Find matching title for breadcrumb/header
  let currentTitle = "PayFlow";
  if (location.pathname.startsWith("/invoices/")) {
    currentTitle = "Invoice Intelligence";
  } else if (ROUTE_TITLES[location.pathname]) {
    currentTitle = ROUTE_TITLES[location.pathname];
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} title={currentTitle} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
