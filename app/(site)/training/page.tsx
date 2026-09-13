import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { TrainingEnquiryForm } from "@/components/forms/training-enquiry-form";
import { prisma } from "@/lib/prisma";
import { Clock, Laptop, Award, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Robotics Training & Workshops — Arduino, ESP32, PLC, Embedded Systems",
  description:
    "Hands-on robotics training programs: Arduino, ESP32, embedded systems, PLC & industrial automation, and robotics competition training.",
};

export default async function TrainingPage() {
  const courses = await prisma.trainingCourse.findMany({
    where: { status: "Active" },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">Training Programs</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hands-on robotics & engineering training
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            From first-time builders to competition teams, our programs cover robotics, embedded
            systems, and industrial automation with practical, project-based learning.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Programs" title="Choose a training program" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div key={c.id} className="card flex flex-col hover:border-accent/50">
                <h3 className="font-display text-lg font-bold">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.shortDescription}</p>
                <div className="mt-4 space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2"><Clock size={14} /> {c.duration}</div>
                  <div className="flex items-center gap-2"><Laptop size={14} /> {c.mode}</div>
                  {c.certificateAvailable && (
                    <div className="flex items-center gap-2"><Award size={14} /> Certificate included</div>
                  )}
                </div>
                <Link
                  href={`/training#enquiry?course=${c.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all"
                >
                  Enquire About Training <ArrowRight size={15} />
                </Link>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-muted">
                No training programs published yet. Add courses from Admin → Training → Courses.
              </p>
            )}
          </div>
        </Container>
      </section>

      <section id="enquiry" className="border-t border-border bg-surface py-16 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Registration" title="Enquire About Training" center />
          <div className="mt-10">
            <TrainingEnquiryForm courses={courses.map((c) => ({ id: c.id, name: c.name }))} />
          </div>
        </Container>
      </section>
    </div>
  );
}
