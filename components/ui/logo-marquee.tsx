import type { ClientLogo } from "@/lib/client-logos";

export function LogoMarquee({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;

  // Render the strip twice back-to-back; the animation scrolls exactly one
  // strip-width to the left then resets, giving a seamless infinite loop.
  const track = [...logos, ...logos];

  return (
    <div className="logo-marquee">
      <div className="logo-marquee-track">
        {track.map((logo, i) => (
          <div key={`${logo.src}-${i}`} className="logo-marquee-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} title={logo.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
