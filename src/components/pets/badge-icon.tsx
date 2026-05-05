import { Activity, Bug, Shield, Syringe, Sparkles } from "lucide-react";

export function getBadgeIcon(badge: string, className = "mr-1 size-3") {
  const lower = badge.toLowerCase();
  if (lower.includes("vacunado")) return <Syringe className={className} />;
  if (lower.includes("desparasitado")) return <Bug className={className} />;
  if (lower.includes("esterilizado") || lower.includes("castrado")) return <Activity className={className} />;
  if (lower.includes("sano")) return <Shield className={className} />;
  if (lower.includes("cariñoso") || lower.includes("juguetón")) return <Sparkles className={className} />;
  return null;
}
