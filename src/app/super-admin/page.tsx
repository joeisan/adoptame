import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { AdminCharts } from "@/components/admin/admin-charts";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentUser } from "@/lib/permissions";
import { getAdminMetrics } from "@/server/queries/admin";

export default async function SuperAdminPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");

  const metrics = await getAdminMetrics();

  return (
    <AdminShell title="Panel global">
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminKpiCard label="Total usuarios" value={metrics.totalUsers} />
        <AdminKpiCard label="Nuevos 7 días" value={metrics.newUsers7d} />
        <AdminKpiCard label="Nuevos 30 días" value={metrics.newUsers30d} />
        <AdminKpiCard label="Publicaciones" value={metrics.totalListings} />
        <AdminKpiCard label="Activas" value={metrics.activeListings} />
        <AdminKpiCard label="Adoptadas" value={metrics.adoptedListings} />
        <AdminKpiCard label="Organizaciones" value={metrics.totalOrganizations} />
        <AdminKpiCard label="Verificadas" value={metrics.verifiedOrganizations} />
        <AdminKpiCard label="Reportes abiertos" value={metrics.openReports} />
      </div>
      <AdminCharts metrics={metrics} />
    </AdminShell>
  );
}
