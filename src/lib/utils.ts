import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PA", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatAge(value?: number | null, unit?: string | null) {
  if (!value || unit === "unknown") return "Edad por confirmar";
  const label = unit === "months" ? (value === 1 ? "mes" : "meses") : value === 1 ? "año" : "años";
  return `${value} ${label}`;
}

export function panamaWhatsappUrl(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("507") ? digits : `507${digits}`;
  if (!/^507\d{7,8}$/.test(normalized)) return null;
  return `https://wa.me/${normalized}`;
}
