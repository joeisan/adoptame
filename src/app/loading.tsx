import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-shell grid gap-6 py-12">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-72 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-96" key={index} />
        ))}
      </div>
    </div>
  );
}
