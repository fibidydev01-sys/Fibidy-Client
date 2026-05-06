import {
  type LucideIcon,
  LayoutTemplate,
  Palette,
  Inbox,
  MessageCircle,
  Globe,
  Lock,
  Sparkles,
  HardDrive,
  BarChart3,
  HelpCircle,
  Mail,
  Compass,
  Receipt,
  Wallet,
  Banknote,
  BadgeCheck,
  Newspaper,
  History,
  BookOpen,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Scissors,
  ShoppingBasket,
  SprayCan,
  Building2,
  Handshake,
  ScrollText,
  Server,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────
 * Mega-menu data model
 *
 * Each top-level entry is either:
 *   - { kind: "link" }   → direct anchor/link, no dropdown (e.g. Pricing)
 *   - { kind: "menu" }   → trigger with dropdown content (Vercel pattern)
 *
 * Items inside a menu group carry:
 *   - labelKey / descKey → i18n keys under `marketing.header.nav.items.*`
 *   - href               → final URL (locale-aware Link handles prefix)
 *   - icon               → Lucide icon component
 *   - soon?              → if true, render with "Soon" badge + non-clickable
 *   - external?          → opens in new tab
 * ────────────────────────────────────────────────────────────────── */

export type NavItem = {
  labelKey: string;
  descKey: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
  external?: boolean;
};

export type NavColumn = {
  /** i18n key under `marketing.header.nav.columns.*` — optional column heading */
  headingKey?: string;
  items: NavItem[];
};

export type NavMenuEntry = {
  kind: "menu";
  /** i18n key under `marketing.header.nav.triggers.*` */
  labelKey: string;
  /** unique slug used as React key + a11y id */
  id: string;
  columns: NavColumn[];
};

export type NavLinkEntry = {
  kind: "link";
  labelKey: string;
  id: string;
  href: string;
};

export type NavEntry = NavMenuEntry | NavLinkEntry;

/* ──────────────────────────────────────────────────────────────────
 * Solutions → category mapping
 *
 * Codes mirror registry keys validated at module-load time in
 * `src/lib/data/marketing/store-builder.ts` (which in turn validates
 * against `src/lib/constants/shared/categories.ts`).
 *
 * Hrefs use `/#store-builder?preselect=<code>` so the StoreBuilder
 * section can read the query param and pre-select the chip on landing.
 * If StoreBuilder doesn't yet implement `?preselect` parsing, the
 * anchor still works — visitor lands on the section, just without
 * auto-pick. Backward-compatible by design.
 *
 * Inline string-literal union avoids a bogus type import — the
 * store-builder module exports `BuilderCategoryData` (with field
 * `categoryKey: string`), NOT a `CategoryCode` type. Listing the 6
 * valid codes here gives autocomplete + compile-time check anyway.
 * ────────────────────────────────────────────────────────────────── */

type SolutionCategoryCode =
  | "RESTAURANT"
  | "CAFE"
  | "FASHION_APPAREL"
  | "HAIR_SALON"
  | "CLEANING_SERVICE"
  | "GROCERY_CONVENIENCE";

type SolutionItem = {
  code: SolutionCategoryCode;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
};

const SOLUTION_ITEMS: SolutionItem[] = [
  {
    code: "RESTAURANT",
    labelKey: "restaurant.label",
    descKey: "restaurant.desc",
    icon: UtensilsCrossed,
  },
  {
    code: "CAFE",
    labelKey: "coffeeshop.label",
    descKey: "coffeeshop.desc",
    icon: Coffee,
  },
  {
    code: "FASHION_APPAREL",
    labelKey: "fashion.label",
    descKey: "fashion.desc",
    icon: Shirt,
  },
  {
    code: "HAIR_SALON",
    labelKey: "beautySalon.label",
    descKey: "beautySalon.desc",
    icon: Scissors,
  },
  {
    code: "CLEANING_SERVICE",
    labelKey: "cleaning.label",
    descKey: "cleaning.desc",
    icon: SprayCan,
  },
  {
    code: "GROCERY_CONVENIENCE",
    labelKey: "retail.label",
    descKey: "retail.desc",
    icon: ShoppingBasket,
  },
];

const solutionItem = (s: SolutionItem): NavItem => ({
  labelKey: `solutions.${s.labelKey}`,
  descKey: `solutions.${s.descKey}`,
  href: `/#store-builder?preselect=${s.code}`,
  icon: s.icon,
});

/* ══════════════════════════════════════════════════════════════════
 * MAIN MEGA-MENU STRUCTURE — Route-complete coverage (May 2026)
 *
 * 5 triggers (Vercel parity):
 *   1. PRODUCT     — features (3 cols × 3 items = 9)
 *   2. RESOURCES   — help, money/trust, updates (3 cols, 3-4-3)
 *                    → covers /legal/{faq,contact,fees,payment,payout,kyc}
 *                    → covers /discover
 *   3. SOLUTIONS   — 6 industry verticals (3 cols × 2 items = 6)
 *                    → covers /#store-builder?preselect=<code>
 *   4. ENTERPRISE  — scale + B2B legal (1 col × 3 items)
 *                    → covers /legal/{seller-agreement,acceptable-use}
 *   5. PRICING     — direct anchor link to /#pricing
 *
 * Routes deliberately covered in footer.ts instead of header:
 *   - /legal/terms, /legal/privacy, /legal/refund
 *
 * Routes intentionally OMITTED (not visitor-facing):
 *   - /admin/*, /dashboard/*, /checkout/*, /onboard/*, /store/*
 *   - /register, /login, /forgot-password (handled via header CTAs)
 *   - All [id], [slug] dynamic routes (rendered from data, not nav)
 * ══════════════════════════════════════════════════════════════════ */

export const headerNav: NavEntry[] = [
  /* ════ PRODUCT ════════════════════════════════════════════════ */
  {
    kind: "menu",
    id: "product",
    labelKey: "triggers.product",
    columns: [
      {
        headingKey: "columns.build",
        items: [
          {
            labelKey: "product.storefrontBuilder.label",
            descKey: "product.storefrontBuilder.desc",
            href: "/#store-builder",
            icon: LayoutTemplate,
          },
          {
            labelKey: "product.templates.label",
            descKey: "product.templates.desc",
            href: "/#features",
            icon: Palette,
          },
          {
            labelKey: "product.orderInbox.label",
            descKey: "product.orderInbox.desc",
            href: "/#features",
            icon: Inbox,
          },
        ],
      },
      {
        headingKey: "columns.connect",
        items: [
          {
            labelKey: "product.whatsapp.label",
            descKey: "product.whatsapp.desc",
            href: "/#features",
            icon: MessageCircle,
          },
          {
            labelKey: "product.customDomain.label",
            descKey: "product.customDomain.desc",
            href: "/#scale",
            icon: Globe,
          },
          {
            labelKey: "product.ssl.label",
            descKey: "product.ssl.desc",
            href: "/#scale",
            icon: Lock,
          },
        ],
      },
      {
        headingKey: "columns.platform",
        items: [
          {
            labelKey: "product.bento.label",
            descKey: "product.bento.desc",
            href: "/#features",
            icon: Sparkles,
          },
          {
            labelKey: "product.scale.label",
            descKey: "product.scale.desc",
            href: "/#scale",
            icon: Server,
          },
          {
            labelKey: "product.analytics.label",
            descKey: "product.analytics.desc",
            href: "#",
            icon: BarChart3,
            soon: true,
          },
        ],
      },
    ],
  },

  /* ════ RESOURCES ══════════════════════════════════════════════
   * Covers: /legal/faq, /legal/contact, /discover (col 1)
   *         /legal/fees, /legal/payment, /legal/payout, /legal/kyc (col 2)
   *         soon-flagged blog/changelog/docs (col 3)
   * ──────────────────────────────────────────────────────────── */
  {
    kind: "menu",
    id: "resources",
    labelKey: "triggers.resources",
    columns: [
      {
        headingKey: "columns.getHelp",
        items: [
          {
            labelKey: "resources.faq.label",
            descKey: "resources.faq.desc",
            href: "/legal/faq",
            icon: HelpCircle,
          },
          {
            labelKey: "resources.contact.label",
            descKey: "resources.contact.desc",
            href: "/legal/contact",
            icon: Mail,
          },
          {
            labelKey: "resources.discover.label",
            descKey: "resources.discover.desc",
            href: "/discover",
            icon: Compass,
          },
        ],
      },
      {
        headingKey: "columns.howItWorks",
        items: [
          {
            labelKey: "resources.fees.label",
            descKey: "resources.fees.desc",
            href: "/legal/fees",
            icon: Receipt,
          },
          {
            labelKey: "resources.payment.label",
            descKey: "resources.payment.desc",
            href: "/legal/payment",
            icon: Wallet,
          },
          {
            labelKey: "resources.payout.label",
            descKey: "resources.payout.desc",
            href: "/legal/payout",
            icon: Banknote,
          },
          {
            labelKey: "resources.kyc.label",
            descKey: "resources.kyc.desc",
            href: "/legal/kyc",
            icon: BadgeCheck,
          },
        ],
      },
      {
        headingKey: "columns.updates",
        items: [
          {
            labelKey: "resources.blog.label",
            descKey: "resources.blog.desc",
            href: "#",
            icon: Newspaper,
            soon: true,
          },
          {
            labelKey: "resources.changelog.label",
            descKey: "resources.changelog.desc",
            href: "#",
            icon: History,
            soon: true,
          },
          {
            labelKey: "resources.docs.label",
            descKey: "resources.docs.desc",
            href: "#",
            icon: BookOpen,
            soon: true,
          },
        ],
      },
    ],
  },

  /* ════ SOLUTIONS ══════════════════════════════════════════════ */
  {
    kind: "menu",
    id: "solutions",
    labelKey: "triggers.solutions",
    columns: [
      {
        headingKey: "columns.foodBev",
        items: [
          solutionItem(SOLUTION_ITEMS[0]), // Restaurant
          solutionItem(SOLUTION_ITEMS[1]), // Coffee Shop
        ],
      },
      {
        headingKey: "columns.lifestyle",
        items: [
          solutionItem(SOLUTION_ITEMS[2]), // Fashion
          solutionItem(SOLUTION_ITEMS[3]), // Beauty Salon
        ],
      },
      {
        headingKey: "columns.services",
        items: [
          solutionItem(SOLUTION_ITEMS[4]), // Cleaning
          solutionItem(SOLUTION_ITEMS[5]), // Retail
        ],
      },
    ],
  },

  /* ════ ENTERPRISE ═════════════════════════════════════════════
   * Covers: /legal/seller-agreement, /legal/acceptable-use,
   *         and the /#scale section (multi-tenant proof point)
   * ──────────────────────────────────────────────────────────── */
  {
    kind: "menu",
    id: "enterprise",
    labelKey: "triggers.enterprise",
    columns: [
      {
        headingKey: "columns.scale",
        items: [
          {
            labelKey: "enterprise.bulkDomain.label",
            descKey: "enterprise.bulkDomain.desc",
            href: "/#scale",
            icon: Building2,
          },
          {
            labelKey: "enterprise.whitelabel.label",
            descKey: "enterprise.whitelabel.desc",
            href: "/legal/seller-agreement",
            icon: Handshake,
          },
          {
            labelKey: "enterprise.acceptableUse.label",
            descKey: "enterprise.acceptableUse.desc",
            href: "/legal/acceptable-use",
            icon: ScrollText,
          },
        ],
      },
    ],
  },

  /* ════ PRICING (direct link, no dropdown) ════════════════════ */
  {
    kind: "link",
    id: "pricing",
    labelKey: "triggers.pricing",
    href: "/#pricing",
  },
];