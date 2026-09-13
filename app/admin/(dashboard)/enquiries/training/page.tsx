"use client";

import { EnquiryManager } from "@/components/admin/enquiry-manager";

export default function TrainingEnquiriesPage() {
  return (
    <EnquiryManager
      title="Training Enquiries"
      description="Manage training registrations and enquiries."
      apiBase="/api/admin/enquiries/training"
      statusOptions={["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"]}
      columns={[
        { key: "referenceNo", label: "Reference" },
        { key: "studentName", label: "Student" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "courseName", label: "Course" },
        { key: "trainingMode", label: "Mode" },
        {
          key: "createdAt",
          label: "Received",
          render: (r) => new Date(r.createdAt as string).toLocaleDateString(),
        },
      ]}
    />
  );
}
