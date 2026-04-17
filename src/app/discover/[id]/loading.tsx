import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoverDetailLoading() {
  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-12 w-40" />
    </div>
  );
}