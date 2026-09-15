import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return {
    title: project.name,
    description: (project.shortDescription || "").replace(/^\[DEMO\]\s*/i, ""),
  };
}

export const revalidate = 300;

function getProjectImage(coverImageUrl: string | null | undefined, category: string): string {
  if (coverImageUrl && coverImageUrl.trim() !== "") {
    return coverImageUrl;
  }
  const cat = (category || "").toLowerCase();
  if (cat.includes("robowar") || cat.includes("combat")) return "/arena/arena-1.jpg";
  if (cat.includes("robotics")) return "/arena/arena-3.jpg";
  if (cat.includes("automation")) return "/arena/arena-4.jpg";
  return "/arena/arena-2.jpg";
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { images: true },
  });

  if (!project || project.status !== "Published") notFound();

  const technologies = project.technologies?.split(",").map((t) => t.trim()).filter(Boolean) || [];
  const cleanShortDesc = (project.shortDescription || "").replace(/^\[DEMO\]\s*/i, "");
  const cleanDetailedDesc = (project.detailedDescription || "").replace(/^\[DEMO\]\s*/gi, "");
  const heroImage = getProjectImage(project.coverImageUrl, project.category);

  return (
    <div className="py-16 sm:py-20">
      <Container className="max-w-4xl">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
          <ArrowLeft size={15} /> Back to Projects
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="badge border-accent/30 bg-accent/10 text-accent">{project.category}</span>
          {project.year && <span className="text-sm text-muted">{project.year}</span>}
        </div>
        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-4 text-base text-muted">{cleanShortDesc}</p>

        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface-2">
          <Image
            src={heroImage}
            alt={project.name}
            fill
            sizes="(min-width: 1024px) 896px, 100vw"
            priority
            className="object-cover"
            quality={85}
          />
        </div>

        {cleanDetailedDesc && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold">Overview</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
              {cleanDetailedDesc}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {technologies.length > 0 && (
            <div className="card">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Technologies</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {technologies.map((t) => (
                  <span key={t} className="badge border-border bg-surface-2">{t}</span>
                ))}
              </div>
            </div>
          )}
          {project.clientOrEvent && (
            <div className="card">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Client / Event</h3>
              <p className="mt-2 text-sm">{project.clientOrEvent.replace(/^\[.*?\]$/, "National Robowar Series")}</p>
            </div>
          )}
        </div>

        {project.images.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {project.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border border-border">
                  <Image
                    src={img.url}
                    alt={img.caption || project.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
