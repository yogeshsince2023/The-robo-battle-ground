"use client";

import { EnquiryManager } from "@/components/admin/enquiry-manager";

export default function ContactMessagesPage() {
  return (
    <EnquiryManager
      title="Contact Messages"
      description="General messages submitted through the website contact form."
      apiBase="/api/admin/enquiries/contact"
      statusOptions={["NEW", "READ", "RESPONDED", "ARCHIVED"]}
      columns={[
        { key: "referenceNo", label: "Reference" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "subject", label: "Subject" },
        {
          key: "message",
          label: "Message",
          render: (r) => (
            <span className="max-w-xs truncate block text-xs" title={String(r.message || "")}>
              {String(r.message || "—")}
            </span>
          ),
        },
        {
          key: "createdAt",
          label: "Received",
          render: (r) => (r.createdAt ? new Date(r.createdAt as string).toLocaleDateString() : "—"),
        },
      ]}
    />
  );
}
