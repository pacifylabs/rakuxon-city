import { z } from "zod";

export const subscriberSchema = z.object({
  email: z.email("Enter an email address we can reach you on"),
  sourcePath: z.string().min(1).max(400),
  /**
   * Never pre-ticked, and never inferred from the act of submitting.
   *
   * The footer field sits beside a line saying what the list is — occasional
   * notes on new stock and buyer guides — so pressing Subscribe is a
   * deliberate act. NDPA 2023 wants that recorded, not assumed.
   */
  consent: z.literal(true, "Please confirm you want to receive these"),
});

export type SubscriberInput = z.infer<typeof subscriberSchema>;
