'use client';

import { useState } from 'react';
import {
  Home,
  FileText,
  MapPin,
  CreditCard,
  Truck,
  Share2,
  ChevronRight,
  Sun,
  Moon,
  Crown,
  LogOut,
  HelpCircle,
  ScrollText,
  Shield,
  Phone,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useDarkMode } from '@/hooks/shared/use-dark-mode';
import { useLogout } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';

// ── Section components ────────────────────────────────────────────────────
import { HeroSection } from '@/components/dashboard/settings/hero';
import { AboutSection } from '@/components/dashboard/settings/about';
import { ContactSection } from '@/components/dashboard/settings/contact';
import { PembayaranSection } from '@/components/dashboard/settings/payment';
import { PengirimanSection } from '@/components/dashboard/settings/shipping';
import { SocialSection } from '@/components/dashboard/settings/social';

// ── Types ─────────────────────────────────────────────────────────────────

type SettingId =
  | 'hero'
  | 'about'
  | 'contact'
  | 'pembayaran'
  | 'pengiriman'
  | 'social';

interface SettingItem {
  id: SettingId;
  label: string;
  description: string;
  icon: React.ElementType;
  group: string;
}

// ── Config ────────────────────────────────────────────────────────────────

const SETTING_GROUPS = [
  {
    group: 'Toko',
    items: [
      {
        id: 'hero' as const,
        label: 'Bio',
        description: 'Name, logo, headline & brand color',
        icon: Home,
        group: 'Toko',
      },
      {
        id: 'about' as const,
        label: 'Featured',
        description: 'Key highlights & store selling points',
        icon: FileText,
        group: 'Toko',
      },
      {
        id: 'contact' as const,
        label: 'Contact',
        description: 'WhatsApp, address & Google Maps',
        icon: MapPin,
        group: 'Toko',
      },
    ],
  },
  {
    group: 'Channels',
    items: [
      {
        id: 'pembayaran' as const,
        label: 'Payment',
        description: 'Bank accounts, e-wallets & COD',
        icon: CreditCard,
        group: 'Channels',
      },
      {
        id: 'pengiriman' as const,
        label: 'Shipping',
        description: 'Courier options for your store',
        icon: Truck,
        group: 'Channels',
      },
      {
        id: 'social' as const,
        label: 'Social',
        description: 'Instagram, TikTok, WhatsApp & more',
        icon: Share2,
        group: 'Channels',
      },
    ],
  },
] satisfies { group: string; items: SettingItem[] }[];

// ── Reusable row button ───────────────────────────────────────────────────

function RowButton({
  icon: Icon,
  label,
  description,
  onClick,
  iconClassName,
  labelClassName,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  iconClassName?: string;
  labelClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3.5',
        'text-left transition-colors',
        'hover:bg-muted/50 active:bg-muted',
      )}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold text-foreground leading-tight', labelClassName)}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </button>
  );
}

// ── Settings List ─────────────────────────────────────────────────────────

function SettingsList({ onSelect }: { onSelect: (id: SettingId) => void }) {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { logout } = useLogout();
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Toko */}
      <div>
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
          Toko
        </p>
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          {SETTING_GROUPS[0].items.map((item) => (
            <RowButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Channels */}
      <div>
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
          Channels
        </p>
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          {SETTING_GROUPS[1].items.map((item) => (
            <RowButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
          Account
        </p>
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          <RowButton
            icon={Crown}
            label="Subscription"
            description="Manage your plan and billing"
            onClick={() => router.push('/dashboard/subscription')}
          />
          <RowButton
            icon={isDark ? Sun : Moon}
            label={isDark ? 'Light Mode' : 'Dark Mode'}
            description={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleDarkMode}
          />
        </div>
      </div>

      {/* Legalitas */}
      <div>
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
          Legalitas
        </p>
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          <RowButton
            icon={Info}
            label="Tentang Fibidy"
            description="FAQ, kontak, syarat, dan privasi"
            onClick={() => router.push('/legal')}
          />
        </div>
      </div>

      {/* Sign Out — card sendiri, destructive */}
      <div>
        <div className="rounded-xl border border-destructive/20 overflow-hidden bg-card">
          <button
            type="button"
            onClick={logout}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-3.5',
              'text-left transition-colors',
              'hover:bg-destructive/5 active:bg-destructive/10',
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 shrink-0">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-destructive leading-tight">Sign Out</p>
              <p className="text-xs text-muted-foreground mt-0.5">Log out from your account</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}

// ── Main Client ───────────────────────────────────────────────────────────

export function SettingsClient() {
  const [activeId, setActiveId] = useState<SettingId | null>(null);

  const handleBack = () => setActiveId(null);

  if (activeId === null) {
    return <SettingsList onSelect={setActiveId} />;
  }

  const sectionMap: Record<SettingId, React.ReactNode> = {
    hero: <HeroSection onBack={handleBack} />,
    about: <AboutSection onBack={handleBack} />,
    contact: <ContactSection onBack={handleBack} />,
    pembayaran: <PembayaranSection onBack={handleBack} />,
    pengiriman: <PengirimanSection onBack={handleBack} />,
    social: <SocialSection onBack={handleBack} />,
  };

  return sectionMap[activeId];
}