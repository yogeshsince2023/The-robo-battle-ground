"use client";

import { CrudManager } from "@/components/admin/crud-manager";

export default function TrainingCoursesAdminPage() {
  return (
    <CrudManager
      title="Training Courses"
      description="Manage the training programs shown on the public Training page."
      apiBase="/api/admin/training/courses"
      listKey="courses"
      columns={[
        { key: "name", label: "Name" },
        { key: "duration", label: "Duration" },
        { key: "mode", label: "Mode" },
        { key: "fees", label: "Fees" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "name", label: "Course Name", type: "text", required: true },
        { name: "shortDescription", label: "Short Description", type: "textarea", fullWidth: true },
        { name: "detailedDescription", label: "Detailed Description", type: "textarea", fullWidth: true },
        { name: "duration", label: "Duration", type: "text", placeholder: "e.g. 6 weeks" },
        { name: "mode", label: "Mode", type: "select", options: ["Online", "Offline", "Hybrid"] },
        { name: "fees", label: "Fees", type: "text", placeholder: "e.g. ₹8,000" },
        { name: "eligibility", label: "Eligibility", type: "text" },
        { name: "skillsCovered", label: "Skills Covered (comma separated)", type: "text", fullWidth: true },
        { name: "modules", label: "Training Modules (JSON array, optional)", type: "textarea", fullWidth: true },
        { name: "certificateAvailable", label: "Certificate Available", type: "checkbox" },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
      ]}
    />
  );
}
