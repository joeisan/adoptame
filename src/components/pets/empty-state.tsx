import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionHref }: { title: string; description: string; actionHref?: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center ambient-card">
      <SearchX className="mx-auto mb-4 size-10 text-muted-foreground" />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>Explorar mascotas</a>
        </Button>
      ) : null}
    </div>
  );
}
