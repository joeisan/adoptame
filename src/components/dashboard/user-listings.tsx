import Link from "next/link";

import { markListingAdoptedAction, softDeleteListingAction } from "@/server/actions/listings";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/pets/status-badge";
import type { PetCardListing } from "@/types/app";
import { Translate } from "@/components/layout/translate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formAction(action: (formData: FormData) => Promise<unknown>) {
  return action as unknown as (formData: FormData) => void;
}

export function UserListings({
  listings,
  title,
  emptyMessage
}: {
  listings: PetCardListing[];
  title?: React.ReactNode;
  emptyMessage?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || <Translate id="dash.myListings" />}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {listings.length ? (
          listings.map((listing) => (
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/35 p-4 md:flex-row md:items-center md:justify-between" key={listing.id}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{listing.name}</h3>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{listing.province}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/pets/${listing.slug}`}><Translate id="dash.view" /></Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/listings/${listing.slug}/edit`}><Translate id="dash.edit" /></Link>
                </Button>
                <form action={formAction(markListingAdoptedAction)}>
                  <input name="id" type="hidden" value={listing.id} />
                  <input name="slug" type="hidden" value={listing.slug} />
                  <Button size="sm" type="submit" variant="secondary">
                    <Translate id="dash.adopted" />
                  </Button>
                </form>
                <form action={formAction(softDeleteListingAction)}>
                  <input name="id" type="hidden" value={listing.id} />
                  <Button size="sm" type="submit" variant="destructive">
                    <Translate id="dash.delete" />
                  </Button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage || <Translate id="dash.noListingsUser" />}</p>
        )}
      </CardContent>
    </Card>
  );
}
