"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { arenaEnquirySchema } from "@/lib/validations";

type FormInput = z.input<typeof arenaEnquirySchema>;
type FormOutput = z.output<typeof arenaEnquirySchema>;

export function ArenaEnquiryForm({ categories = [] }: { categories?: string[] }) {
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(arenaEnquirySchema) });

  async function onSubmit(data: FormOutput) {
    try {
      const res = await fetch("/api/arena-enquiries", {
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
      toast.success("Enquiry sent successfully!");
      reset();
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  if (referenceNo) {
    return (
      <div className="card border-accent/40 bg-accent/5 text-center">
        <p className="text-sm text-muted">Your enquiry has been received.</p>
        <p className="mt-2 font-display text-2xl font-bold text-accent">{referenceNo}</p>
        <p className="mt-2 text-sm text-muted">
          Please save this reference number. Our team will contact you shortly.
        </p>
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
          <label className="label">Name *</label>
          <input className="input" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Company / Organization</label>
          <input className="input" {...register("company")} />
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
          <label className="label">Event Name</label>
          <input className="input" {...register("eventName")} />
        </div>
        <div>
          <label className="label">Event Date</label>
          <input className="input" type="date" {...register("eventDate")} />
        </div>
        <div>
          <label className="label">Number of Participants</label>
          <input className="input" type="number" min={1} {...register("participants")} />
        </div>
        <div>
          <label className="label">Arena Category</label>
          {categories.length > 0 ? (
            <select className="input" {...register("robotCategory")} defaultValue="">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          ) : (
            <input className="input" placeholder="e.g. 8kg, 15kg, Antweight" {...register("robotCategory")} />
          )}
        </div>
        <div>
          <label className="label">Expected Number of Robots</label>
          <input className="input" type="number" min={1} {...register("expectedRobots")} />
        </div>
        <div>
          <label className="label">Required Arena Duration</label>
          <input className="input" placeholder="e.g. 2 days" {...register("arenaDuration")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Location</label>
          <input className="input" {...register("location")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Message</label>
          <textarea className="input min-h-28" {...register("message")} />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-accent w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
