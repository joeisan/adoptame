"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCategoryAction } from "@/server/actions/admin";
import { toast } from "sonner";

export function CategoryToggle({ categoryId, isActive, name }: { categoryId: string; isActive: boolean; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const formData = new FormData();
    formData.set("categoryId", categoryId);
    formData.set("isActive", (!isActive).toString());

    startTransition(async () => {
      const result = await toggleCategoryAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${name} ${!isActive ? "activada" : "desactivada"}`);
      }
    });
  };

  return (
    <Switch 
      checked={isActive} 
      onCheckedChange={handleToggle}
      disabled={isPending}
    />
  );
}
