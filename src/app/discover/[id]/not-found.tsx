import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DiscoverNotFound() {
  return (
    <div className="container px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h1>
      <p className="text-muted-foreground mb-6">
        Produk ini tidak tersedia atau sudah dihapus.
      </p>
      <Button asChild>
        <Link href="/discover">Kembali ke Discover</Link>
      </Button>
    </div>
  );
}