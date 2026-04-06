import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/constants/shared/site';

// ==========================================
// AUTH LOGO COMPONENT
// ==========================================

interface AuthLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function AuthLogo({ size = 'md' }: AuthLogoProps) {
  const sizes = {
    sm: { img: 32, text: 'text-xl' },
    md: { img: 40, text: 'text-2xl' },
    lg: { img: 48, text: 'text-3xl' },
  };

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="flex items-center justify-center rounded-xl overflow-hidden group-hover:opacity-90 transition-opacity">
        <Image
          src="/apple-touch-icon.png"
          alt={siteConfig.name}
          width={sizes[size].img}
          height={sizes[size].img}
          className="object-contain"
          priority
        />
      </div>
      <span className={`font-bold ${sizes[size].text} text-foreground`}>
        {siteConfig.name}
      </span>
    </Link>
  );
}