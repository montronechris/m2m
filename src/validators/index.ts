import { z } from "zod";
export const cartItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  priceCents: z.number(),
  quantity: z.number().min(1),
  customizations: z.object({ selectedChoices: z.array(z.object({ choiceId: z.string(), name: z.string(), priceCents: z.number() })), notes: z.string().optional() })
});
export const cartSchema = z.array(cartItemSchema);
export type CartItem = z.infer<typeof cartItemSchema>;
