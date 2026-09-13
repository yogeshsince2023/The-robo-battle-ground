import type { Metadata } from "next";
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
    description: project.shortDescription,
  };
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
        <p className="mt-4 text-base text-muted">{project.shortDescription}</p>

        <div className="mt-8 flex aspect-video items-center justify-center rounded-lg border border-border bg-surface-2 text-sm text-muted">
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImageUrl} alt={project.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            "Project Image"
          )}
        </div>

        {project.detailedDescription && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold">Overview</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
              {project.detailedDescription}
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
              <p className="mt-2 text-sm">{project.clientOrEvent}</p>
            </div>
          )}
        </div>

        {project.images.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {project.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.caption || project.name}
                  className="aspect-square rounded-md border border-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
