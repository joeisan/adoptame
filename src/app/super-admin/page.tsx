import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { AdminCharts } from "@/components/admin/admin-charts";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentUser } from "@/lib/permissions";
import { getAdminMetrics } from "@/server/queries/admin";

import { Translate } from "@/components/layout/translate";

export default async function SuperAdminPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");

  const metrics = await getAdminMetrics();

  return (
    <AdminShell title={<Translate id="admin.globalPanel" />}>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminKpiCard label={<Translate id="admin.totalUsers" />} value={metrics.totalUsers} />
        <AdminKpiCard label={<Translate id="admin.new7d" />} value={metrics.newUsers7d} />
        <AdminKpiCard label={<Translate id="admin.new30d" />} value={metrics.newUsers30d} />
        <AdminKpiCard label={<Translate id="admin.listings" />} value={metrics.totalListings} />
        <AdminKpiCard label={<Translate id="admin.active" />} value={metrics.activeListings} />
        <AdminKpiCard label={<Translate id="admin.adopted" />} value={metrics.adoptedListings} />
        <AdminKpiCard label={<Translate id="admin.organizations" />} value={metrics.totalOrganizations} />
        <AdminKpiCard label={<Translate id="admin.verified" />} value={metrics.verifiedOrganizations} />
        <AdminKpiCard label={<Translate id="admin.openReports" />} value={metrics.openReports} />
      </div>
      <AdminCharts metrics={metrics} />
    </AdminShell>
  );
}
