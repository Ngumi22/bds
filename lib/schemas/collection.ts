import { z } from "zod";

export const collectionFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    collectionType: z.enum(["STATIC", "DYNAMIC", "FLASH_SALE", "SEASONAL"]),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    productIds: z.array(z.string()),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.collectionType === "FLASH_SALE") {
        return !!data.startsAt && !!data.endsAt;
      }
      return true;
    },
    {
      message: "Start and end times are required for flash sales",
      path: ["startsAt"],
    }
  )
  .refine(
    (data) => {
      if (
        data.collectionType === "FLASH_SALE" &&
        data.startsAt &&
        data.endsAt
      ) {
        return new Date(data.endsAt) > new Date(data.startsAt);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    }
  );

export type CollectionFormData = z.infer<typeof collectionFormSchema>;
