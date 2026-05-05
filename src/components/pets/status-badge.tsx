import { Badge } from "@/components/ui/badge";
import type { PetStatus } from "@/types/app";

const labels: Record<PetStatus, string> = {
  draft: "Borrador",
  pending_review: "Pendiente",
  published: "Disponible",
  in_process: "En proceso",
  adopted: "Adoptado",
  suspended: "Suspendido",
  deleted: "Eliminado"
};

export function StatusBadge({ status }: { status: PetStatus }) {
  const variant = status === "published" ? "default" : status === "adopted" ? "secondary" : "muted";

  return <Badge variant={variant}>{labels[status]}</Badge>;
}
