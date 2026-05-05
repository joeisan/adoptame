import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeCTA() {
  return (
    <section className="container-shell py-16">
      <div className="overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground ambient-card md:p-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-black">¿Listo para cambiar una vida?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/85">
              Explora animales que buscan familia o publica una mascota que necesita un hogar responsable.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/explore">
                <Search className="size-5" />
                Buscar
              </Link>
            </Button>
            <Button asChild className="bg-card text-foreground hover:bg-muted" size="lg">
              <Link href="/register">
                Publicar / Registrarme
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
