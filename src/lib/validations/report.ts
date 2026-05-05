import { z } from "zod";

export const reportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(4).max(120),
  description: z.string().max(1000).optional().or(z.literal(""))
});
