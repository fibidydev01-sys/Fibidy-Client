import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DiscoverNotFound() {
  return (
    <div className="container px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
      <p className="text-muted-foreground mb-6">
        This product is not available or has been removed.
      </p>
      <Button asChild>
        <Link href="/discover">Back to Discover</Link>
      </Button>
    </div>
  );
}