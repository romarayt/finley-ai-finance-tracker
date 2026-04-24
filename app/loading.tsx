import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
