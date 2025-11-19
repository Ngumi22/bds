import { z } from "zod"

export const shippingZoneFormSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(100),
  countries: z.array(z.string()).min(1, "At least one country is required"),
  isActive: z.boolean().default(true),
})

export const shippingRateFormSchema = z.object({
  zoneId: z.string().min(1, "Shipping zone is required"),
  name: z.string().min(1, "Rate name is required").max(100),
  rateType: z.enum(["FLAT_RATE", "WEIGHT_BASED", "VALUE_BASED", "FREE"]),
  baseCost: z.coerce.number().min(0, "Base cost must be non-negative"),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxOrderValue: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
})

export type ShippingZoneFormData = z.infer<typeof shippingZoneFormSchema>
export type ShippingRateFormData = z.infer<typeof shippingRateFormSchema>
