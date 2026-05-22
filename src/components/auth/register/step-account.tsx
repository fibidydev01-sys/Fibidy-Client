'use client';

// ============================================================================
// STEP ACCOUNT
// File: src/components/auth/register/step-account.tsx
//
// [PHASE D — May 2026]
// +hiddenFields prop: array of field names to hide for BUYER flow.
// BUYER register tidak perlu WhatsApp — pass hiddenFields={['whatsapp']}.
// Jika hiddenFields tidak dipass, semua field tampil normal (SELLER/EDU).
//
// [PHASE C v2 — May 2026]
// WhatsApp field diganti dengan phone number dropdown global.
// ============================================================================

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

// ============================================================================
// COUNTRY CODES
// ============================================================================

interface CountryCode {
  code: string;
  iso: string;
  name: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+62', iso: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', iso: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: '+63', iso: 'PH', name: 'Filipina', flag: '🇵🇭' },
  { code: '+66', iso: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', iso: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+855', iso: 'KH', name: 'Kamboja', flag: '🇰🇭' },
  { code: '+856', iso: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: '+95', iso: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+673', iso: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: '+81', iso: 'JP', name: 'Jepang', flag: '🇯🇵' },
  { code: '+82', iso: 'KR', name: 'Korea Selatan', flag: '🇰🇷' },
  { code: '+86', iso: 'CN', name: 'Tiongkok', flag: '🇨🇳' },
  { code: '+886', iso: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+852', iso: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+92', iso: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', iso: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+966', iso: 'SA', name: 'Arab Saudi', flag: '🇸🇦' },
  { code: '+971', iso: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: '+974', iso: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+64', iso: 'NZ', name: 'Selandia Baru', flag: '🇳🇿' },
  { code: '+44', iso: 'GB', name: 'Inggris', flag: '🇬🇧' },
  { code: '+49', iso: 'DE', name: 'Jerman', flag: '🇩🇪' },
  { code: '+33', iso: 'FR', name: 'Prancis', flag: '🇫🇷' },
  { code: '+31', iso: 'NL', name: 'Belanda', flag: '🇳🇱' },
  { code: '+39', iso: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: '+34', iso: 'ES', name: 'Spanyol', flag: '🇪🇸' },
  { code: '+1', iso: 'US', name: 'Amerika Serikat', flag: '🇺🇸' },
  { code: '+1', iso: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: '+55', iso: 'BR', name: 'Brasil', flag: '🇧🇷' },
];

const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // Indonesia +62

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

interface PasswordRule {
  labelKey: 'minLength' | 'uppercase' | 'number' | 'symbol';
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { labelKey: 'minLength', test: (pw) => pw.length >= 8 },
  { labelKey: 'uppercase', test: (pw) => /[A-Z]/.test(pw) },
  { labelKey: 'number', test: (pw) => /[0-9]/.test(pw) },
  { labelKey: 'symbol', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface StrengthInfo {
  level: StrengthLevel;
  labelKey: '' | 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  textColor: string;
}

function getStrength(password: string): StrengthInfo {
  if (!password) {
    return { level: 0, labelKey: '', color: 'bg-border', textColor: 'text-muted-foreground' };
  }
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { level: 1, labelKey: 'weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (passed === 2) return { level: 2, labelKey: 'fair', color: 'bg-orange-400', textColor: 'text-orange-400' };
  if (passed === 3) return { level: 3, labelKey: 'good', color: 'bg-yellow-400', textColor: 'text-yellow-500' };
  return { level: 4, labelKey: 'strong', color: 'bg-green-500', textColor: 'text-green-600' };
}

function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations('auth.register.account');
  const strength = useMemo(() => getStrength(password), [password]);
  const rules = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );

  return (
    <div className="space-y-3 pt-1">
      {password && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {([1, 2, 3, 4] as StrengthLevel[]).map((seg) => (
              <div
                key={seg}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  strength.level >= seg ? strength.color : 'bg-border',
                )}
              />
            ))}
          </div>
          {strength.labelKey && (
            <p className={cn('text-[11px] font-semibold tracking-wide', strength.textColor)}>
              {t(`strength.${strength.labelKey}`)}
            </p>
          )}
        </div>
      )}
      <div className="space-y-1">
        {rules.map((rule) => (
          <div key={rule.labelKey} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors',
                rule.passed ? 'bg-green-500' : 'bg-border',
              )}
            >
              {rule.passed ? (
                <Check className="h-2 w-2 text-white" strokeWidth={3} />
              ) : (
                <X className="h-2 w-2 text-muted-foreground" strokeWidth={3} />
              )}
            </span>
            <span className={cn('text-xs transition-colors', rule.passed ? 'text-foreground' : 'text-muted-foreground')}>
              {t(`passwordRules.${rule.labelKey}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface StepAccountProps {
  email: string;
  password: string;
  whatsapp: string;
  onUpdate: (data: { email?: string; password?: string; whatsapp?: string }) => void;
  /**
   * [PHASE D] Fields to hide for specific intents.
   * BUYER intent: hiddenFields={['whatsapp']} — no WhatsApp needed
   * SELLER/EDU: omit or pass empty array — all fields shown
   */
  hiddenFields?: Array<'whatsapp'>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepAccount({
  email,
  password,
  whatsapp,
  onUpdate,
  hiddenFields = [],
}: StepAccountProps) {
  const t = useTranslations('auth.register.account');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [localPhone, setLocalPhone] = useState(() => {
    if (whatsapp.startsWith('62')) return whatsapp.slice(2);
    return whatsapp;
  });

  const showWhatsapp = !hiddenFields.includes('whatsapp');

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    const dialDigits = country.code.replace('+', '');
    onUpdate({ whatsapp: dialDigits + localPhone });
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setLocalPhone(cleaned);
    const dialDigits = selectedCountry.code.replace('+', '');
    onUpdate({ whatsapp: dialDigits + cleaned });
  };

  return (
    <div className="space-y-5 max-w-md">

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="acc-email"
          className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
        >
          {t('emailLabel')}
        </Label>
        <Input
          id="acc-email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          value={email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          className="h-11 text-sm placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">{t('emailHelper')}</p>
      </div>

      <div className="border-t" />

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="acc-password"
          className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
        >
          {t('passwordLabel')}
        </Label>
        <div className="relative">
          <Input
            id="acc-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            autoComplete="new-password"
            value={password}
            onChange={(e) => onUpdate({ password: e.target.value })}
            className="h-11 text-sm placeholder:text-muted-foreground/50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <PasswordStrength password={password} />
      </div>

      {/* WhatsApp — hidden for BUYER intent */}
      {showWhatsapp && (
        <>
          <div className="border-t" />

          <div className="space-y-1.5">
            <Label
              htmlFor="acc-whatsapp"
              className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
            >
              {t('whatsappLabel')}
            </Label>
            <div className="flex gap-2">
              {/* Country code dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 gap-1.5 px-3 shrink-0 font-normal text-sm"
                    type="button"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-muted-foreground">{selectedCountry.code}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto" align="start">
                  <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                    Asia Tenggara
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {COUNTRY_CODES.slice(0, 10).map((country) => (
                      <DropdownMenuItem
                        key={`${country.iso}-${country.code}`}
                        onClick={() => handleCountryChange(country)}
                        className="gap-2 cursor-pointer"
                      >
                        <span className="text-base">{country.flag}</span>
                        <span className="flex-1 text-sm">{country.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
                        {selectedCountry.iso === country.iso && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                    Asia & Lainnya
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {COUNTRY_CODES.slice(10).map((country) => (
                      <DropdownMenuItem
                        key={`${country.iso}-${country.code}`}
                        onClick={() => handleCountryChange(country)}
                        className="gap-2 cursor-pointer"
                      >
                        <span className="text-base">{country.flag}</span>
                        <span className="flex-1 text-sm">{country.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
                        {selectedCountry.iso === country.iso && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Phone number input */}
              <Input
                id="acc-whatsapp"
                type="tel"
                inputMode="numeric"
                placeholder={t('whatsappPlaceholder')}
                className="h-11 flex-1 text-sm placeholder:text-muted-foreground/50"
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('whatsappHelper')}</p>
          </div>
        </>
      )}

    </div>
  );
}
