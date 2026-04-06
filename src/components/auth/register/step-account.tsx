'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

// ==========================================
// TYPES
// ==========================================

interface StepAccountProps {
  email: string;
  password: string;
  whatsapp: string;
  onUpdate: (data: { email?: string; password?: string; whatsapp?: string }) => void;
}

// ==========================================
// PASSWORD STRENGTH
// ==========================================

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One symbol (e.g. !@#$%)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface StrengthInfo {
  level: StrengthLevel;
  label: string;
  color: string;
  textColor: string;
}

function getStrength(password: string): StrengthInfo {
  if (!password) {
    return { level: 0, label: '', color: 'bg-border', textColor: 'text-muted-foreground' };
  }

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;

  if (passed <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (passed === 2) return { level: 2, label: 'Fair', color: 'bg-orange-400', textColor: 'text-orange-400' };
  if (passed === 3) return { level: 3, label: 'Good', color: 'bg-yellow-400', textColor: 'text-yellow-500' };
  return { level: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
}

// ==========================================
// PASSWORD STRENGTH UI
// ==========================================

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => getStrength(password), [password]);
  const rules = useMemo(() =>
    PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );

  return (
    <div className="space-y-3 pt-1">

      {/* Bar — hanya muncul saat user mulai ketik */}
      {password && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {([1, 2, 3, 4] as StrengthLevel[]).map((seg) => (
              <div
                key={seg}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  strength.level >= seg ? strength.color : 'bg-border'
                )}
              />
            ))}
          </div>
          {strength.label && (
            <p className={cn('text-[11px] font-semibold tracking-wide', strength.textColor)}>
              {strength.label}
            </p>
          )}
        </div>
      )}

      {/* Rules checklist — selalu tampil */}
      <div className="space-y-1">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-2">
            <span className={cn(
              'flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 transition-colors',
              rule.passed ? 'bg-green-500' : 'bg-border'
            )}>
              {rule.passed
                ? <Check className="w-2 h-2 text-white" strokeWidth={3} />
                : <X className="w-2 h-2 text-muted-foreground" strokeWidth={3} />
              }
            </span>
            <span className={cn(
              'text-xs transition-colors',
              rule.passed ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ==========================================
// COMPONENT — tanpa header & nav (dihandle parent)
// ==========================================

export function StepAccount({ email, password, whatsapp, onUpdate }: StepAccountProps) {
  const [localEmail, setLocalEmail] = useState(email);
  const [localPassword, setLocalPassword] = useState(password);
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsapp);
  const [showPassword, setShowPassword] = useState(false);

  const handleWhatsappChange = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('62')) cleaned = cleaned.slice(2);
    const formatted = '62' + cleaned;
    setLocalWhatsapp(formatted);
    onUpdate({ whatsapp: formatted });
  };

  return (
    <div className="space-y-5 max-w-md">

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="acc-email" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Email address
        </Label>
        <Input
          id="acc-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={localEmail}
          onChange={(e) => { setLocalEmail(e.target.value); onUpdate({ email: e.target.value }); }}
          className="h-11 text-sm placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">Used to sign in to your store dashboard</p>
      </div>

      <div className="border-t" />

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="acc-password" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="acc-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            autoComplete="new-password"
            value={localPassword}
            onChange={(e) => { setLocalPassword(e.target.value); onUpdate({ password: e.target.value }); }}
            className="h-11 text-sm placeholder:text-muted-foreground/50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword
              ? <EyeOff className="h-4 w-4 text-muted-foreground" />
              : <Eye className="h-4 w-4 text-muted-foreground" />
            }
          </Button>
        </div>

        {/* Strength indicator */}
        <PasswordStrength password={localPassword} />
      </div>

      <div className="border-t" />

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <Label htmlFor="acc-whatsapp" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          WhatsApp number
        </Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground h-11">
            +62
          </span>
          <Input
            id="acc-whatsapp"
            type="tel"
            placeholder="81234567890"
            className="rounded-l-none h-11 text-sm placeholder:text-muted-foreground/50"
            value={localWhatsapp.replace(/^62/, '')}
            onChange={(e) => handleWhatsappChange(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Used to receive order notifications via WhatsApp
        </p>
      </div>

    </div>
  );
}