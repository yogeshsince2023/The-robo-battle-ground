"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_FILES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/validations";

const SERVICE_TYPES = ["CNC", "VMC", "3D Printing"];

export function MachiningQuotationForm() {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service");
  const initialServiceType = SERVICE_TYPES.includes(requestedService || "") ? requestedService! : "CNC";

  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    if (arr.length > MAX_UPLOAD_FILES) {
      setFileError(`You can upload at most ${MAX_UPLOAD_FILES} files.`);
      return;
    }
    for (const f of arr) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
        setFileError(`Unsupported file type: ${f.name}`);
        return;
      }
      if (f.size > MAX_UPLOAD_SIZE_BYTES) {
        setFileError(`File too large (max 25MB): ${f.name}`);
        return;
      }
    }
    setFileError(null);
    setFiles(arr);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fileError) return;
    setSubmitting(true);
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/machining-requests", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setReferenceNo(json.referenceNo);
      toast.success("Quotation request submitted!");
      formEl.reset();
      setFiles([]);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (referenceNo) {
    return (
      <div className="card border-accent/40 bg-accent/5 text-center">
        <p className="text-sm text-muted">Your quotation request has been received.</p>
        <p className="mt-2 font-display text-2xl font-bold text-accent">{referenceNo}</p>
        <p className="mt-2 text-sm text-muted">
          Our team will review your design and get back to you with a quotation.
        </p>
        <button className="btn-outline mt-5" onClick={() => setReferenceNo(null)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5" encType="multipart/form-data">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input className="input" name="name" required maxLength={120} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" name="company" maxLength={160} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" name="email" required />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input className="input" name="phone" required maxLength={20} />
        </div>
        <div>
          <label className="label">Service Type *</label>
          <select className="input" name="serviceType" required defaultValue={initialServiceType}>
            <option value="CNC">CNC</option>
            <option value="VMC">VMC</option>
            <option value="3D Printing">3D Printing</option>
          </select>
        </div>
        <div>
          <label className="label">Material</label>
          <input className="input" name="material" placeholder="e.g. Aluminium 6061, PLA, ABS" />
        </div>
        <div>
          <label className="label">Quantity</label>
          <input className="input" type="number" min={1} name="quantity" />
        </div>
        <div>
          <label className="label">Required Delivery Date</label>
          <input className="input" type="date" name="requiredDeliveryDate" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tolerance / Requirements</label>
          <input className="input" name="tolerance" placeholder="e.g. ±0.05mm" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Additional Instructions</label>
          <textarea className="input min-h-28" name="instructions" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">
            Upload Design / CAD Files (STEP, STP, IGES, IGS, STL, OBJ, DXF, DWG, PDF, ZIP — max 25MB each, up to {MAX_UPLOAD_FILES} files)
          </label>
          <input
            className="input file:mr-4 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-accent-foreground"
            type="file"
            multiple
            accept={ALLOWED_UPLOAD_EXTENSIONS.join(",")}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {fileError && <p className="mt-1 text-xs text-danger">{fileError}</p>}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {files.map((f) => (
                <li key={f.name}>{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <button type="submit" disabled={submitting || !!fileError} className="btn-accent w-full sm:w-auto">
        {submitting ? "Submitting..." : "Get a Machining Quotation"}
      </button>
    </form>
  );
}
