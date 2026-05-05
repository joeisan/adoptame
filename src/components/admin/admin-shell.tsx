import Link from "next/link";

import { Button } from "@/components/ui/button";

const adminLinks = [
  ["/super-admin", "KPIs"],
  ["/super-admin/users", "Usuarios"],
  ["/super-admin/listings", "Publicaciones"],
  ["/super-admin/reports", "Reportes"],
  ["/super-admin/organizations", "Organizaciones"],
  ["/super-admin/settings", "Configuración"]
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
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
