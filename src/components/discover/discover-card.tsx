import Link from 'next/link';
import { FileText, Music, Video, Image, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PublicProduct } from '@/types/product';

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, epub: FileText,
  mp3: Music, wav: Music,
  mp4: Video, mov: Video,
  jpg: Image, jpeg: Image, png: Image,
  zip: Archive, rar: Archive,
};

interface DiscoverCardProps {
  product: PublicProduct;
}

export function DiscoverCard({ product }: DiscoverCardProps) {
  const Icon = FILE_ICONS[product.fileType] ?? FileText;

  return (
    <Link href={`/discover/${product.id}`} className="block group">
      <div className="border rounded-xl p-4 space-y-3 hover:border-primary/50 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{product.sellerName}</p>
          </div>
        </div>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
          <Badge variant="outline" className="text-xs">
            {product.fileType.toUpperCase()}
          </Badge>
        </div>
      </div>
    </Link>
  );
}