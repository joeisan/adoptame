import type { MetadataRoute } from "next";

import { getSitemapPets } from "@/server/queries/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pets = await getSitemapPets();

  return [
    {
      url: siteUrl,
      lastModified: new Date()
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: new Date()
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date()
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date()
    },
    ...pets.map((pet) => ({
      url: `${siteUrl}/pets/${pet.slug}`,
      lastModified: pet.updatedAt ? new Date(pet.updatedAt) : new Date()
    }))
  ];
}
