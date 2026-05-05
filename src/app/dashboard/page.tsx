import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card";
import { UserListings } from "@/components/dashboard/user-listings";
import { Button } from "@/components/ui/button";
import { getDashboardSummary } from "@/server/queries/dashboard";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  if (!summary) redirect("/login?redirect=/dashboard");

  return (
    <section className="container-shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Dashboard</p>
          <h1 className="mt-2 text-4xl font-black">Hola, {summary.profile?.displayName ?? "rescatista"}</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">Crear nueva publicación</Link>
        </Button>
      </div>

      {summary.wantsToBeOrganization && summary.profile?.role === "user" ? (
        <div className="mb-8 rounded-lg border-2 border-primary bg-primary/5 p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-primary">Solicitud de Organización Pendiente</h2>
          <p className="mb-4 text-muted-foreground">
            Has indicado que eres una organización. Para aprobar tu cuenta y habilitar tu perfil público de organización sin límite estándar de publicaciones, necesitas entregar documentación legal que valide tu entidad.
          </p>
          <div className="flex flex-wrap gap-3">
            {summary.adminWhatsapp ? (
              <Button asChild>
                <a
                  href={`https://wa.me/${summary.adminWhatsapp.replace(/[^0-9]/g, "")}?text=Hola, quiero solicitar aprobación para mi cuenta de organización. Mi email es: ${summary.profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solicitar por WhatsApp
                </a>
              </Button>
            ) : null}
            {summary.adminEmail ? (
              <Button asChild variant="outline">
                <a href={`mailto:${summary.adminEmail.replace(/"/g, "")}?subject=Aprobación de Organización`}>
                  Contactar por Email
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <DashboardStatsCard title="Publicaciones activas" value={summary.active} />
        <DashboardStatsCard title="Publicaciones adoptadas" value={summary.adopted} />
        <DashboardStatsCard detail={`${summary.activeCount} activas actualmente`} title="Límite usado" value={`${summary.activeCount} / ${summary.limit}`} />
      </div>
      <UserListings
        emptyMessage={
          summary.profile?.role === "super_admin"
            ? "Aún no hay publicaciones en la plataforma."
            : "Aún no tienes publicaciones."
        }
        listings={summary.listings}
        title={summary.profile?.role === "super_admin" ? "Todas las publicaciones" : "Mis publicaciones"}
      />
    </section>
  );
}
