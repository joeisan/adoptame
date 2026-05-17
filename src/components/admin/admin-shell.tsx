import Link from "next/link";
import { Translate } from "@/components/layout/translate";

import { Button } from "@/components/ui/button";

const adminLinks: [string, React.ReactNode][] = [
  ["/super-admin", <Translate key="nav-kpis" id="admin.nav.kpis" />],
  ["/super-admin/users", <Translate key="nav-users" id="admin.nav.users" />],
  ["/super-admin/listings", <Translate key="nav-listings" id="admin.nav.listings" />],
  ["/super-admin/reports", <Translate key="nav-reports" id="admin.nav.reports" />],
  ["/super-admin/organizations", <Translate key="nav-orgs" id="admin.nav.organizations" />],
  ["/super-admin/banners", <Translate key="nav-banners" id="admin.nav.banners" />],
  ["/super-admin/settings", <Translate key="nav-settings" id="admin.nav.settings" />]
];

export function AdminShell({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="container-shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-primary">Super admin</p>
        <h1 className="mt-2 text-4xl font-black">{title}</h1>
      </div>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Navegación super admin">
        {adminLinks.map(([href, label]) => (
          <Button asChild key={href} variant="outline">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </nav>
      {children}
    </section>
  );
}
