import {
  type LucideIcon,
  LayoutTemplate,
  Palette,
  Inbox,
  MessageCircle,
  Globe,
  Lock,
  Sparkles,
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
  UtensilsCrossed,
  Coffee,
  Shirt,
  Scissors,
  ShoppingBasket,
  SprayCan,
  Server,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────
 * Mega-menu data model
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
  headingKey?: string;
  items: NavItem[];
};

export type NavMenuEntry = {
  kind: "menu";
  labelKey: string;
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
 * [v15.4 cleanup] Hrefs simplified to plain `/#store-builder` —
 * dropped the `?preselect=<code>` query param. The StoreBuilder
 * section doesn't read `preselect` yet, so the param was a false
 * promise (visitor clicks "Restaurant" → just scrolls, chip stays
 * unselected). When `?preselect=` reading lands in StoreBuilder,
 * re-add the param here.
 * ────────────────────────────────────────────────────────────────── */

type SolutionItem = {
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
};

const SOLUTION_ITEMS: SolutionItem[] = [
  {
    labelKey: "restaurant.label",
    descKey: "restaurant.desc",
    icon: UtensilsCrossed,
  },
  {
    labelKey: "coffeeshop.label",
    descKey: "coffeeshop.desc",
    icon: Coffee,
  },
  {
    labelKey: "fashion.label",
    descKey: "fashion.desc",
    icon: Shirt,
  },
  {
    labelKey: "beautySalon.label",
    descKey: "beautySalon.desc",
    icon: Scissors,
  },
  {
    labelKey: "cleaning.label",
    descKey: "cleaning.desc",
    icon: SprayCan,
  },
  {
    labelKey: "retail.label",
    descKey: "retail.desc",
    icon: ShoppingBasket,
  },
];

const solutionItem = (s: SolutionItem): NavItem => ({
  labelKey: `solutions.${s.labelKey}`,
  descKey: `solutions.${s.descKey}`,
  href: "/#store-builder",
  icon: s.icon,
});

/* ══════════════════════════════════════════════════════════════════
 * MAIN MEGA-MENU STRUCTURE — v15.4 cleanup (May 2026)
 *
 * 5 triggers:
 *   1. PRODUCT     — features (3 cols × 3 items = 9)
 *   2. RESOURCES   — help, money/trust, updates (3 cols, 3-4-2)
 *                    "Stay Updated" trimmed from 3 → 2 items
 *                    (Blog + Changelog only; Docs removed).
 *   3. SOLUTIONS   — 6 verticals (3 cols × 2 = 6)
 *                    Hrefs no longer carry ?preselect= query (false
 *                    promise — see SOLUTION_ITEMS comment above).
 *   4. ENTERPRISE  — direct link to /legal/seller-agreement.
 *                    Demoted from mega-menu (was 1 col × 3 items —
 *                    too thin to justify a panel).
 *   5. PRICING     — direct link to /#pricing
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
   * v15.4: "Stay Updated" trimmed to 2 items (Blog + Changelog).
   * Docs removed — was a third Soon-flag with no concrete launch
   * plan, made the column feel like filler.
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

  /* ════ ENTERPRISE (direct link, no dropdown) ══════════════════
   * v15.4: demoted from mega-menu. Was 1 col × 3 items — visually
   * thin and inconsistent with the other 3-col mega-menus.
   * Routes /legal/acceptable-use moved to footer Legal column.
   * /#scale already exposed via Product > Scale Infrastructure.
   * ──────────────────────────────────────────────────────────── */
  {
    kind: "link",
    id: "enterprise",
    labelKey: "triggers.enterprise",
    href: "/legal/seller-agreement",
  },

  /* ════ PRICING (direct link, no dropdown) ════════════════════ */
  {
    kind: "link",
    id: "pricing",
    labelKey: "triggers.pricing",
    href: "/#pricing",
  },
];