import { z } from "zod";

export const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "organization", "moderator", "super_admin"])
});

export const organizationLimitSchema = z.object({
  organizationId: z.string().uuid(),
  listingLimit: z.coerce.number().int().min(1).max(500)
});
