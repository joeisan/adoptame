export type UserRole = "user" | "organization" | "moderator" | "super_admin";
export type UserStatus = "active" | "banned" | "deleted";
export type PetStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "in_process"
  | "adopted"
  | "suspended"
  | "deleted";
export type PetSex = "male" | "female" | "unknown";
export type PetSize = "small" | "medium" | "large" | "unknown";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";
export type ReportType = "user" | "listing";

export type CategorySummary = {
  id?: string;
  name: string;
  slug: string;
  icon?: string | null;
  activeCount: number;
};

export type PetImage = {
  id?: string;
  publicUrl: string;
  altText: string;
  sortOrder: number;
};

export type PetCardListing = {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  species: string | null;
  breed: string | null;
  ageValue: number | null;
  ageUnit: string | null;
  sex: PetSex;
  size: PetSize;
  status: PetStatus;
  province: string;
  district: string | null;
  publishedAt: string | null;
  createdAt: string;
  badges: string[];
  latitude: number | null;
  longitude: number | null;
  category: {
    name: string;
    slug: string;
  } | null;
  organization: {
    name: string;
    slug: string;
    isVerified: boolean;
  } | null;
  image: PetImage | null;
};

export type PublicPetDetail = PetCardListing & {
  description: string;
  story: string | null;
  healthNotes: string | null;
  adoptionRequirements: string | null;
  sector: string | null;
  ownerName: string | null;
  images: PetImage[];
  contactName: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
};

export type PetContact = {
  contactName: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
};

export type ExploreFilters = {
  category?: string;
  province?: string;
  district?: string;
  sex?: string;
  age?: string;
  size?: string;
  status?: string;
  verified?: string;
  q?: string;
  location?: "nearby";
  lat?: string;
  lng?: string;
  radius?: string;
  sort?: "recent" | "oldest" | "az" | "za";
  page?: number;
};

export type ProfileSummary = {
  id: string;
  fullName: string | null;
  displayName: string | null;
  email?: string | null;
  role: UserRole;
  status: UserStatus;
  bannedUntil: string | null;
};

export type AdminMetrics = {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  totalListings: number;
  activeListings: number;
  adoptedListings: number;
  totalOrganizations: number;
  verifiedOrganizations: number;
  openReports: number;
  bannedUsers: number;
  usersByPeriod: Array<{ label: string; users: number }>;
  listingsByCategory: Array<{ name: string; value: number }>;
  listingsByProvince: Array<{ name: string; value: number }>;
  listingsByStatus: Array<{ name: string; value: number }>;
  reportsByStatus: Array<{ name: string; value: number }>;
  topOrganizations: Array<{ name: string; active: number }>;
};
