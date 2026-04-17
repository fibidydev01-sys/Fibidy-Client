import { DiscoverGridSkeleton } from '@/components/discover/discover-grid';

export default function DiscoverLoading() {
  return (
    <div className="container px-4 py-8">
      <DiscoverGridSkeleton />
    </div>
  );
}