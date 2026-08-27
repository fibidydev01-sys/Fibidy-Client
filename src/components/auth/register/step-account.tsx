'use client';

// ============================================================================
// STEP ACCOUNT
// File: src/components/auth/register/step-account.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// - Tambah props fieldErrors + onClearFieldError
// - Field email, password, whatsapp highlight merah saat ada error
// - Merah hilang saat user mulai ketik/input
//
// [PHONE FIX v2 — May 2026]
// Per-country prefix validation + length validation.
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
import { Eye, EyeOff, Check, X, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  stripLeadingZero,
  validateLocalPhone,
  type CountryCode,
} from '@/lib/shared/validations/phone';
import {
  PASSWORD_RULES,
  getPasswordStrength,
  type StrengthLevel,
} from '@/lib/shared/validations/password';

// ============================================================================
// PASSWORD STRENGTH COMPONENT
// ============================================================================

function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations('auth.register.account');
  const strength = useMemo(() => getPasswordStrength(password), [password]);
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
            <span
              className={cn(
                'text-xs transition-colors',
                rule.passed ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
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
  hiddenFields?: Array<'whatsapp'>;
  // [SPRINT 5]
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
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
  fieldErrors = new Set(),
  onClearFieldError,
}: StepAccountProps) {
  const t = useTranslations('auth.register.account');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [localPhone, setLocalPhone] = useState<string>(() => {
    if (!whatsapp) return '';
    const dial = DEFAULT_COUNTRY.code.replace('+', '');
    const stripped = whatsapp.startsWith(dial) ? whatsapp.slice(dial.length) : whatsapp;
    return stripLeadingZero(stripped);
  });
  const [phoneTouched, setPhoneTouched] = useState(false);

  const showWhatsapp = !hiddenFields.includes('whatsapp');

  const hasEmailError = fieldErrors.has('email');
  const hasPasswordError = fieldErrors.has('password');
  const hasWhatsappError = fieldErrors.has('whatsapp');

  const phoneValidation = useMemo(
    () => validateLocalPhone(localPhone, selectedCountry),
    [localPhone, selectedCountry],
  );

  const phoneHintMessage = useMemo(() => {
    if (!phoneTouched || !localPhone) return null;
    if (!phoneValidation.valid) {
      if (phoneValidation.reason === 'prefix') {
        return t('whatsappInvalidPrefix', { prefix: selectedCountry.rule.prefixHint });
      }
      if (phoneValidation.reason === 'tooShort') {
        return t('whatsappTooShort', { min: selectedCountry.rule.min });
      }
    }
    return null;
  }, [phoneTouched, localPhone, phoneValidation, selectedCountry, t]);

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    setLocalPhone('');
    setPhoneTouched(false);
    onUpdate({ whatsapp: '' });
    if (hasWhatsappError) onClearFieldError?.('whatsapp');
  };

  const handlePhoneChange = (value: string) => {
    if (hasWhatsappError) onClearFieldError?.('whatsapp');
    const digits = stripLeadingZero(value.replace(/\D/g, ''));
    const capped = digits.slice(0, selectedCountry.rule.max);
    setLocalPhone(capped);
    setPhoneTouched(true);
    const dial = selectedCountry.code.replace('+', '');
    onUpdate({ whatsapp: capped ? dial + capped : '' });
  };

  return (
    <div className="space-y-5 max-w-md">

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="acc-email"
        >
          {t('emailLabel')}
        </Label>
        <Input
          id="acc-email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            if (hasEmailError) onClearFieldError?.('email');
            onUpdate({ email: e.target.value });
          }}
          className={cn(
            hasEmailError && 'border-destructive focus-visible:ring-destructive',
          )}
        />
        {hasEmailError && (
          <p className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {t('emailTaken')}
          </p>
        )}
      </div>

      <div className="border-t" />

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="acc-password"
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
            onChange={(e) => {
              if (hasPasswordError) onClearFieldError?.('password');
              onUpdate({ password: e.target.value });
            }}
            className={cn(
            hasPasswordError && 'border-destructive focus-visible:ring-destructive',
            )}
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
        {hasPasswordError && (
          <p className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {t('passwordWeak')}
          </p>
        )}
        <PasswordStrength password={password} />
      </div>

      {/* WhatsApp */}
      {showWhatsapp && (
        <>
          <div className="border-t" />
          <div className="space-y-1.5">
            <Label
              htmlFor="acc-whatsapp"
            >
              {t('whatsappLabel')}
            </Label>

            <div className="flex gap-2 overflow-hidden">
              {/* Country dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-11 gap-1.5 px-3 shrink-0 font-normal text-sm',
                      hasWhatsappError && 'border-destructive',
                    )}
                    type="button"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-muted-foreground">{selectedCountry.code}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto" align="start">
                  <DropdownMenuLabel className="text-caption-uppercase caption-uppercase text-muted-foreground">
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
                  <DropdownMenuLabel className="text-caption-uppercase caption-uppercase text-muted-foreground">
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

              {/* Local phone input */}
              <Input
                id="acc-whatsapp"
                type="tel"
                inputMode="numeric"
                placeholder={t('whatsappPlaceholder', { hint: selectedCountry.rule.prefixHint })}
                className={cn(
                  'flex-1 min-w-0',
                  phoneTouched && localPhone && !phoneValidation.valid && 'border-destructive focus-visible:ring-destructive',
                  hasWhatsappError && 'border-destructive focus-visible:ring-destructive',
                )}
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={selectedCountry.rule.max}
              />
            </div>

            {/* Error messages */}
            {hasWhatsappError ? (
              <p className="flex items-center gap-1 text-xs text-destructive font-medium">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {t('whatsappRequired')}
              </p>
            ) : phoneHintMessage ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {phoneHintMessage}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('whatsappHelper')}
              </p>
            )}
          </div>
        </>
      )}

    </div>
  );
}
