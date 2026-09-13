"use client";

import { CrudManager } from "@/components/admin/crud-manager";

export default function MachiningServicesAdminPage() {
  return (
    <CrudManager
      title="Machining Services"
      description="Manage the CNC / VMC / 3D Printing service descriptions shown on the public Machining page."
      apiBase="/api/admin/machining/services"
      listKey="services"
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "category", label: "Category", type: "select", options: ["CNC", "VMC", "3D_PRINTING"], required: true },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", fullWidth: true },
        { name: "materials", label: "Materials", type: "text", fullWidth: true },
        { name: "applications", label: "Applications", type: "text", fullWidth: true },
        { name: "capabilities", label: "Capabilities / Specifications", type: "textarea", fullWidth: true },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
      ]}
    />
  );
}
