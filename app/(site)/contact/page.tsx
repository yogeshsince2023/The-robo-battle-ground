import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/container";
import { ContactForm } from "@/components/forms/contact-form";
import { getBusinessSettings } from "@/lib/settings";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch for arena bookings, training enquiries, machining quotations, or general questions.",
};

export default async function ContactPage() {
  const business = await getBusinessSettings();
  const whatsappLink = toWhatsAppLink(business.whatsapp, "Hi, I'd like to know more about The Robo Battleground.");

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <span className="section-eyebrow">Contact</span>
        <h1 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Get in touch
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <InfoRow icon={Phone} label="Phone" value={business.phone} href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} />
            <InfoRow icon={MessageCircle} label="WhatsApp" value={business.whatsapp} href={whatsappLink ?? undefined} />
            <InfoRow icon={Mail} label="Email" value={business.email} />
            <InfoRow icon={MapPin} label="Address" value={business.address} />

            {business.googleMapsUrl && business.googleMapsUrl !== "[GOOGLE MAPS URL]" && (
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex"
              >
                View on Google Maps
              </a>
            )}

            {business.socials.length > 0 && (
              <div>
                <p className="label">Follow us</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {business.socials.map((s) => (
                    <a key={s.label} href={s.url} className="text-accent hover:underline">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <SectionHeading title="Send us a message" />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:opacity-80">
        {content}
      </a>
    );
  }
  return <div className="flex gap-3">{content}</div>;
}
