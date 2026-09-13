"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { trainingEnquirySchema } from "@/lib/validations";

type FormData = z.infer<typeof trainingEnquirySchema>;

export function TrainingEnquiryForm({
  courses,
  defaultCourseId,
}: {
  courses: { id: string; name: string }[];
  defaultCourseId?: string;
}) {
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(trainingEnquirySchema),
    defaultValues: { courseId: defaultCourseId ?? "" },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/training-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Something went wrong. Please try again.");
        return;
      }
      setReferenceNo(json.referenceNo);
      toast.success("Registration submitted!");
      reset();
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  if (referenceNo) {
    return (
      <div className="card border-accent/40 bg-accent/5 text-center">
        <p className="text-sm text-muted">Your training enquiry has been received.</p>
        <p className="mt-2 font-display text-2xl font-bold text-accent">{referenceNo}</p>
        <p className="mt-2 text-sm text-muted">Our training team will reach out shortly.</p>
        <button className="btn-outline mt-5" onClick={() => setReferenceNo(null)}>
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Student Name *</label>
          <input className="input" {...register("studentName")} />
          {errors.studentName && <p className="mt-1 text-xs text-danger">{errors.studentName.message}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone *</label>
          <input className="input" {...register("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">College / Organization</label>
          <input className="input" {...register("organization")} />
        </div>
        <div>
          <label className="label">Course</label>
          <select className="input" {...register("courseId")}>
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Preferred Batch</label>
          <input className="input" placeholder="e.g. Weekday / Weekend" {...register("preferredBatch")} />
        </div>
        <div>
          <label className="label">Training Mode</label>
          <select className="input" {...register("trainingMode")}>
            <option value="">Select mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Message</label>
          <textarea className="input min-h-28" {...register("message")} />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-accent w-full sm:w-auto">
        {isSubmitting ? "Submitting..." : "Enquire About Training"}
      </button>
    </form>
  );
}
