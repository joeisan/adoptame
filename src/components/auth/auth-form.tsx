"use client";

import { useMemo, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, HeartHandshake, Search } from "lucide-react";

import { signInAction, signUpAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type Mode = "login" | "register";
type AuthValues = {
  email: string;
  password: string;
  redirect?: string;
  fullName?: string;
  isOrganization?: boolean;
};

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo?: string }) {
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const schema = useMemo(() => (mode === "login" ? loginSchema : registerSchema), [mode]);
  const form = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      redirect: redirectTo,
      ...(mode === "register" ? { fullName: "" } : {})
    }
  });

  function onSubmit(values: AuthValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.set(key, String(value));
    });
    // Grab native checkbox value
    const orgCheckbox = document.getElementById("isOrganization") as HTMLInputElement | null;
    if (orgCheckbox?.checked) formData.set("isOrganization", "on");

    startTransition(async () => {
      const result = mode === "login" ? await signInAction(formData) : await signUpAction(formData);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Entra para ver contactos y gestionar publicaciones."
            : "Regístrate para publicar mascotas y contactar publicantes."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre</Label>
                <Input id="fullName" {...form.register("fullName")} autoComplete="name" />
                <p className="text-sm text-destructive">{form.formState.errors.fullName?.message}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="isOrganization"
                    name="isOrganization"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    onChange={(e) => {
                      const msg = document.getElementById("org-disclaimer");
                      if (msg) msg.style.display = e.target.checked ? "block" : "none";
                    }}
                  />
                  <Label htmlFor="isOrganization" className="font-medium cursor-pointer leading-tight">
                    Soy una organización y deseo solicitar aprobación
                  </Label>
                </div>
                <div id="org-disclaimer" className="hidden rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground border border-primary/10 animate-in fade-in slide-in-from-top-1">
                  <p className="mb-2"><strong>Nota:</strong> Las cuentas de organización están sujetas a verificación. Deberás proporcionar documentación legal de la organización.</p>
                  <p>Puedes solicitar los requisitos directamente a nuestro equipo de soporte.</p>
                </div>
              </div>
            </>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} autoComplete="email" />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" /> }
              </button>
            </div>
            <p className="text-sm text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          <input type="hidden" {...form.register("redirect")} />
          <Button className="w-full" disabled={pending} type="submit">
            {pending ? "Procesando..." : mode === "login" ? "Entrar" : "Registrarme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
