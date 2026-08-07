import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// ── HEADER ──────────────────────────────────────────────
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <span className="text-lg font-bold text-primary">Fibidy</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Open your store</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ── HERO ────────────────────────────────────────────────
function Hero() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Try it first, sign up later
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Open your store. Sell today.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Build your catalog, share your link, and take orders on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/register">
              Open your store
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Free forever to start · 5 minutes to launch · WhatsApp-first ordering
        </p>
      </div>
    </main>
  );
}

// ── FOOTER ──────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fibidy. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/legal/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

// ── PAGE ────────────────────────────────────────────────
export default function MarketingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Footer />
    </>
  );
}