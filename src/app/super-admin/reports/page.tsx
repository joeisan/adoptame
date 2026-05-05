import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ReportsTable } from "@/components/admin/admin-tables";
import { getCurrentUser } from "@/lib/permissions";
import { getAdminTableData } from "@/server/queries/admin";

export default async function AdminReportsPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");
  const data = await getAdminTableData();

  return (
    <AdminShell title="Reportes">
      <ReportsTable data={data.reports as Record<string, unknown>[]} />
    </AdminShell>
  );
}
