'use client';

import { Button } from '@/components/ui/button';

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container px-4 py-16 text-center">
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}