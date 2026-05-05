import { CheckCircle2, Edit3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { markListingAdoptedAction } from "@/server/actions/listings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formAction(action: (formData: FormData) => Promise<unknown>) {
  return action as unknown as (formData: FormData) => void;
}

export function OwnerListingActions({ 
  listingId, 
  slug, 
  isAdopted,
  isAdmin = false
}: { 
  listingId: string; 
  slug: string; 
  isAdopted: boolean;
  isAdmin?: boolean;
}) {
  return (
    <Card className={isAdmin ? "border-amber-500/30 bg-amber-500/5" : "border-primary/30"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isAdmin ? <ShieldCheck className="size-5 text-amber-500" /> : <CheckCircle2 className="size-5 text-primary" />}
          {isAdmin ? "Panel de Super Admin" : "Gestión de tu publicación"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full" variant="outline">
          <Link href={`/dashboard/listings/${slug}/edit`}>
            <Edit3 className="size-4 mr-2" />
            Editar publicación
          </Link>
        </Button>

        <form action={formAction(markListingAdoptedAction)}>
          <input name="id" type="hidden" value={listingId} />
          <input name="slug" type="hidden" value={slug} />
          <Button className="w-full" disabled={isAdopted} type="submit" variant={isAdopted ? "outline" : "secondary"}>
            {isAdopted ? "Ya marcada como adoptada" : "Marcar como adoptada"}
          </Button>
        </form>
        
        {isAdmin && (
          <p className="text-[10px] text-amber-600 font-bold text-center uppercase tracking-wider">
            Acceso administrativo habilitado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
