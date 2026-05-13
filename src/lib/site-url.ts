const LOCAL_SITE_URL = "http://localhost:3000";
export const CANONICAL_SITE_URL = "https://huellaspty.com";

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  if (process.env.NODE_ENV === "production") {
    return CANONICAL_SITE_URL;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return normalizeSiteUrl(configuredUrl);
  }

  return LOCAL_SITE_URL;
}

export function getCanonicalHost() {
  return new URL(getSiteUrl()).host;
}
