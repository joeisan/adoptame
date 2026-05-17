import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Translate } from "@/components/layout/translate";

export function EmptyState({ title, description, actionHref }: { title: React.ReactNode; description: React.ReactNode; actionHref?: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center ambient-card">
      <SearchX className="mx-auto mb-4 size-10 text-muted-foreground" />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}><Translate id="pet.explorePets" /></a>
        </Button>
      ) : null}
    </div>
  );
}
