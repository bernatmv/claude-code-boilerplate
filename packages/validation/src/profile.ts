import { z } from "zod";

export const displayNameSchema = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(2).max(50));

export const profileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(2).max(50).nullable(),
  avatar_url: z.string().url().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;
