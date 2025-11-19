"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import prisma from "../prisma";
import { Category } from "@prisma/client";

const SPECIFICATIONS_TAG = "specifications";
const SPECIFICATION_BY_ID_TAG = (id: string) => `${SPECIFICATIONS_TAG}:${id}`;
const CATEGORY_SPECIFICATIONS_TAG = (categoryId: string) =>
  `${SPECIFICATIONS_TAG}:category:${categoryId}`;

const specificationDefinitionSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
});

const specificationArraySchema = z.array(specificationDefinitionSchema);

type SpecInput = z.infer<typeof specificationDefinitionSchema>;
type SpecsPayload = { specifications: SpecInput[] };

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export async function createSpecifications(payload: SpecsPayload) {
  try {
    const parsed = specificationArraySchema.safeParse(payload.specifications);
    if (!parsed.success)
      return {
        success: false,
        message: "Invalid data",
        errors: parsed.error.format(),
      };

    const specs = parsed.data;
    const results = [];

    for (const spec of specs) {
      const existing = await prisma.specificationDefinition.findFirst({
        where: { categoryId: spec.categoryId, name: spec.name },
      });

      if (existing) {
        return {
          success: false,
          error: `Spec already exists.`,
        };
      }

      const created = await prisma.specificationDefinition.create({
        data: {
          categoryId: spec.categoryId,
          name: spec.name,
          key: spec.key ?? normalizeKey(spec.name),
        },
      });
      results.push(created);
    }

    const affectedCategoryIds = [...new Set(specs.map((s) => s.categoryId))];
    for (const id of affectedCategoryIds)
      revalidateTag(CATEGORY_SPECIFICATIONS_TAG(id));
    revalidateTag(SPECIFICATIONS_TAG);
    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: `Created ${results.length} specifications`,
      created: results,
    };
  } catch (error) {
    console.error("Create specifications failed:", error);
    return { success: false, message: "Failed to create specifications" };
  }
}

export async function upsertSpecifications(payload: SpecsPayload) {
  try {
    const parsed = specificationArraySchema.safeParse(payload.specifications);
    if (!parsed.success)
      return {
        success: false,
        message: "Invalid data",
        errors: parsed.error.format(),
      };

    const specs = parsed.data;
    await prisma.$transaction(
      specs.map((spec) => {
        const data = {
          categoryId: spec.categoryId,
          name: spec.name,
          key: spec.key ?? normalizeKey(spec.name),
        };
        return spec.id
          ? prisma.specificationDefinition.update({
              where: { id: spec.id },
              data,
            })
          : prisma.specificationDefinition.create({ data });
      })
    );

    const affectedCategoryIds = [...new Set(specs.map((s) => s.categoryId))];
    for (const id of affectedCategoryIds)
      revalidateTag(CATEGORY_SPECIFICATIONS_TAG(id));
    revalidateTag(SPECIFICATIONS_TAG);
    revalidatePath("/dashboard/categories");

    return { success: true, message: "Specifications upserted successfully" };
  } catch (error) {
    console.error("Upsert specifications failed:", error);
    return { success: false, message: "Failed to upsert specifications" };
  }
}

export async function deleteSpecification(id: string) {
  try {
    const deleted = await prisma.specificationDefinition.delete({
      where: { id },
    });
    revalidateTag(SPECIFICATIONS_TAG);
    revalidateTag(CATEGORY_SPECIFICATIONS_TAG(deleted.categoryId));
    return { success: true, message: "Specification deleted" };
  } catch (error) {
    console.error("Delete specification failed:", error);
    return { success: false, message: "Failed to delete specification" };
  }
}

export const getSpecificationById = unstable_cache(
  async (id: string) =>
    prisma.specificationDefinition.findUnique({
      where: { id },
      include: { category: true },
    }),
  [SPECIFICATION_BY_ID_TAG("any")],
  { revalidate: 3600, tags: [SPECIFICATIONS_TAG] }
);

export const getAllSpecifications = unstable_cache(
  async () =>
    prisma.specificationDefinition.findMany({
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
  [SPECIFICATIONS_TAG],
  { revalidate: 3600, tags: [SPECIFICATIONS_TAG] }
);

export async function getSpecificationsForProduct(productId: string) {
  try {
    const specs = await prisma.productSpecificationValue.findMany({
      where: { productId },
      include: { specificationDef: { include: { category: true } } },
      orderBy: { specificationDef: { createdAt: "asc" } },
    });
    return { success: true, specifications: specs };
  } catch (error) {
    console.error("Failed to get specs for product:", error);
    return { success: false, message: "Failed to load specs" };
  }
}

type MongoAggregateResponse = {
  cursor?: {
    firstBatch?: {
      allCategoryIds?: { $oid?: string }[];
    }[];
  };
};

export const getSpecificationsForCategory = unstable_cache(
  async (categoryId: string) => {
    try {
      const rawResult = await prisma.$runCommandRaw({
        aggregate: "Category",
        pipeline: [
          { $match: { _id: { $oid: categoryId } } },
          {
            $graphLookup: {
              from: "Category",
              startWith: "$parentId",
              connectFromField: "parentId",
              connectToField: "_id",
              as: "ancestors",
            },
          },
          {
            $project: {
              allCategoryIds: {
                $concatArrays: [["$_id"], "$ancestors._id"],
              },
            },
          },
        ],
        cursor: {},
      });

      const result = rawResult as unknown as MongoAggregateResponse;

      const allIds = result?.cursor?.firstBatch?.[0]?.allCategoryIds || [];
      if (allIds.length === 0)
        return { success: false, message: "No categories found in hierarchy" };

      const specs = await prisma.specificationDefinition.findMany({
        where: { categoryId: { in: allIds.map((id: any) => id.$oid ?? id) } },
        include: { category: true },
        orderBy: { createdAt: "asc" },
      });

      return { success: true, specifications: specs };
    } catch (error) {
      console.error("getSpecificationsForCategory failed:", error);
      return { success: false, message: "Error fetching specifications" };
    }
  },
  [CATEGORY_SPECIFICATIONS_TAG("any")],
  { revalidate: 3600, tags: [SPECIFICATIONS_TAG] }
);

export type CategoryWithSpecsAndParent = Category & {
  specifications: {
    id: string;
    name: string;
    key: string;
    categoryId: string;
  }[];
  parent?: { id: string | null } | null;
};

export const getSpecificationsForCategories = async (
  categoryId: string | null
) =>
  unstable_cache(
    async (): Promise<{
      success: boolean;
      specifications: {
        id: string;
        name: string;
        key: string;
        categoryId: string;
      }[];
      message?: string;
    }> => {
      if (!categoryId) {
        return {
          success: false,
          specifications: [],
          message: "No category ID provided",
        };
      }

      const collectedSpecs: Record<string, any> = {};
      let currentCategoryId: string | null = categoryId;

      // Walk up the tree to inherit parent specs
      while (currentCategoryId) {
        const category: CategoryWithSpecsAndParent | null =
          await prisma.category.findUnique({
            where: { id: currentCategoryId },
            include: {
              specifications: true,
              parent: { select: { id: true } },
            },
          });

        if (!category) break;

        for (const spec of category.specifications) {
          collectedSpecs[spec.id] = spec;
        }

        currentCategoryId = category.parent?.id ?? null;
      }

      const uniqueSpecs = Object.values(collectedSpecs).sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );

      return { success: true, specifications: uniqueSpecs };
    },
    [`${SPECIFICATIONS_TAG}-for-category-${categoryId}`],
    { tags: [SPECIFICATIONS_TAG, `category-${categoryId}`] }
  )();
