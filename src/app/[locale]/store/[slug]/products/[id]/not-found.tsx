import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ==========================================
// PRODUCT NOT FOUND PAGE
// ==========================================

export default function ProductNotFound() {
  return (
    <div className="container px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>

        <p className="text-muted-foreground mb-6">
          This product could not be found or is no longer available.
        </p>

        <Button asChild>
          <Link href="..">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Link>
        </Button>
      </div>
    </div>
  );
}