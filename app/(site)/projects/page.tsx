import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Projects Portfolio — Robotics, Automation & Fabrication",
  description:
    "Browse our completed robotics, automation, electronics, CNC, and custom engineering projects.",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "Published" },
    orderBy: { displayOrder: "asc" },
  });

  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <div>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">Portfolio</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Engineering projects we&apos;ve delivered
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Robotics, automation, electronics, CNC, and custom engineering fabrication projects from
            our team.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c} className="badge border-border bg-surface-2 text-muted">{c}</span>
              ))}
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="card flex flex-col hover:border-accent/50"
              >
                <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-br from-surface-2 to-surface">
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-3 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Bot size={22} />
                      </span>
                      <span className="text-xs font-semibold text-muted">{p.category}</span>
                    </div>
                  )}
                </div>
                <span className="badge mb-2 w-fit border-accent/30 bg-accent/10 text-accent">{p.category}</span>
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.shortDescription}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>{p.year}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-accent">
                    View project <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted">No projects published yet. Add projects from Admin → Projects.</p>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
