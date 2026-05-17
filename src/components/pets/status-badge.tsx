import { Badge } from "@/components/ui/badge";
import type { PetStatus } from "@/types/app";
import { Translate } from "@/components/layout/translate";

export function StatusBadge({ status }: { status: PetStatus }) {
  const variant = status === "published" ? "default" : status === "adopted" ? "secondary" : "muted";

  return (
    <Badge variant={variant}>
      <Translate id={`status.${status}` as any} />
    </Badge>
  );
}
