"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/arena", label: "Arena" },
  { href: "/training", label: "Training" },
  { href: "/machining", label: "Machining" },
  { href: "/projects", label: "Projects" },
  { href: "/certificate-verification", label: "Certificate" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-wide">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md">
            <Image
              src={logoUrl || "/brand/mark-512.png"}
              alt=""
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </span>
          <span className="hidden sm:inline">{businessName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact#enquiry" className="btn-primary hidden sm:inline-flex">
            Get a Quote
          </Link>
          <button
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-surface-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact#enquiry"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center"
            >
              Get a Quote
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
