import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";

export default async function OrganizationPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/organization");

  return (
    <section className="container-shell py-10">
      <Card>
        <CardHeader>
          <CardTitle>Organización</CardTitle>
          <CardDescription>Solicitud de rol organización y datos institucionales.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Desde Supabase o el panel super admin puedes asignar el rol `organization`, verificar la organización y ajustar su límite.
        </CardContent>
      </Card>
    </section>
  );
}
