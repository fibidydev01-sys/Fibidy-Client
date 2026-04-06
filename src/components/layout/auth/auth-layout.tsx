import type { ReactNode } from 'react';
import Image from 'next/image';
import { AuthLogo } from './auth-logo';

// ==========================================
// AUTH LAYOUT COMPONENT
// - Tanpa image: centered layout
//   · Desktop: tanpa card, full width
//   · Mobile: dengan card wrapper
// - Dengan image: 2 kolom split layout
// - title bersifat opsional — wizard steps menangani header sendiri
// ==========================================

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  badge?: ReactNode;
  image?: string;
  imageAlt?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  badge,
  image,
  imageAlt = 'Auth Image',
}: AuthLayoutProps) {

  // ==========================================
  // 2 KOLOM — jika ada image (login, forgot-password)
  // ==========================================
  if (image) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Kolom Kiri — Form */}
        <div className="flex flex-col p-6 md:p-10">
          <div className="flex justify-center md:justify-start">
            <AuthLogo size="md" />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              {(title || badge) && (
                <div className="mb-6 text-center">
                  {badge && (
                    <div className="flex justify-center mb-2">{badge}</div>
                  )}
                  {title && <h1 className="text-2xl font-bold">{title}</h1>}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>

        {/* Kolom Kanan — Gambar */}
        <div className="relative hidden lg:block">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    );
  }

  // ==========================================
  // CENTERED — tanpa image (register, dll)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Logo */}
      <div className="mb-8">
        <AuthLogo size="lg" />
      </div>

      {/* ── DESKTOP: tanpa card ── */}
      <div className="hidden lg:flex lg:flex-col lg:items-center w-full max-w-2xl">
        {(title || badge) && (
          <div className="text-center mb-8">
            {badge && <div className="flex justify-center mb-2">{badge}</div>}
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>

      {/* ── MOBILE: card wrapper ── */}
      <div className="lg:hidden w-full max-w-md">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          {(title || badge) && (
            <div className="text-center mb-6">
              {badge && <div className="flex justify-center mb-2">{badge}</div>}
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {description && (
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Fibidy. All rights reserved.
      </p>
    </div>
  );
}