'use client';

// ==========================================
// ORDERS ANIMATED LIST (FEATURES BENTO — 2nd tile)
// File: src/components/marketing/sections/features/visuals/orders-list.tsx
//
// [PHASE 4 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/features/visuals/index.tsx
// (was the OrdersVisual + Notification + NOTIFICATIONS block in the
// v14 monolith). Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Second bento tile — Magic UI AnimatedList with order/payment/
// review/chat notifications cycling on a sliding window. Mirrors
// the official Magic UI bento "Notifications" demo with Fibidy
// merchant-inbox copy (Indonesian names, IDR amounts).
//
// CLIENT — AnimatedList uses framer-motion (motion/react) +
// AnimatePresence for the enter/exit animations on each tick.
//
// 4 entries cycling indefinitely. v13 of AnimatedList primitive
// fixed the infinite-loop bug; this consumer no longer needs the
// 5x duplication workaround that the v12 version of feature-visuals
// shipped with.
// ==========================================

import {
  ShoppingBag,
  CreditCard,
  Star,
  MessageCircle,
} from 'lucide-react';
import { AnimatedList } from '@/components/ui/animated-list';
import { cn } from '@/lib/shared/utils';

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

function Notification({
  name,
  description,
  icon: Icon,
  color,
  time,
}: NotifItem) {
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
}

export function OrdersVisual() {
  return (
    <AnimatedList className="absolute right-2 top-4 h-[300px] w-full origin-top-right scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90">
      {NOTIFICATIONS.map((item, idx) => (
        <Notification {...item} key={idx} />
      ))}
    </AnimatedList>
  );
}
