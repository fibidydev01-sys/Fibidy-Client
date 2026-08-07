"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Label disesuaikan ke struktur 6 section baru
const navLinks = [
  { label: "Beranda", href: "#hero" },
  { label: "Kenapa Fibidy", href: "#about" },
  { label: "Cara Kerjanya", href: "#timeline" },
  { label: "Harga", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontak", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full px-4 pt-4 fixed top-0 left-0 z-50">
      <nav
        className="max-w-6xl mx-auto border border-border rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm"
        style={{
          background:
            "color-mix(in oklch, var(--card) 90%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--primary)" />
            <path
              d="M8 9C8 8.44772 8.44772 8 9 8H18C18.5523 8 19 8.44772 19 9C19 9.55228 18.5523 10 18 10H10V13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H10V19C10 19.5523 9.55228 20 9 20C8.44772 20 8 19.5523 8 19V9Z"
              fill="var(--primary-foreground)"
            />
          </svg>
          <span className="text-base font-bold text-foreground">Fibidy</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm transition-colors ${i === 0
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Mulai Gratis</Link>
          </Button>
        </div>

        {/* Mobile — Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 pt-10">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-8">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Masuk
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Mulai Gratis
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}