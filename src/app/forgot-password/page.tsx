import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Recuperar contraseña"
};

export default function ForgotPasswordPage() {
  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>Supabase Auth enviará el correo cuando configures el flujo SMTP.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <Button className="w-full" type="button" variant="outline">
              Enviar instrucciones
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
