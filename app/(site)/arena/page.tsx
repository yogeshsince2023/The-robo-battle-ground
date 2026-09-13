import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/container";
import { ArenaEnquiryForm } from "@/components/forms/arena-enquiry-form";
import { prisma } from "@/lib/prisma";
import { getArenaPhotos } from "@/lib/arena-gallery";
import { getArenaSettings } from "@/lib/settings";
import {
  Ruler,
  Layers,
  ShieldCheck,
  Boxes,
  Wrench,
  CalendarClock,
  Trophy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Robowar Arena — Robot Battle Arena Rental & Event Support",
  description:
    "Professional combat robot arena for battles, competitions, testing and demonstrations. Send an arena enquiry for your next event.",
};

const FACILITIES = [
  "Combat-rated arena floor with hazard-tape marked boundaries",
  "Spectator seating and streaming/commentary setup",
  "Robot weigh-in and inspection station",
  "Pit area with power outlets for repairs between bouts",
  "On-site technical support for arena hazards and control systems",
  "Post-event footage on request",
];

const FAQ = [
  {
    q: "Can we rent the arena for a private event?",
    a: "Yes — submit an Arena Enquiry with your event details and we'll confirm availability and pricing.",
  },
  {
    q: "What robot weight categories are supported?",
    a: "The arena supports multiple weight classes. Specify your category in the enquiry form so we can prepare accordingly.",
  },
  {
    q: "Do you provide judges and event staff?",
    a: "Event support including judging and technical staff can be arranged — mention your requirements in the enquiry.",
  },
  {
    q: "Can we test our robot outside of a competition?",
    a: "Yes, the arena is available for robot testing sessions. Select a shorter duration in the enquiry form.",
  },
];

export default async function ArenaPage() {
  const courseCount = await prisma.trainingCourse.count().catch(() => 0);
  const arenaPhotos = await getArenaPhotos();
  const arenaSpecs = await getArenaSettings();

  const SPECS = [
    { icon: Ruler, label: "Arena Dimensions", value: arenaSpecs.dimensions },
    { icon: Layers, label: "Base Floor", value: arenaSpecs.baseSheet },
    { icon: ShieldCheck, label: "Side Walls", value: arenaSpecs.sidePolycarbonate },
    { icon: Boxes, label: "Top Cover", value: arenaSpecs.topPolycarbonate },
    { icon: Wrench, label: "Pit / Testing Area", value: "Dedicated robot testing & repair pit area" },
    { icon: CalendarClock, label: "Booking Duration", value: "Multi-day rental options" },
    { icon: Trophy, label: "Event Support", value: "Judging support, brackets, and live commentary setup" },
  ];

  return (
    <div>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">Robowar Arena</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            A dedicated arena for robot combat, testing & competitions
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Our arena is purpose-built for combat robotics — from casual testing sessions to full-scale
            Robowar competitions with spectators, judging, and live commentary.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Specifications" title="Arena specifications & equipment" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SPECS.map((s) => (
              <div key={s.label} className="card">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <s.icon size={20} />
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{s.label}</h3>
                <p className="mt-1.5 text-sm">{s.value}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Facilities" title="What's included" />
            <ul className="mt-6 space-y-3 text-sm">
              {FACILITIES.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex flex-col justify-center bg-surface-2">
            <h3 className="font-display text-lg font-bold">Robot testing & competition support</h3>
            <p className="mt-2 text-sm text-muted">
              Whether you&apos;re prepping for a competition or need a safe space to test a new build, our
              arena and technical staff are available for booking. We also support {courseCount > 0 ? "our training program participants" : "training participants"} who want
              hands-on stage time.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Gallery"
            title="Arena photos"
            description={
              arenaPhotos.length === 0
                ? "Photos coming soon."
                : undefined
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {arenaPhotos.length > 0
              ? arenaPhotos.map((photo) => (
                  <div
                    key={photo.src}
                    className="aspect-square overflow-hidden rounded-lg border border-border bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid-backdrop flex aspect-square items-center justify-center rounded-lg border border-border bg-surface-2 text-xs text-muted"
                  >
                    Photo {i}
                  </div>
                ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q} className="card">
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="enquiry" className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Book the Arena" title="Send Arena Enquiry" center />
          <div className="mt-10">
            <ArenaEnquiryForm
              categories={arenaSpecs.categories.split(",").map((c) => c.trim()).filter(Boolean)}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
