"use client";

import { useMemo, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { signInAction, signInWithGoogleAction, signUpAction } from "@/server/actions/auth";
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
  phone?: string;
  whatsapp?: string;
  isOrganization?: boolean;
  organizationName?: string;
  organizationType?: string;
};

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo?: string }) {
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [isOrgSelected, setIsOrgSelected] = useState(false);
  const [useSameForWhatsapp, setUseSameForWhatsapp] = useState(true);
  const schema = useMemo(() => (mode === "login" ? loginSchema : registerSchema), [mode]);
  const form = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      redirect: redirectTo,
      isOrganization: false,
      organizationName: "",
      organizationType: "Organización",
      ...(mode === "register" ? { fullName: "", phone: "", whatsapp: "" } : {})
    }
  });

  function onSubmit(values: AuthValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    });
    
    // Explicitly set isOrganization and organizationType if checked
    if (isOrgSelected) {
      formData.set("isOrganization", "on");
      const orgType = document.getElementById("organizationType") as HTMLSelectElement | null;
      if (orgType) formData.set("organizationType", orgType.value);
    }

    // Handle WhatsApp synchronization
    if (mode === "register" && useSameForWhatsapp) {
      formData.set("whatsapp", String(values.phone || ""));
    }

    startTransition(async () => {
      const result = mode === "login" ? await signInAction(formData) : await signUpAction(formData);
      if (result?.error) toast.error(result.error);
    });
  }

  function onGoogleSignIn() {
    const formData = new FormData();
    if (redirectTo) formData.set("redirect", redirectTo);

    startTransition(async () => {
      const result = await signInWithGoogleAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      }
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
        <Button className="mb-4 w-full" disabled={pending} onClick={onGoogleSignIn} type="button" variant="outline">
          <span className="mr-2 inline-flex size-4 items-center justify-center rounded-full text-xs font-black">G</span>
          Continuar con Google
        </Button>
        <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>Email</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre</Label>
                <Input id="fullName" {...form.register("fullName")} autoComplete="name" />
                <p className="text-sm text-destructive">{form.formState.errors.fullName?.message}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (Obligatorio)</Label>
                  <Input id="phone" placeholder="6000 0000" {...form.register("phone")} />
                  <p className="text-sm text-destructive">{form.formState.errors.phone?.message}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useSameForWhatsapp"
                    checked={useSameForWhatsapp}
                    onChange={(e) => setUseSameForWhatsapp(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="useSameForWhatsapp" className="text-xs font-medium cursor-pointer text-muted-foreground">
                    Usar este mismo número para WhatsApp
                  </Label>
                </div>

                {!useSameForWhatsapp ? (
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                    <Input id="whatsapp" placeholder="6000 0000" {...form.register("whatsapp")} />
                    <p className="text-sm text-destructive">{form.formState.errors.whatsapp?.message}</p>
                  </div>
                ) : null}
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="isOrganization"
                    name="isOrganization"
                    checked={isOrgSelected}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    onChange={(e) => {
                      setIsOrgSelected(e.target.checked);
                      const msg = document.getElementById("org-disclaimer");
                      if (msg) msg.style.display = e.target.checked ? "block" : "none";
                    }}
                  />
                  <Label htmlFor="isOrganization" className="font-medium cursor-pointer leading-tight">
                    Soy una organización y deseo solicitar aprobación
                  </Label>
                </div>

                {isOrgSelected && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Nombre de organización / fundación</Label>
                      <Input
                        id="organizationName"
                        placeholder="Ej. Fundación Peludos"
                        {...form.register("organizationName")}
                      />
                      <p className="text-sm text-destructive">{form.formState.errors.organizationName?.message}</p>
                    </div>
                    <Label htmlFor="organizationType">Tipo de organización</Label>
                    <select
                      id="organizationType"
                      name="organizationType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Organización"
                    >
                      <option value="Fundación">Fundación</option>
                      <option value="ONG">ONG</option>
                      <option value="Organización">Organización / Grupo</option>
                    </select>
                  </div>
                )}

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
