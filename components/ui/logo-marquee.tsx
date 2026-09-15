import type { ClientLogo } from "@/lib/client-logos";

export function LogoMarquee({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <div className="logo-marquee" role="region" aria-label="Trusted Clients">
      <div className="logo-marquee-track">
        {logos.map((logo) => (
          <div key={logo.src} className="logo-marquee-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} title={logo.alt} loading="lazy" />
          </div>
        ))}
        {logos.map((logo, i) => (
          <div key={`dup-${logo.src}-${i}`} className="logo-marquee-item" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
