import { CheckCircle2, Edit3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { markListingAdoptedAction } from "@/server/actions/listings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Translate } from "@/components/layout/translate";

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
          {isAdmin ? <Translate id="owner.adminPanel" /> : <Translate id="owner.manageListing" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full" variant="outline">
          <Link href={`/dashboard/listings/${slug}/edit`}>
            <Edit3 className="size-4 mr-2" />
            <Translate id="owner.editListing" />
          </Link>
        </Button>

        <form action={formAction(markListingAdoptedAction)}>
          <input name="id" type="hidden" value={listingId} />
          <input name="slug" type="hidden" value={slug} />
          <Button className="w-full" disabled={isAdopted} type="submit" variant={isAdopted ? "outline" : "secondary"}>
            {isAdopted ? <Translate id="owner.alreadyAdopted" /> : <Translate id="owner.markAdopted" />}
          </Button>
        </form>
        
        {isAdmin && (
          <p className="text-[10px] text-amber-600 font-bold text-center uppercase tracking-wider">
            <Translate id="owner.adminAccess" />
          </p>
        )}
      </CardContent>
    </Card>
  );
}
