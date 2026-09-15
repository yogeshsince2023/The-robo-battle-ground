import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Swords,
  GraduationCap,
  Cog,
  Wrench,
  Headset,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Boxes,
  Monitor,
  BadgeCheck,
  Bot,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { LogoMarquee } from "@/components/ui/logo-marquee";
import { Reveal } from "@/components/ui/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { CertificateVerifyForm } from "@/components/forms/certificate-verify-form";
import {
  getHeroSettings,
  getMediaSettings,
  getStatsSettings,
  getAboutSettings,
  getBusinessSettings,
  getArenaSettings,
} from "@/lib/settings";
import { getClientLogos } from "@/lib/client-logos";
import { getArenaPhotos } from "@/lib/arena-gallery";
import { getTrainingIcon } from "@/lib/training-icons";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Robowar Arena, Robotics Training & CNC/VMC Machining",
  description:
    "A premium combat robotics arena, hands-on robotics & embedded systems training, and precision CNC, VMC and 3D printing manufacturing services.",
};

const SERVICES = [
  {
    icon: Swords,
    title: "Robotics Arenas",
    description: "Affordable and durable arenas for college events and robotics competitions.",
    href: "/arena",
  },
  {
    icon: Headset,
    title: "Technical Support",
    description: "On-ground technical assistance for robotics and technical events.",
    href: "/contact",
  },
  {
    icon: GraduationCap,
    title: "Student Training",
    description: "Hands-on training in robotics, electronics, embedded systems and more.",
    href: "/training",
  },
  {
    icon: Cog,
    title: "Project Machining",
    description: "Precision machining and fabrication for engineering and robotics projects.",
    href: "/machining",
  },
  {
    icon: Lightbulb,
    title: "Project Development",
    description: "From idea and design to prototype and final project.",
    href: "/projects",
  },
];

const ABOUT_POINTS = [
  { icon: Sparkles, title: "Affordable Solutions", description: "Best value for colleges and teams" },
  { icon: ShieldCheck, title: "Real-World Experience", description: "Backed by competition expertise" },
  { icon: Award, title: "Technical Expertise", description: "Support from experienced professionals" },
  { icon: Wrench, title: "End-to-End Support", description: "Arena → Training → Fabrication → Events" },
];

const MACHINING_STEPS = [
  { icon: Monitor, label: "Design" },
  { icon: Cog, label: "Machining" },
  { icon: Boxes, label: "Finished Product" },
];

