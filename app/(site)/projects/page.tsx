import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Projects Portfolio — Robotics, Automation & Fabrication",
  description:
    "Browse our completed robotics, automation, electronics, CNC, and custom engineering projects.",
};

export const revalidate = 300;

function getProjectImage(coverImageUrl: string | null | undefined, category: string, slug?: string, index = 0): string {
  if (coverImageUrl && coverImageUrl.trim() !== "") {
    return coverImageUrl;
  }
  const s = (slug || "").toLowerCase();
  if (s.includes("titan") || s.includes("8kg")) return "/projects/8Kg.jpg";
  if (s.includes("line-follow")) return "/projects/Linefollower_BOT.jpg";
  if (s.includes("conveyor") || s.includes("sorting")) return "/projects/coveyor_belt.jpg";

  const cat = (category || "").toLowerCase();
  if (cat.includes("robowar") || cat.includes("combat")) return "/projects/8Kg.jpg";
  if (cat.includes("robotics")) return "/projects/Linefollower_BOT.jpg";
  if (cat.includes("automation")) return "/projects/coveyor_belt.jpg";

  const fallbacks = [
    "/projects/8Kg.jpg",
    "/projects/Linefollower_BOT.jpg",
    "/projects/coveyor_belt.jpg",
    "/arena/arena-1.jpg",
  ];
  return fallbacks[index % fallbacks.length];
}

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
            {projects.map((p, index) => {
              const imageSrc = getProjectImage(p.coverImageUrl, p.category, p.slug, index);
              const cleanDescription = (p.shortDescription || "").replace(/^\[DEMO\]\s*/i, "");

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="card flex flex-col hover:border-accent/50"
                >
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border border-border bg-surface-2">
                    <Image
                      src={imageSrc}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      quality={80}
                    />
                  </div>
                  <span className="badge mb-2 w-fit border-accent/30 bg-accent/10 text-accent">{p.category}</span>
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{cleanDescription}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>{p.year}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent">
                      View project <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <p className="text-sm text-muted">No projects published yet. Add projects from Admin → Projects.</p>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
