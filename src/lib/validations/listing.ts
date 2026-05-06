import { z } from "zod";

const phoneNumber = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^\+?(?:507)?[\s-]?\d{4}[\s-]?\d{4}$/.test(value), {
    message: "Usa un teléfono válido de 8 dígitos."
  });

const plainText = z
  .string()
  .refine((value) => !/[<>]/.test(value), "Evita HTML o scripts en los campos de texto.");

export const listingSchema = z
  .object({
    name: plainText.min(2, "El nombre es requerido.").max(80, "Máximo 80 caracteres."),
    categorySlug: z.string().min(1, "Selecciona una categoría."),
    species: plainText.max(80).optional().or(z.literal("")),
    breed: plainText.max(80).optional().or(z.literal("")),
    ageValue: z.coerce.number().int().min(0).max(40).optional().or(z.literal("")),
    ageUnit: z.enum(["months", "years", "unknown"]),
    sex: z.enum(["male", "female", "unknown"]),
    size: z.enum(["small", "medium", "large", "unknown"]),
    province: z.string().min(1, "Selecciona una provincia."),
    district: plainText.max(100).optional().or(z.literal("")),
    sector: plainText.max(120).optional().or(z.literal("")),
    description: plainText.min(30, "Describe la mascota con al menos 30 caracteres.").max(2000),
    story: plainText.max(2000).optional().or(z.literal("")),
    healthNotes: plainText.max(1200).optional().or(z.literal("")),
    adoptionRequirements: plainText.max(1200).optional().or(z.literal("")),
    contactName: plainText.max(120).optional().or(z.literal("")),
    contactPhone: phoneNumber,
    contactWhatsapp: phoneNumber,
    contactEmail: z.string().email("Email inválido.").optional().or(z.literal("")),
    status: z.enum(["published", "adopted"]).optional().default("published"),
    ownerId: z.string().uuid().optional()
  });

export type ListingFormValues = z.infer<typeof listingSchema>;
