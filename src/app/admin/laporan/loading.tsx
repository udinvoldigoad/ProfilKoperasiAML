import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-container">
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
