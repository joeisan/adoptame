import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function VerifiedBadge() {
  return (
    <Badge variant="verified">
      <ShieldCheck className="size-3.5" />
      Verificado
    </Badge>
  );
}
