import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/admin-shell";
import { ListingsTable } from "@/components/admin/admin-tables";
import { getCurrentUser } from "@/lib/permissions";
import { getAdminTableData } from "@/server/queries/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminListingsPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");
  const data = await getAdminTableData();

  return (
    <AdminShell title="Publicaciones">
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/dashboard/listings/new">Publicar Mascota</Link>
        </Button>
      </div>
      <ListingsTable 
        data={data.listings as Record<string, unknown>[]} 
        users={data.users as any[]}
      />
    </AdminShell>
  );
}
