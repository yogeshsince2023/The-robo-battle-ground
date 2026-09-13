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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(arenaEnquirySchema) });

  function toggleCategory(c: string) {
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function onSubmit(data: FormOutput) {
    const categoryList = [...selectedCategories];
    if (otherCategory.trim()) categoryList.push(otherCategory.trim());
    const payload = { ...data, robotCategory: categoryList.join(", ") || undefined };
    try {
      const res = await fetch("/api/arena-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Something went wrong. Please try again.");
        return;
      }
      setReferenceNo(json.referenceNo);
      toast.success("Enquiry sent successfully!");
      reset();
      setSelectedCategories([]);
      setOtherCategory("");
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
        <div className="sm:col-span-2">
          <label className="label">Arena Category (select all that apply)</label>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = selectedCategories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-surface-2 text-muted hover:border-accent/50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          ) : null}
          <input
            className="input mt-3"
            placeholder="Other category (optional)"
            value={otherCategory}
            onChange={(e) => setOtherCategory(e.target.value)}
          />
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