export default async function HomePage() {
  const hero = await getHeroSettings();
  const media = await getMediaSettings();
  const stats = await getStatsSettings();
  const about = await getAboutSettings();
  const business = await getBusinessSettings();
  const arenaSettings = await getArenaSettings();
  const arenaCategories = arenaSettings.categories.split(",").map((c) => c.trim()).filter(Boolean);
  const clientLogos = getClientLogos();
  const arenaPhotos = await getArenaPhotos();
  const heroImage = media.heroImageUrl
    ? { src: media.heroImageUrl, alt: "The Robo Battleground Arena" }
    : (arenaPhotos[0] || { src: "/arena/arena-1.jpg", alt: "Robowar Arena" });
  const aboutImage = media.aboutImageUrl || arenaPhotos[1]?.src || arenaPhotos[0]?.src || "/arena/arena-2.jpg";

  const trainingCourses = await prisma.trainingCourse.findMany({
    where: { status: "Active" },
    orderBy: { displayOrder: "asc" },
  });

  const projects = await prisma.project.findMany({
    where: { status: "Published" },
    orderBy: { displayOrder: "asc" },
    take: 6,
  });

  const statList = [
    { value: stats.stat1Value, label: stats.stat1Label },
    { value: stats.stat2Value, label: stats.stat2Label },
  ];

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="border-b border-border bg-surface">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <Reveal>
            <span className="section-eyebrow">Technical Partner</span>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Robotics Events &amp; Innovation
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              {hero.subheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/arena#enquiry" className="btn-primary">
                Book an Arena <ArrowRight size={16} />
              </Link>
              <Link href="#services" className="btn-outline">
                Explore Our Services <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-10 flex gap-10">
              {statList.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-extrabold text-primary">{s.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {heroImage && (
            <Reveal delay={0.1} y={32}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-lg">
                <Image
                  src={heroImage.src}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary shadow">
                  Engineering Real Experiences
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section id="services" className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionHeading
                eyebrow="What We Offer"
                title="Our Services"
                description="Complete support for your technical journey."
              />
              <Link href="#services" className="btn-outline">
                Explore Services <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="card flex h-full flex-col">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon size={22} />
                    </span>
                    <h3 className="font-display text-base font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                    {s.title === "Robotics Arenas" && arenaCategories.length > 0 && (
                      <div className="mt-4 flex flex-1 flex-wrap gap-1.5 content-start pt-1">
                        {arenaCategories.slice(0, 3).map((cat) => (
                          <span key={cat} className="badge border-primary/20 bg-primary/10 text-primary">
                            {cat}
                          </span>
                        ))}
                        {arenaCategories.length > 3 && (
                          <span className="badge border-muted/30 bg-surface-2 text-muted">
                            +{arenaCategories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {s.title !== "Robotics Arenas" && <div className="flex-1" />}
                    <Link
                      href={s.href}
                      className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      aria-label={s.title}
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- ABOUT ---------------- */}
      <section className="border-y border-border bg-surface py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutImage} alt={business.businessName} className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="section-eyebrow">About Us</span>
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              About {business.businessName}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{about.whoWeAre}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{about.whatWeDo}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {ABOUT_POINTS.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary mt-8 inline-flex">
              Learn More About Us <ArrowRight size={16} />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* ---------------- CLIENT LOGOS ---------------- */}
      {clientLogos.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container>
            <Reveal>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Trusted Clients
              </p>
            </Reveal>
          </Container>
          <div className="mt-8">
            <LogoMarquee logos={clientLogos} />
          </div>
        </section>
      )}

      {/* ---------------- OUR ARENAS ---------------- */}
      {arenaPhotos.length > 0 && (
        <section className="border-y border-border bg-surface py-16 sm:py-24">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Our Arenas" title="Competition-Ready Arenas" description="Real arenas from our events." />
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="min-w-0 lg:col-span-3">
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {arenaPhotos.map((photo, i) => (
                    <Reveal key={photo.id} delay={i * 0.05} className="flex-shrink-0">
                      <div className="w-64 overflow-hidden rounded-2xl border border-border shadow-sm">
                        <div className="relative aspect-[4/3]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                        </div>
                        <div className="bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">
                          {photo.alt}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Reveal delay={0.2}>
                <div className="card flex h-full flex-col justify-center bg-primary text-primary-foreground">
                  <h3 className="font-display text-lg font-bold">Planning a Robotics Event?</h3>
                  <p className="mt-2 text-sm text-primary-foreground/85">
                    Get an affordable, customized arena solution for your college or organization.
                  </p>
                  <Link href="/contact#enquiry" className="btn-accent mt-6 w-fit">
                    Get a Quote <ArrowRight size={16} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* ---------------- TRAINING PROGRAMS ---------------- */}
      {trainingCourses.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Learn. Build. Master." title="Training Programs" />
                <Link href="/training" className="btn-outline">
                  View All Courses <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {trainingCourses.map((c, i) => {
                const Icon = getTrainingIcon(c.name);
                return (
                  <Reveal key={c.id} delay={i * 0.04}>
                    <Link href={`/training#enquiry`} className="card flex flex-col items-center gap-2 py-6 text-center hover:border-primary/40">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon size={20} />
                      </span>
                      <p className="text-xs font-medium leading-tight">{c.name}</p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ---------------- MACHINING PROCESS + ACHIEVEMENTS ---------------- */}
      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="flex items-center justify-between gap-4">
              <SectionHeading eyebrow="From Digital Design to Reality" title="Machining & Fabrication" />
              <Link href="/machining" className="btn-outline">
                Learn More <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-between gap-2">
              {MACHINING_STEPS.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <step.icon size={26} />
                    </span>
                    <p className="text-xs font-medium">{step.label}</p>
                  </div>
                  {i < MACHINING_STEPS.length - 1 && (
                    <ArrowRight size={18} className="mx-2 flex-shrink-0 text-muted" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          {projects.length > 0 && (
            <Reveal delay={0.1}>
              <div className="flex items-center justify-between gap-4">
                <SectionHeading eyebrow="Our Work" title="Projects & Achievements" />
                <Link href="/projects" className="btn-outline">
                  View All <ArrowRight size={15} />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center">
                      {p.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverImageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Bot size={20} />
                          </span>
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {p.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-medium">{p.name}</p>
                    <p className="text-xs text-muted">{p.category}{p.year ? ` · ${p.year}` : ""}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      {/* ---------------- CERTIFICATE + CONTACT ---------------- */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card flex h-full flex-col justify-center gap-4 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BadgeCheck size={26} />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">Verify Your Certificate</h3>
                <p className="mt-1 text-sm text-muted">
                  Have a certificate issued by us? Verify its authenticity instantly.
                </p>
                <div className="mt-4">
                  <CertificateVerifyForm compact />
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card flex h-full flex-col justify-center bg-primary text-primary-foreground">
              <h3 className="font-display text-lg font-bold">Get in Touch</h3>
              <p className="mt-1 text-sm text-primary-foreground/85">
                Have a question or planning an event? Send us an enquiry.
              </p>
              <Link href="/contact#enquiry" className="btn-accent mt-6 w-fit">
                Send an Enquiry <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
