import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { UsersTable } from "@/components/admin/admin-tables";
import { getCurrentUser } from "@/lib/permissions";
import { getAdminTableData } from "@/server/queries/admin";

export default async function AdminUsersPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");
  const data = await getAdminTableData();

  return (
    <AdminShell title="Usuarios">
      <UsersTable data={data.users as Record<string, unknown>[]} />
    </AdminShell>
  );
}
