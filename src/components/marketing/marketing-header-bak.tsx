"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { AuthLogo } from "@/components/layout/auth/auth-logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/shared/utils";
import { headerNav, type NavItem, type NavMenuEntry } from "@/lib/data/marketing/nav";

/* ──────────────────────────────────────────────────────────────────
 * Shared "Soon" badge
 * ────────────────────────────────────────────────────────────────── */
function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Desktop: single mega-menu item (icon + label + description)
 * ────────────────────────────────────────────────────────────────── */
function MegaMenuItem({
  item,
  t,
  tCommon,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  const Icon = item.icon;
  const label = t(`items.${item.labelKey}`);
  const desc = t(`items.${item.descKey}`);
  const soonLabel = tCommon("soon");

  // Coming-soon items: render non-clickable
  if (item.soon) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          "flex items-start gap-3 rounded-md p-2 cursor-not-allowed opacity-60 select-none",
        )}
      >
        <Icon className="size-5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight flex items-center">
            {label}
            <SoonBadge label={soonLabel} />
          </span>
          <span className="text-xs text-muted-foreground leading-snug mt-0.5">
            {desc}
          </span>
        </div>
      </div>
    );
  }

  // Live items: NavigationMenuLink + locale-aware Link
  return (
    <NavigationMenuLink asChild>
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className="!flex flex-row items-start gap-3 rounded-md p-2 transition-colors hover:bg-accent focus:bg-accent"
      >
        <Icon className="size-5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium leading-tight truncate">{label}</span>
          <span className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
            {desc}
          </span>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Desktop: full mega-menu panel (3 columns à la Vercel)
 * ────────────────────────────────────────────────────────────────── */
function MegaMenuPanel({
  entry,
  t,
  tCommon,
}: {
  entry: NavMenuEntry;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  // Adaptive width based on column count
  const widthClass =
    entry.columns.length === 1
      ? "w-[320px]"
      : entry.columns.length === 2
        ? "w-[560px]"
        : "w-[760px]";

  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-1 p-4",
        widthClass,
        entry.columns.length === 1 && "grid-cols-1",
        entry.columns.length === 2 && "grid-cols-2",
        entry.columns.length === 3 && "grid-cols-3",
      )}
    >
      {entry.columns.map((col, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          {col.headingKey && (
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(col.headingKey)}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {col.items.map((item) => (
              <MegaMenuItem
                key={item.labelKey}
                item={item}
                t={t}
                tCommon={tCommon}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Mobile: single nav item inside accordion
 * ────────────────────────────────────────────────────────────────── */
function MobileNavItem({
  item,
  t,
  tCommon,
  onNavigate,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const label = t(`items.${item.labelKey}`);
  const soonLabel = tCommon("soon");

  if (item.soon) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center gap-3 rounded-md px-2 py-2.5 cursor-not-allowed opacity-60"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium flex items-center">
          {label}
          <SoonBadge label={soonLabel} />
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent focus:bg-accent"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * MAIN HEADER
 * ══════════════════════════════════════════════════════════════════ */
export function MarketingHeader() {
  const t = useTranslations("marketing.header");
  const tNav = useTranslations("marketing.header.nav");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Left: Logo + Desktop Nav ── */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center" aria-label="Fibidy home">
            <AuthLogo size="sm" />
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <NavigationMenu className="hidden md:flex" viewport={true}>
            <NavigationMenuList>
              {headerNav.map((entry) => {
                if (entry.kind === "link") {
                  return (
                    <NavigationMenuItem key={entry.id}>
                      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href={entry.href}>{tNav(entry.labelKey)}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                }

                return (
                  <NavigationMenuItem key={entry.id}>
                    <NavigationMenuTrigger>
                      {tNav(entry.labelKey)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenuPanel
                        entry={entry}
                        t={tNav}
                        tCommon={tCommon}
                      />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Right: CTAs (desktop) + Burger (mobile) ── */}
        <div className="flex items-center gap-2">
          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t("ctaSignIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">{t("ctaPrimary")}</Link>
            </Button>
          </div>

          {/* Mobile burger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("menuOpen")}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-sm flex flex-col p-0"
            >
              <SheetHeader className="flex flex-row items-center justify-between border-b border-border/40 px-4 py-3 space-y-0">
                <SheetTitle className="flex items-center">
                  <AuthLogo size="sm" />
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobile}
                  aria-label={t("menuClose")}
                >
                  <X className="size-5" aria-hidden="true" />
                </Button>
              </SheetHeader>

              {/* Scrollable nav body */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                <Accordion type="multiple" className="w-full">
                  {headerNav.map((entry) => {
                    if (entry.kind === "link") {
                      return (
                        <Link
                          key={entry.id}
                          href={entry.href}
                          onClick={closeMobile}
                          className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {tNav(entry.labelKey)}
                        </Link>
                      );
                    }

                    return (
                      <AccordionItem
                        key={entry.id}
                        value={entry.id}
                        className="border-b-0"
                      >
                        <AccordionTrigger className="rounded-md px-3 py-3 text-sm font-medium hover:bg-accent hover:no-underline data-[state=open]:bg-accent/50">
                          {tNav(entry.labelKey)}
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="flex flex-col gap-3 pl-2">
                            {entry.columns.map((col, cIdx) => (
                              <div key={cIdx} className="flex flex-col">
                                {col.headingKey && (
                                  <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {tNav(col.headingKey)}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  {col.items.map((item) => (
                                    <MobileNavItem
                                      key={item.labelKey}
                                      item={item}
                                      t={tNav}
                                      tCommon={tCommon}
                                      onNavigate={closeMobile}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              {/* Bottom CTAs */}
              <div className="border-t border-border/40 p-3 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={closeMobile}>
                    {t("ctaSignIn")}
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register" onClick={closeMobile}>
                    {t("ctaPrimary")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
