'use client';

// ==========================================
// FEATURE VISUALS — Magic UI bento parity (v14)
// File: src/components/marketing/shared/feature-visuals.tsx
//
// CHANGED in v14:
//   - ChannelsVisual: ganti semua social icons jadi sosmed
//     (Instagram, TikTok, X/Twitter, Reddit, WhatsApp)
//   - Hub center: ganti OpenAI SVG → Globe (lucide-react)
//   - User icon: ganti SVG inline → User (lucide-react)
//   - Semua SVG custom icons dihapus, Icons object diganti sosmed
//
// PRESERVED from v13:
//   - StudioVisual (Marquee templates)
//   - OrdersVisual (AnimatedList notifs, 4 entries, no 5x dup)
//   - SaveTimeVisual (react-day-picker v9 port)
//   - Beam visual config (default pathColor gray, gradient orange→purple)
// ==========================================

import { forwardRef, useRef, useState } from 'react';
import {
  CalendarIcon,
  BellIcon,
  Share2Icon,
  Palette,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Star,
  Globe,
  User,
} from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { Calendar } from '@/components/ui/calendar';
import { AnimatedList } from '@/components/ui/animated-list';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { Marquee } from '@/components/ui/marquee';
import type { FeatureVisualKey } from '@/types/marketing';

// ──────────────────────────────────────────────────────────────────
// 1. STUDIO MARQUEE
// ──────────────────────────────────────────────────────────────────

interface TemplateItem {
  name: string;
  body: string;
}

const TEMPLATES: TemplateItem[] = [
  { name: 'Bold', body: 'Confident type, oversized photos.' },
  { name: 'Minimal', body: 'Whitespace and clean grids.' },
  { name: 'Pastel', body: 'Soft palette, rounded corners.' },
  { name: 'Editorial', body: 'Magazine layout, serif headlines.' },
  { name: 'Mono', body: 'Black-and-white, one accent.' },
  { name: 'Sunset', body: 'Warm gradients for cafes.' },
  { name: 'Linen', body: 'Earthy neutrals for makers.' },
  { name: 'Inkwell', body: 'Deep navy, handwritten accents.' },
];

function StudioVisual() {
  return (
    <Marquee
      pauseOnHover
      className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
    >
      {TEMPLATES.map((f, idx) => (
        <figure
          key={idx}
          className={cn(
            'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
            'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
            'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
            'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none',
          )}
        >
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium dark:text-white">
                {f.name}
              </figcaption>
            </div>
          </div>
          <blockquote className="mt-2 text-xs">{f.body}</blockquote>
        </figure>
      ))}
    </Marquee>
  );
}

// ──────────────────────────────────────────────────────────────────
// 2. ORDER NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────

interface NotifItem {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  time: string;
}

const NOTIFICATIONS: NotifItem[] = [
  {
    name: 'Order baru — Rp 110.000',
    description: 'Aldo · Kopi Gayo 250g',
    time: 'baru saja',
    icon: ShoppingBag,
    color: '#1E86FF',
  },
  {
    name: 'Pembayaran masuk',
    description: 'Rp 110.000 · transfer BCA',
    time: '1 menit lalu',
    icon: CreditCard,
    color: '#00C9A7',
  },
  {
    name: 'Review baru',
    description: 'Imelda: "Kopinya enak banget!"',
    time: '3 menit lalu',
    icon: Star,
    color: '#FFB800',
  },
  {
    name: 'Chat WhatsApp',
    description: 'Budi: "Stok House Blend masih ada?"',
    time: '5 menit lalu',
    icon: MessageCircle,
    color: '#FF3D71',
  },
];

const Notification = ({
  name,
  description,
  icon: Icon,
  color,
  time,
}: NotifItem) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        'transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <Icon className="size-5 text-white" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

function OrdersVisual() {
  return (
    <AnimatedList className="absolute right-2 top-4 h-[300px] w-full origin-top-right scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90">
      {NOTIFICATIONS.map((item, idx) => (
        <Notification {...item} key={idx} />
      ))}
    </AnimatedList>
  );
}

// ──────────────────────────────────────────────────────────────────
// 3. CHANNELS ANIMATED BEAM
//    Hub: Globe (lucide-react)
//    User: User (lucide-react)
//    Sosmed: Instagram, TikTok, X/Twitter, Reddit, WhatsApp (SVG inline)
// ──────────────────────────────────────────────────────────────────

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

function ChannelsVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden p-10 [mask-image:linear-gradient(to_top,transparent_5%,#000_30%)]"
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        {/* Left: User */}
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <User className="size-6 text-gray-700" />
          </Circle>
        </div>

        {/* Center: Globe hub */}
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-16">
            <Globe className="size-8 text-gray-800" />
          </Circle>
        </div>

        {/* Right: 5 sosmed icons */}
        <div className="flex flex-col justify-center gap-2">
          {/* Instagram */}
          <Circle ref={div1Ref}>
            <SosmedIcon.Instagram />
          </Circle>
          {/* TikTok */}
          <Circle ref={div2Ref}>
            <SosmedIcon.TikTok />
          </Circle>
          {/* X / Twitter */}
          <Circle ref={div3Ref}>
            <SosmedIcon.X />
          </Circle>
          {/* Reddit */}
          <Circle ref={div4Ref}>
            <SosmedIcon.Reddit />
          </Circle>
          {/* WhatsApp */}
          <Circle ref={div5Ref}>
            <SosmedIcon.WhatsApp />
          </Circle>
        </div>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} duration={3} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// SOSMED ICONS — inline SVG, siap drop ke dalam Circle 48px
// ──────────────────────────────────────────────────────────────────

const SosmedIcon = {
  Instagram: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-a" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        fill="url(#ig-a)"
      />
    </svg>
  ),

  TikTok: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z"
        fill="#000000"
      />
    </svg>
  ),

  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="#000000"
      />
    </svg>
  ),

  Reddit: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#FF4500" />
      <path
        d="M20.998 12.006c0-.93-.756-1.686-1.686-1.686-.456 0-.864.18-1.164.474-1.146-.822-2.724-1.356-4.476-1.422l.762-3.576 2.478.528c.018.624.528 1.128 1.164 1.128.648 0 1.176-.528 1.176-1.176s-.528-1.176-1.176-1.176c-.474 0-.882.282-1.086.69l-2.784-.594c-.078-.018-.156 0-.21.042-.054.042-.09.108-.108.18l-.852 3.99c-1.776.054-3.372.588-4.53 1.416a1.684 1.684 0 0 0-1.164-.474c-.93 0-1.686.756-1.686 1.686 0 .678.402 1.26.984 1.53-.024.168-.036.342-.036.516 0 2.616 3.048 4.74 6.804 4.74s6.804-2.124 6.804-4.74c0-.174-.012-.348-.036-.516.582-.27.984-.852.984-1.554zm-12 1.176c0-.648.528-1.176 1.176-1.176s1.176.528 1.176 1.176-.528 1.176-1.176 1.176-1.176-.528-1.176-1.176zm6.564 3.114c-.81.81-2.358.87-2.814.87s-2.004-.06-2.814-.87a.408.408 0 0 1 0-.576.408.408 0 0 1 .576 0c.516.516 1.614.696 2.238.696s1.722-.18 2.238-.696a.408.408 0 0 1 .576 0 .408.408 0 0 1 0 .576zm-.204-1.938c-.648 0-1.176-.528-1.176-1.176s.528-1.176 1.176-1.176 1.176.528 1.176 1.176-.528 1.176-1.176 1.176z"
        fill="#ffffff"
      />
    </svg>
  ),

  WhatsApp: () => (
    <svg width="24" height="24" viewBox="0 0 175.216 175.552" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wa-g" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#wa-g)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  ),
};

// ──────────────────────────────────────────────────────────────────
// 4. SAVE YOUR TIME CALENDAR
// ──────────────────────────────────────────────────────────────────

function SaveTimeVisual() {
  const [today] = useState(() => new Date());

  return (
    <Calendar
      mode="single"
      selected={today}
      defaultMonth={today}
      className="absolute right-0 top-10 origin-top scale-75 rounded-md border bg-card [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
    />
  );
}

// ==========================================
// REGISTRIES — keyed by FeatureVisualKey
// ==========================================

export const FEATURE_VISUALS: Record<FeatureVisualKey, React.ComponentType> = {
  studio: StudioVisual,
  orders: OrdersVisual,
  channels: ChannelsVisual,
  saveTime: SaveTimeVisual,
};

export const FEATURE_ICONS: Record<
  FeatureVisualKey,
  React.ComponentType<{ className?: string }>
> = {
  studio: Palette,
  orders: BellIcon,
  channels: Share2Icon,
  saveTime: CalendarIcon,
};