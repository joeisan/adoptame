import {
  Bird,
  Bone,
  Bug,
  Cat,
  Circle,
  Dog,
  Fish,
  Heart,
  House,
  PawPrint,
  Rabbit,
  Rat,
  Shell,
  Sparkles,
  Turtle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_ICON_OPTIONS = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "rabbit", label: "Conejo" },
  { value: "bird", label: "Ave" },
  { value: "shell", label: "Reptil" },
  { value: "rat", label: "Roedor" },
  { value: "fish", label: "Pez" },
  { value: "turtle", label: "Tortuga" },
  { value: "bug", label: "Insecto" },
  { value: "bone", label: "Hueso" },
  { value: "heart", label: "Corazón" },
  { value: "house", label: "Casa" },
  { value: "sparkles", label: "Destacado" },
  { value: "circle", label: "Círculo" },
  { value: "paw", label: "Huella" }
] as const;

const CATEGORY_ICON_MAP = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  bird: Bird,
  shell: Shell,
  rat: Rat,
  fish: Fish,
  turtle: Turtle,
  bug: Bug,
  bone: Bone,
  heart: Heart,
  house: House,
  sparkles: Sparkles,
  circle: Circle,
  paw: PawPrint,
  "paw-print": PawPrint
} satisfies Record<string, LucideIcon>;

const CATEGORY_SLUG_ICON_MAP: Record<string, keyof typeof CATEGORY_ICON_MAP> = {
  perros: "dog",
  gatos: "cat",
  conejos: "rabbit",
  aves: "bird",
  reptiles: "shell",
  roedores: "rat",
  peces: "fish",
  otros: "paw"
};

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number]["value"];
type CategoryIconKey = keyof typeof CATEGORY_ICON_MAP;

export function normalizeCategoryIcon(value: FormDataEntryValue | string | null | undefined): CategoryIconKey | null | undefined {
  const icon = String(value ?? "").trim().toLowerCase();
  if (!icon) return null;
  return icon in CATEGORY_ICON_MAP ? (icon as CategoryIconKey) : undefined;
}

export function getCategoryIcon(icon?: string | null, slug?: string | null) {
  const normalizedIcon = normalizeCategoryIcon(icon);
  if (normalizedIcon) return CATEGORY_ICON_MAP[normalizedIcon];

  const normalizedSlug = slug ? CATEGORY_SLUG_ICON_MAP[slug] : null;
  if (normalizedSlug) return CATEGORY_ICON_MAP[normalizedSlug];

  return PawPrint;
}

export function getCategoryIconLabel(icon?: string | null) {
  return CATEGORY_ICON_OPTIONS.find((option) => option.value === icon)?.label ?? "Huella";
}
