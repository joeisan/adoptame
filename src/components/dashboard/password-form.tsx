"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/server/actions/auth";
import { useLanguage } from "@/lib/language-context";

export function PasswordForm() {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("pwd.updateSuccess"));
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="password">{t("pwd.newPassword")}</Label>
        <div className="relative">
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder={t("pwd.minChars")}
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" /> }
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("pwd.confirmPassword")}</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword" 
          type={showPassword ? "text" : "password"} 
          required 
        />
      </div>

      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? t("pwd.updating") : t("pwd.updatePassword")}
        <Lock className="ml-2 size-4" />
      </Button>
    </form>
  );
}
