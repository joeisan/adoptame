import Link from "next/link";

import { HorizontalScroller } from "@/components/home/horizontal-scroller";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CategorySummary } from "@/types/app";

export function CategoryCard({ category }: { category: CategorySummary }) {
  const Icon = getCategoryIcon(category.icon, category.slug);

  return (
    <Link
      className="block h-full rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      href={`/explore?category=${category.slug}`}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-7" />
      </span>
      <h3 className="font-bold">{category.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{category.activeCount} disponibles</p>
    </Link>
  );
}

export function CategoryCarousel({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="container-shell py-10" id="categorias">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-primary">Categorías</p>
        <h2 className="mt-2 text-3xl font-black">Explora por tipo de animal</h2>
      </div>
      <HorizontalScroller ariaLabel="categorías" itemClassName="w-[180px]">
        {categories.map((category) => (
          <CategoryCard category={category} key={category.slug} />
        ))}
      </HorizontalScroller>
    </section>
  );
}
