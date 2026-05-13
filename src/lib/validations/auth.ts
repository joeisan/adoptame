import { z } from "zod";

const phoneNumber = z
  .string()
  .trim()
  .min(8, "Requerido")
  .refine((value) => !value || /^\+?(?:507)?[\s-]?\d{4}[\s-]?\d{4}$/.test(value), {
    message: "Usa un teléfono válido de 8 dígitos."
  });

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  redirect: z.string().optional()
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Escribe tu nombre.").max(120, "Usa un nombre más corto."),
  phone: phoneNumber,
  whatsapp: phoneNumber.optional().or(z.literal("")),
  isOrganization: z.boolean().optional(),
  organizationType: z.string().optional(),
  organizationName: z.string().optional()
}).superRefine((values, ctx) => {
  if (values.isOrganization && !values.organizationName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["organizationName"],
      message: "Escribe el nombre de la organización o fundación."
    });
  }
});
