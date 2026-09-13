import Link from "next/link";
import type { BusinessSettings } from "@/lib/settings";

export function Footer({ business }: { business: BusinessSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-lg font-bold">{business.businessName}</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{business.tagline}</p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Explore
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/arena" className="hover:text-accent">Arena</Link></li>
            <li><Link href="/training" className="hover:text-accent">Training</Link></li>
            <li><Link href="/machining" className="hover:text-accent">Machining</Link></li>
            <li><Link href="/projects" className="hover:text-accent">Projects</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Company
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-accent">About</Link></li>
            <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link href="/certificate-verification" className="hover:text-accent">Verify Certificate</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>{business.phone}</li>
            <li>{business.email}</li>
            <li>{business.address}</li>
          </ul>
        </div>
      </div>
      <div className="bg-primary py-4 text-center text-xs text-primary-foreground/80">
        © {year} {business.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
