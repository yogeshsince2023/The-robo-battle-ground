import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { MachiningQuotationForm } from "@/components/forms/machining-quotation-form";
import { prisma } from "@/lib/prisma";
import { Layers, Boxes, Printer, UploadCloud } from "lucide-react";

export const metadata: Metadata = {
  title: "CNC & VMC Machining, 3D Printing — Precision Manufacturing",
  description:
    "CNC machining, VMC machining, and 3D printing services for prototypes, robotics parts, and small-batch manufacturing. Get a machining quotation.",
};

const CATEGORY_ICON: Record<string, typeof Layers> = {
  CNC: Layers,
  VMC: Boxes,
  "3D_PRINTING": Printer,
};

const CATEGORY_LABEL: Record<string, string> = {
  CNC: "CNC Machining",
  VMC: "VMC Machining",
  "3D_PRINTING": "3D Printing",
};

const CATEGORY_SERVICE_PARAM: Record<string, string> = {
  CNC: "CNC",
  VMC: "VMC",
  "3D_PRINTING": "3D Printing",
};

export default async function MachiningPage() {
  const services = await prisma.machiningService.findMany({
    where: { status: "Active" },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">Machining &amp; Manufacturing</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            CNC, VMC and 3D printing for robotics & engineering parts
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            From one-off prototypes to small-batch production, we manufacture precision components
            for robotics, automation, and custom engineering projects.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = CATEGORY_ICON[s.category] || Layers;
              return (
                <div key={s.id} className="card">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Icon size={22} />
                  </span>
                  <h2 className="font-display text-xl font-bold">{s.title || CATEGORY_LABEL[s.category]}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                  {s.materials && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Materials</p>
                      <p className="mt-1 text-sm">{s.materials}</p>
                    </div>
                  )}
                  {s.applications && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Applications</p>
                      <p className="mt-1 text-sm">{s.applications}</p>
                    </div>
                  )}
                  {s.capabilities && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Capabilities</p>
                      <p className="mt-1 text-sm">{s.capabilities}</p>
                    </div>
                  )}
                  <Link
                    href={`/machining?service=${encodeURIComponent(CATEGORY_SERVICE_PARAM[s.category] || "CNC")}#quotation`}
                    className="btn-outline mt-5 w-full justify-center"
                  >
                    <UploadCloud size={16} /> Upload CAD File
                  </Link>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Manufacturing"
            title="Prototype & small-batch manufacturing"
            description="We support both single prototype runs and small-batch production, including competition robot parts, custom brackets, enclosures, and engineering components."
          />
        </Container>
      </section>

      <section id="quotation" className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Get a Quote" title="Get a Machining Quotation" center />
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted">
            Upload your design (STEP, STP, IGES, IGS, STL, OBJ, DXF, DWG, PDF, ZIP) and our team will
            review it and get back to you with a quotation.
          </p>
          <div className="mt-10">
            <Suspense fallback={null}>
              <MachiningQuotationForm />
            </Suspense>
          </div>
        </Container>
      </section>
    </div>
  );
}
