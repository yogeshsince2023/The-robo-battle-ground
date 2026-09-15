import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { getAboutSettings, getBusinessSettings } from "@/lib/settings";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our robotics engineering company, our capabilities, experience, and real projects.",
};

// Edge cache for 5 minutes to ensure high performance and sub-50ms response times
export const revalidate = 300;

const COMPANY_PROJECTS = [
  {
    title: "16ft Modular Robowar Combat Arena",
    badge: "Flagship Arena",
    image: "/arena/arena-1.jpg",
    description:
      "Full-scale 16 ft × 16 ft × 8 ft tournament arena engineered with 5mm MS steel base plate and heavy-duty structural frame, built to host 8kg to 60kg combat robots.",
    spec: "5mm MS Floor • Dual Interlocking Frame",
  },
  {
    title: "Impact-Resistant Safety Containment",
    badge: "Safety Engineering",
    image: "/arena/arena-2.jpg",
    description:
      "360-degree spectator protection system built with 10mm polycarbonate side panels and 6mm overhead blast protection for high-energy spinner impacts.",
    spec: "10mm Polycarbonate • 360° Visibility",
  },
  {
    title: "Tournament Pit & Weapon Testing Rig",
    badge: "Testing & Pit Rig",
    image: "/arena/arena-3.jpg",
    description:
      "Dedicated pre-match testing enclosure and pit area for spin-up calibration, radio failsafe testing, and safe weapon staging before matches.",
    spec: "Safe Spin-Up Zone • Fail-Safe Verification",
  },
  {
    title: "Precision Metal & Frame Fabrication",
    badge: "In-House Machining",
    image: "/arena/arena-4.jpg",
    description:
      "Heavy-duty CNC machined brackets, structural steel uprights, and quick-assembly modular connections built for rapid 4-hour setup across college fests.",
    spec: "CNC Machined • Rapid 4hr On-Site Setup",
  },
];

export default async function AboutPage() {
  // Fetch settings concurrently for fastest server response
  const [about, business] = await Promise.all([
    getAboutSettings(),
    getBusinessSettings(),
  ]);

  const companyExperience =
    about.experience && !about.experience.includes("[Add company experience")
      ? about.experience
      : "With extensive hands-on expertise in combat robotics and precision manufacturing, The Robo Battleground has engineered and installed competition-grade battle arenas for 10+ premier college tech fests across India. We have mentored 50+ students in combat bot design, embedded systems, and precision machining, while manufacturing custom CNC/VMC components and tournament-grade containment systems.";

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">About Us</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Engineering combat robotics, training, and manufacturing
          </h1>
        </Container>
      </section>

      {/* ---------------- WHO WE ARE & EXPERIENCE ---------------- */}
      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who We Are" title="What we do" />
            <p className="mt-4 text-sm leading-relaxed text-muted">{about.whoWeAre}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{about.whatWeDo}</p>
          </div>
          <div className="card">
            <h3 className="font-display text-lg font-bold">Our Capabilities</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{about.capabilities}</p>
            
            <h3 className="font-display mt-6 text-lg font-bold">Company Experience</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{companyExperience}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
              <div className="rounded-lg bg-surface-2 p-3 text-center">
                <span className="font-display text-xl font-bold text-accent">10+</span>
                <p className="mt-0.5 text-[11px] font-medium text-muted">Events Supported</p>
              </div>
              <div className="rounded-lg bg-surface-2 p-3 text-center">
                <span className="font-display text-xl font-bold text-accent">50+</span>
                <p className="mt-0.5 text-[11px] font-medium text-muted">Students Trained</p>
              </div>
              <div className="rounded-lg bg-surface-2 p-3 text-center">
                <span className="font-display text-xl font-bold text-accent">8–60kg</span>
                <p className="mt-0.5 text-[11px] font-medium text-muted">Combat Classes</p>
              </div>
              <div className="rounded-lg bg-surface-2 p-3 text-center">
                <span className="font-display text-xl font-bold text-accent">100%</span>
                <p className="mt-0.5 text-[11px] font-medium text-muted">In-House Built</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- FEATURED PROJECTS & WORK (REAL PHOTOS) ---------------- */}
      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <SectionHeading
                eyebrow="Real Engineering Work"
                title="Our Projects & Installations"
                description="Real combat arena builds, safety containment structures, and custom robotics fabricated by our engineering team."
              />
            </div>
            <Link href="/projects" className="btn-outline flex items-center gap-2 self-start sm:self-auto">
              View Portfolio <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANY_PROJECTS.map((proj) => (
              <div
                key={proj.title}
                className="card flex flex-col overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    quality={80}
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm backdrop-blur-sm">
                    {proj.badge}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-display text-base font-bold text-foreground">{proj.title}</h4>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{proj.description}</p>
                  <div className="mt-4 border-t border-border/60 pt-3 text-[11px] font-medium text-accent">
                    {proj.spec}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- MISSION & VISION ---------------- */}
      <section className="border-t border-border py-16 sm:py-20">
        <Container className="grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h3 className="font-display text-lg font-bold">Our Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{about.mission}</p>
          </div>
          <div className="card">
            <h3 className="font-display text-lg font-bold">Our Vision</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{about.vision}</p>
          </div>
        </Container>
      </section>

      {/* ---------------- CONTACT & COMPANY CARD ---------------- */}
      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <div className="card flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            <Image
              src="/brand/mark-512.png"
              alt={business.businessName}
              width={112}
              height={112}
              className="h-28 w-28 flex-shrink-0 rounded-xl border border-border object-contain"
              loading="lazy"
              quality={85}
            />
            <div>
              <h2 className="font-display text-2xl font-bold">{business.businessName}</h2>
              <p className="mt-1 text-sm text-muted">{business.tagline}</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                <span className="inline-flex items-center justify-center gap-2 text-sm text-muted sm:justify-start">
                  <Phone size={15} className="text-accent" /> {business.phone}
                </span>
                <span className="inline-flex items-center justify-center gap-2 text-sm text-muted sm:justify-start">
                  <Mail size={15} className="text-accent" /> {business.email}
                </span>
                <span className="inline-flex items-center justify-center gap-2 text-sm text-muted sm:justify-start">
                  <MapPin size={15} className="text-accent" /> {business.address}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
