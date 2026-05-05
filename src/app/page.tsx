import { CategoryCarousel } from "@/components/home/category-carousel";
import { HomeCTA } from "@/components/home/home-cta";
import { HomeHero } from "@/components/home/home-hero";
import { LatestPetsSection } from "@/components/home/latest-pets-section";
import { getCurrentUser } from "@/lib/permissions";
import { getCategoryCounts, getFavoriteListingIds, getHomeStats, getLatestPets } from "@/server/queries/listings";

export default async function HomePage() {
  const [{ user }, latest, categories, stats] = await Promise.all([
    getCurrentUser(),
    getLatestPets(10),
    getCategoryCounts(),
    getHomeStats()
  ]);
  const favoriteIds = await getFavoriteListingIds(user?.id);

  return (
    <>
      <HomeHero isLoggedIn={Boolean(user)} stats={stats} />
      <LatestPetsSection canFavorite={Boolean(user)} error={latest.error} favoriteIds={favoriteIds} pets={latest.listings} />
      <CategoryCarousel categories={categories} />
      <HomeCTA />
    </>
  );
}
