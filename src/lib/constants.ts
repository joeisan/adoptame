import {
  Bird,
  Cat,
  Dog,
  Fish,
  PawPrint,
  Rabbit,
  Rat,
  Shell
} from "lucide-react";

export const SITE_CONFIG = {
  name: "Huellas Pty",
  shortName: "Huellas",
  description:
    "Plataforma panameña para conectar personas, rescatistas y organizaciones con animales en adopción.",
  supportEmail: "soporte@huellaspty.com",
  supportPhone: "+507 6000-0000",
  defaultListingLimit: 10,
  defaultMaxImages: 5
};

export const CATEGORY_COLORS: Record<string, string> = {
  perros: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200",
  gatos: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200",
  conejos: "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200",
  aves: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200",
  reptiles: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200",
  roedores: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200",
  peces: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-200",
  otros: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
};

export const CATEGORY_OPTIONS = [
  { name: "Perros", slug: "perros", icon: Dog },
  { name: "Gatos", slug: "gatos", icon: Cat },
  { name: "Conejos", slug: "conejos", icon: Rabbit },
  { name: "Aves", slug: "aves", icon: Bird },
  { name: "Reptiles", slug: "reptiles", icon: Shell },
  { name: "Roedores", slug: "roedores", icon: Rat },
  { name: "Peces", slug: "peces", icon: Fish },
  { name: "Otros", slug: "otros", icon: PawPrint }
];

export const PANAMA_PROVINCES = [
  "Bocas del Toro",
  "Coclé",
  "Colón",
  "Chiriquí",
  "Darién",
  "Herrera",
  "Los Santos",
  "Panamá",
  "Panamá Oeste",
  "Veraguas",
  "Guna Yala",
  "Emberá-Wounaan",
  "Ngäbe-Buglé",
  "Naso Tjër Di"
];

export const PET_SEX_OPTIONS = [
  { label: "Macho", value: "male" },
  { label: "Hembra", value: "female" },
  { label: "Desconocido", value: "unknown" }
];

export const PET_SIZE_OPTIONS = [
  { label: "Pequeño", value: "small" },
  { label: "Mediano", value: "medium" },
  { label: "Grande", value: "large" },
  { label: "Desconocido", value: "unknown" }
];

export const PET_STATUS_OPTIONS = [
  { label: "Disponible", value: "published" },
  { label: "En proceso", value: "in_process" },
  { label: "Adoptado", value: "adopted" },
  { label: "Pendiente", value: "pending_review" },
  { label: "Suspendido", value: "suspended" }
];

export const ACTIVE_LISTING_STATUSES = ["draft", "pending_review", "published", "in_process"] as const;
export const PUBLIC_LISTING_STATUSES = ["published", "in_process", "adopted"] as const;
