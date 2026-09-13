"use client";

import { EnquiryManager } from "@/components/admin/enquiry-manager";

export default function ArenaEnquiriesPage() {
  return (
    <EnquiryManager
      title="Arena Enquiries"
      description="Manage incoming Robowar Arena booking and event enquiries."
      apiBase="/api/admin/enquiries/arena"
      statusOptions={["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"]}
      columns={[
        { key: "referenceNo", label: "Reference" },
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "eventName", label: "Event" },
        {
          key: "eventDate",
          label: "Event Date",
          render: (r) => (r.eventDate ? new Date(r.eventDate as string).toLocaleDateString() : "—"),
        },
        { key: "robotCategory", label: "Arena Category", render: (r) => (r.robotCategory as string) || "—" },
        { key: "expectedRobots", label: "Robots" },
        {
          key: "createdAt",
          label: "Received",
          render: (r) => new Date(r.createdAt as string).toLocaleDateString(),
        },
      ]}
    />
  );
}
