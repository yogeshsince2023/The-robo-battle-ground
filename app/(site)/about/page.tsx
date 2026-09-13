import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/container";
import { getAboutSettings, getBusinessSettings } from "@/lib/settings";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our robotics engineering company and our capabilities.",
};

export default async function AboutPage() {
  const about = await getAboutSettings();
  const business = await getBusinessSettings();

  return (
    <div>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <span className="section-eyebrow">About Us</span>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Engineering combat robotics, training, and manufacturing
          </h1>
        </Container>
      </section>

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
            <h3 className="font-display mt-6 text-lg font-bold">Experience</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{about.experience}</p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
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

      <section className="py-16 sm:py-20">
        <Container>
          <div className="card flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mark-512.png"
              alt={business.businessName}
              className="h-28 w-28 flex-shrink-0 rounded-xl border border-border object-contain"
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
