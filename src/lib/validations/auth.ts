import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  redirect: z.string().optional()
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Escribe tu nombre.").max(120, "Usa un nombre más corto."),
  isOrganization: z.boolean().optional()
});
