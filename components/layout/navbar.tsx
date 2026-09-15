"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/arena", label: "Arena" },
];

const SERVICE_LINKS = [
  { href: "/training", label: "Training Programs", desc: "Robotics, IoT, PLC & embedded courses" },
  { href: "/machining", label: "Machining & Fabrication", desc: "Precision CNC, VMC & 3D printing" },
  { href: "/certificate-verification", label: "Verify Certificate", desc: "Instant online credential verification" },
];

const SECONDARY_LINKS = [
  { href: "/projects", label: "Projects" },
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
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isServiceActive = SERVICE_LINKS.some((s) => pathname.startsWith(s.href));

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((link) => {
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

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesDropdown((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isServiceActive ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"
              }`}
              aria-expanded={servicesDropdown}
            >
              Services
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${servicesDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {servicesDropdown && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl">
                {SERVICE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setServicesDropdown(false)}
                    className="block rounded-lg p-2.5 transition-colors hover:bg-surface-2"
                  >
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {SECONDARY_LINKS.map((link) => {
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
          <Link href="/contact#enquiry" className="btn-outline hidden sm:inline-flex">
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

      {/* Mobile Navigation */}
      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-surface-2"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-1 border-t border-border/60 px-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Services</p>
            </div>
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-surface-2"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 border-t border-border/60" />
            {SECONDARY_LINKS.map((link) => (
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
