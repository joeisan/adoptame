"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleFavoriteAction } from "@/server/actions/favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const formData = new FormData();
    formData.set("listingId", listingId);
    formData.set("nextState", isFavorited ? "remove" : "favorite");

    startTransition(async () => {
      const result = await toggleFavoriteAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isFavorited ? "Quitado de favoritos." : "Guardado en favoritos.");
    });
  }

  return (
    <Button
      aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn("rounded-full bg-card/90 backdrop-blur hover:bg-card", isFavorited ? "text-red-500" : "text-muted-foreground")}
      disabled={pending}
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Heart className={cn("size-4", isFavorited && "fill-current")} />
    </Button>
  );
}
