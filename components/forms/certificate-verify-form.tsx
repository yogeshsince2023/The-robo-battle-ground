"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search } from "lucide-react";

type VerifyResult = {
  found: boolean;
  certificate?: {
    certificateId: string;
    studentName: string;
    courseName: string;
    trainingDuration: string | null;
    issueDate: string;
    completionDate: string | null;
    status: string;
  };
};

export function CertificateVerifyForm({ compact = false }: { compact?: boolean }) {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!certificateId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/certificates/verify?certificateId=${encodeURIComponent(certificateId.trim())}`
      );
      const json = await res.json();
      setResult(json);
    } catch {
      setResult({ found: false });
    } finally {
      setLoading(false);
    }
  }

  const wrapperClass = compact ? "" : "mx-auto max-w-xl";
  const formClass = compact
    ? "flex flex-col gap-2 sm:flex-row"
    : "card flex flex-col gap-3 sm:flex-row";
  const resultClass = compact ? "mt-4 rounded-lg border border-border p-4" : "card mt-6";

  return (
    <div className={wrapperClass}>
      <form onSubmit={handleVerify} className={formClass}>
        <input
          className="input flex-1"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          <Search size={16} /> {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {result && (
        <div className={resultClass}>
          {result.found && result.certificate ? (
            <div>
              <div className="mb-4 flex items-center gap-2 text-success">
                <CheckCircle2 size={22} />
                <span className="text-lg font-semibold">Certificate Verified</span>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Field label="Certificate Number" value={result.certificate.certificateId} />
                <Field label="Student Name" value={result.certificate.studentName} />
                <Field label="Training Program" value={result.certificate.courseName} />
                <Field label="Training Duration" value={result.certificate.trainingDuration || "—"} />
                <Field
                  label="Issue Date"
                  value={new Date(result.certificate.issueDate).toLocaleDateString()}
                />
                <Field
                  label="Completion Date"
                  value={
                    result.certificate.completionDate
                      ? new Date(result.certificate.completionDate).toLocaleDateString()
                      : "—"
                  }
                />
                <Field label="Certificate Status" value={result.certificate.status} />
              </dl>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-danger">
              <XCircle size={22} />
              <span className="font-medium">Certificate not found or invalid.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
