import { CategoryCarousel } from "@/components/home/category-carousel";
import { HomeCTA } from "@/components/home/home-cta";
import { HomeHero } from "@/components/home/home-hero";
import { LatestPetsSection } from "@/components/home/latest-pets-section";
import { OrganizationCarousel } from "@/components/home/organization-carousel";
import { BannerSlider } from "@/components/home/banner-slider";
import { getCurrentUser } from "@/lib/permissions";
import { getCategoryCounts, getFavoriteListingIds, getHomeStats, getLatestPets } from "@/server/queries/listings";
import { getLatestOrganizations } from "@/server/queries/profiles";
import { getBanners } from "@/server/actions/banners";
import { getSiteSettings } from "@/server/actions/settings";

export default async function HomePage() {
  const [{ user }, latest, categories, stats, organizations, banners, settings] = await Promise.all([
    getCurrentUser(),
    getLatestPets(10),
    getCategoryCounts(),
    getHomeStats(),
    getLatestOrganizations(6),
    getBanners(true),
    getSiteSettings()
  ]);
  const favoriteIds = await getFavoriteListingIds(user?.id);

  return (
    <>
      <HomeHero isLoggedIn={Boolean(user)} settings={settings} stats={stats} />
      {banners.length > 0 ? <BannerSlider banners={banners} /> : null}
      <LatestPetsSection canFavorite={Boolean(user)} error={latest.error} favoriteIds={favoriteIds} pets={latest.listings} />
      <CategoryCarousel categories={categories} />
      <OrganizationCarousel organizations={organizations} />
      <HomeCTA />
    </>
  );
}
