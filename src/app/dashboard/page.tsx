import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card";
import { UserListings } from "@/components/dashboard/user-listings";
import { Button } from "@/components/ui/button";
import { Translate } from "@/components/layout/translate";
import { getDashboardSummary } from "@/server/queries/dashboard";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  if (!summary) redirect("/login?redirect=/dashboard");

  return (
    <section className="container-shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Dashboard</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-black"><Translate id="dashboard.hello" />, {summary.profile?.displayName ?? <Translate id="dash.rescuer" />}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {summary.profile?.slug && (
            <Button asChild variant="ghost">
              <Link href={`/perfil/${summary.profile.slug}`}><Translate id="dashboard.viewMyProfile" /></Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/dashboard/profile"><Translate id="dashboard.editProfile" /></Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/listings/new"><Translate id="dashboard.createListing" /></Link>
          </Button>
        </div>
      </div>

      {summary.wantsToBeOrganization && summary.profile?.role === "user" ? (
        <div className="mb-8 rounded-lg border-2 border-primary bg-primary/5 p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-primary"><Translate id="dashboard.pendingOrgReq" /></h2>
          <p className="mb-4 text-muted-foreground">
            <Translate id="dashboard.orgReqDesc" />
          </p>
          <div className="flex flex-wrap gap-3">
            {summary.adminWhatsapp ? (
              <Button asChild>
                <a
                  href={`https://wa.me/${summary.adminWhatsapp.replace(/[^0-9]/g, "")}?text=Hola, quiero solicitar aprobación para mi cuenta de organización. Mi email es: ${summary.profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Translate id="dashboard.reqWhatsapp" />
                </a>
              </Button>
            ) : null}
            {summary.adminEmail ? (
              <Button asChild variant="outline">
                <a href={`mailto:${summary.adminEmail.replace(/"/g, "")}?subject=Aprobación de Organización`}>
                  <Translate id="dashboard.reqEmail" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <DashboardStatsCard title={<Translate id="dashboard.activeListings" />} value={summary.active} />
        <DashboardStatsCard title={<Translate id="dashboard.adoptedListings" />} value={summary.adopted} />
        <DashboardStatsCard detail={`${summary.activeCount} activas actualmente`} title={<Translate id="dashboard.usedLimit" />} value={`${summary.activeCount} / ${summary.limit}`} />
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
