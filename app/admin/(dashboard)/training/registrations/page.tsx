"use client";

import { EnquiryManager } from "@/components/admin/enquiry-manager";

export default function TrainingRegistrationsPage() {
  return (
    <EnquiryManager
      title="Training Registrations"
      description="All student registrations and enquiries for training courses."
      apiBase="/api/admin/enquiries/training"
      statusOptions={["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"]}
      columns={[
        { key: "referenceNo", label: "Reference" },
        { key: "studentName", label: "Student" },
        { key: "organization", label: "College/Org" },
        { key: "courseName", label: "Course" },
        { key: "preferredBatch", label: "Preferred Batch" },
        {
          key: "createdAt",
          label: "Received",
          render: (r) => new Date(r.createdAt as string).toLocaleDateString(),
        },
      ]}
    />
  );
}
