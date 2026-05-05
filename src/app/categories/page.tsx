import { CategoryCard } from "@/components/home/category-carousel";
import { getCategoryCounts } from "@/server/queries/listings";

export const metadata = {
  title: "Categorías"
};

export default async function CategoriesPage() {
  const categories = await getCategoryCounts();

  return (
    <section className="container-shell py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-primary">Categorías</p>
        <h1 className="mt-2 text-4xl font-black">Explora por tipo de animal</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard category={category} key={category.slug} />
        ))}
      </div>
    </section>
  );
}
