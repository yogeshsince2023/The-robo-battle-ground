"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { contactMessageSchema } from "@/lib/validations";

type FormData = z.infer<typeof contactMessageSchema>;

export function ContactForm() {
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(contactMessageSchema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/contact-messages", {
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
      toast.success("Message sent!");
      reset();
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  if (referenceNo) {
    return (
      <div className="card border-accent/40 bg-accent/5 text-center">
        <p className="text-sm text-muted">Thanks for reaching out.</p>
        <p className="mt-2 font-display text-2xl font-bold text-accent">{referenceNo}</p>
        <p className="mt-2 text-sm text-muted">We usually respond within 1–2 business days.</p>
        <button className="btn-outline mt-5" onClick={() => setReferenceNo(null)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="enquiry" className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input className="input" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" {...register("phone")} />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" {...register("subject")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Message *</label>
          <textarea className="input min-h-32" {...register("message")} />
          {errors.message && <p className="mt-1 text-xs text-danger">{errors.message.message}</p>}
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-accent w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
