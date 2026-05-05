import { z } from "zod";

export const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "organization", "moderator", "super_admin"])
});

export const banSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().max(500).optional().or(z.literal("")),
  until: z.string().optional().or(z.literal("")),
  permanent: z.coerce.boolean().optional()
});

export const organizationLimitSchema = z.object({
  organizationId: z.string().uuid(),
  listingLimit: z.coerce.number().int().min(1).max(500)
});
