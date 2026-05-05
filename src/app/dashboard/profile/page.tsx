import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/profile");

  return (
    <section className="container-shell py-10">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Datos públicos y de contacto del usuario.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Nombre: {profile?.displayName ?? "Sin completar"}</p>
          <p>Rol: {profile?.role ?? "user"}</p>
          <p>Estado: {profile?.status ?? "active"}</p>
        </CardContent>
      </Card>
    </section>
  );
}
