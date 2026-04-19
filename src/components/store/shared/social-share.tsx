'use client';

import { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Share2,
  MessageCircle,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// ==========================================
// SOCIAL SHARE COMPONENT - FIXED
// ==========================================

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'buttons' | 'dropdown';
  className?: string;
}

export function SocialShare({
  url,
  title,
  description = '',
  variant = 'dropdown',
  className = '',
}: SocialShareProps) {
  const t = useTranslations('store.socialShare');
  const [copied, setCopied] = useState(false);

  // Encode for URLs
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Share URLs
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    // ✅ FIX: WhatsApp with line break so URL is separated (triggers OG fetch)
    whatsapp: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedUrl}`,
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('toast.copySuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('toast.copyFailed'));
    }
  };

  // Open share popup
  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === 'whatsapp') {
      // ✅ Open WhatsApp directly (mobile will open app, desktop opens web)
      window.location.href = shareLinks[platform];
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  // Native share (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch {
        // User cancelled or error - ignore
      }
    }
  };

  // Render as buttons row
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('facebook')}
          title={t('titles.facebook')}
          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('twitter')}
          title={t('titles.twitter')}
          className="hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('linkedin')}
          title={t('titles.linkedin')}
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('whatsapp')}
          title={t('titles.whatsapp')}
          className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          title={t('titles.copyLink')}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Render as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          {t('trigger')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          {t('facebook')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          {t('twitter')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          {t('linkedin')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          {t('whatsapp')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          {copied ? t('copiedLink') : t('copyLink')}
        </DropdownMenuItem>
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {t('nativeShare')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}