'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getCategoryConfig } from '@/lib/constants/shared/categories';
import { Store, Mail, Lock, Phone, Edit2 } from 'lucide-react';

// ==========================================
// TYPES — onSubmit & isLoading dihapus (handled by parent)
// ==========================================

interface StepReviewProps {
  data: {
    category?: string;
    name?: string;
    slug?: string;
    description?: string;
    email?: string;
    password?: string;
    whatsapp?: string;
  };
  onEdit: (step: number) => void;
  onAgreementChange?: (agreed: boolean) => void;
}

// ==========================================
// COMPONENT — no header, no nav (handled by parent)
// ==========================================

export function StepReview({ data, onEdit, onAgreementChange }: StepReviewProps) {
  const categoryConfig = data.category ? getCategoryConfig(data.category) : null;
  const [isAgreed, setIsAgreed] = useState(false);

  const handleAgreementChange = (checked: boolean) => {
    setIsAgreed(checked);
    onAgreementChange?.(checked);
  };

  return (
    <div className="space-y-3 max-w-md">

      {/* Business Type */}
      <ReviewCard label="Business type" onEdit={() => onEdit(2)}>
        <p className="text-sm font-medium">
          {categoryConfig?.label ?? data.category ?? '—'}
        </p>
        {categoryConfig?.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {categoryConfig.description}
          </p>
        )}
      </ReviewCard>

      {/* Store Info */}
      <ReviewCard
        label="Store info"
        icon={<Store className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(3)}
      >
        <div className="space-y-1.5">
          <div>
            <p className="text-xs text-muted-foreground">Store name</p>
            <p className="text-sm font-medium">{data.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Store URL</p>
            <p className="text-sm font-medium text-primary">
              {data.slug || '—'}.fibidy.com
            </p>
          </div>
          {data.description && (
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm">{data.description}</p>
            </div>
          )}
        </div>
      </ReviewCard>

      {/* Account */}
      <ReviewCard
        label="Account"
        icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(4)}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">{data.email || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">••••••••</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">+{data.whatsapp || '—'}</p>
          </div>
        </div>
      </ReviewCard>

      {/* Agreement */}
      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          id="agreement"
          checked={isAgreed}
          onCheckedChange={(checked) => handleAgreementChange(checked === true)}
          className="mt-0.5 shrink-0"
        />
        <label
          htmlFor="agreement"
          className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
        >
          By creating your store, you agree to our{' '}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
          </a>
          {' '}and{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>.
        </label>
      </div>

    </div>
  );
}

// ==========================================
// REVIEW CARD
// ==========================================

function ReviewCard({
  label,
  icon,
  onEdit,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            {icon}
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              {label}
            </p>
          </div>
          {children}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="shrink-0 h-7 w-7 p-0"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}