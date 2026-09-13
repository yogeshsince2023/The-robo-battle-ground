"use client";

import { CrudManager } from "@/components/admin/crud-manager";
import { StatusBadge } from "@/components/ui/status-badge";

export default function CertificatesAdminPage() {
  return (
    <CrudManager
      title="Certificates"
      description="Issue and manage training certificates. Students verify these on the public Certificate Verification page."
      apiBase="/api/admin/certificates"
      listKey="certificates"
      columns={[
        { key: "certificateId", label: "Certificate ID" },
        { key: "studentName", label: "Student" },
        { key: "courseName", label: "Course" },
        {
          key: "issueDate",
          label: "Issue Date",
          render: (r) => new Date(r.issueDate as string).toLocaleDateString(),
        },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
      ]}
      fields={[
        { name: "certificateId", label: "Certificate ID", type: "text", required: true, placeholder: "RB-TRAIN-2026-00125" },
        { name: "studentName", label: "Student Name", type: "text", required: true },
        { name: "courseName", label: "Training Program", type: "text", required: true },
        { name: "trainingDuration", label: "Training Duration", type: "text", placeholder: "e.g. 6 weeks" },
        { name: "issueDate", label: "Issue Date", type: "date", required: true },
        { name: "completionDate", label: "Completion Date", type: "date" },
        { name: "status", label: "Certificate Status", type: "select", options: ["VALID", "REVOKED", "EXPIRED"] },
        { name: "certificateFileUrl", label: "Certificate File URL (optional)", type: "text", fullWidth: true },
      ]}
    />
  );
}
