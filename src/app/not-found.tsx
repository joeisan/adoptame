import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-shell py-24 text-center">
      <h1 className="text-4xl font-black">No encontramos esta página</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">Puede que el enlace haya cambiado o que la publicación ya no esté disponible.</p>
      <Button asChild className="mt-8">
        <Link href="/explore">Volver a explorar</Link>
      </Button>
    </section>
  );
}
