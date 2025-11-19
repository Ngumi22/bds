"use server";

import {
  heroBannerFormSchema,
  HeroBannerFormValues,
} from "@/lib/schemas/hero-banner";
import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { HERO_BANNERS_TAG } from "../constants";

export async function createHeroBanner(rawData: HeroBannerFormValues) {
  try {
    const data = heroBannerFormSchema.parse(rawData);

    const banner = await prisma.heroBanner.create({
      data: {
        title: data.title,
        tag: data.tag,
        description: data.description,
        buttonText: data.buttonText,
        image: data.image,
        linkUrl: data.linkUrl || null,
        collectionId: data.collectionId || null,
        isActive: data.isActive,
        order: data.order,
      },
      include: {
        collection: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateTag(HERO_BANNERS_TAG);

    return {
      success: true,
      data: banner,
      message: "Banner created successfully!",
    };
  } catch (error) {
    console.error("createHeroBanner error:", error);
    return {
      success: false,
      message: "Failed to create hero banner",
    };
  }
}

export async function updateHeroBanner(
  id: string,
  rawData: HeroBannerFormValues
) {
  try {
    const data = heroBannerFormSchema.parse(rawData);

    const updated = await prisma.heroBanner.update({
      where: { id },
      data: {
        title: data.title,
        tag: data.tag,
        description: data.description,
        buttonText: data.buttonText,
        image: data.image,
        linkUrl: data.linkUrl || null,
        collectionId: data.collectionId || null,
        isActive: data.isActive,
        order: data.order,
      },
      include: {
        collection: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateTag(HERO_BANNERS_TAG);
    revalidateTag(`${HERO_BANNERS_TAG}:${id}`);

    return {
      success: true,
      data: updated,
      message: "Banner updated successfully!",
    };
  } catch (error) {
    console.error("updateHeroBanner error:", error);
    return {
      success: false,
      message: "Failed to update hero banner",
    };
  }
}

export async function deleteHeroBanner(id: string) {
  try {
    await prisma.heroBanner.delete({ where: { id } });

    revalidateTag(HERO_BANNERS_TAG);
    revalidateTag(`${HERO_BANNERS_TAG}:${id}`);

    return { success: true, message: "Banner deleted successfully!" };
  } catch (error) {
    console.error("deleteHeroBanner error:", error);
    return {
      success: false,
      message: "Failed to delete hero banner",
    };
  }
}

export async function archiveHeroBanner(id: string) {
  try {
    const updated = await prisma.heroBanner.update({
      where: { id },
      data: { isActive: false },
    });

    revalidateTag(HERO_BANNERS_TAG);
    revalidateTag(`${HERO_BANNERS_TAG}:${id}`);

    return {
      success: true,
      data: updated,
      message: "Banner archived successfully!",
    };
  } catch (error) {
    console.error("archiveHeroBanner error:", error);
    return {
      success: false,
      message: "Failed to archive hero banner",
    };
  }
}

export async function unarchiveHeroBanner(id: string) {
  try {
    const updated = await prisma.heroBanner.update({
      where: { id },
      data: { isActive: true },
    });

    revalidateTag(HERO_BANNERS_TAG);
    revalidateTag(`${HERO_BANNERS_TAG}:${id}`);

    return {
      success: true,
      data: updated,
      message: "Banner unarchived successfully!",
    };
  } catch (error) {
    console.error("unarchiveHeroBanner error:", error);
    return {
      success: false,
      message: "Failed to unarchive hero banner",
    };
  }
}

export const getAllHeroBanners = unstable_cache(
  async () => {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { order: "asc" },
      include: {
        collection: { select: { id: true, name: true, slug: true } },
      },
    });
    return banners;
  },
  [HERO_BANNERS_TAG],
  {
    tags: [HERO_BANNERS_TAG],
    revalidate: 60,
  }
);

export const getHeroBannerById = async (id: string) =>
  unstable_cache(
    async () => {
      const banner = await prisma.heroBanner.findUnique({
        where: { id },
        include: {
          collection: { select: { id: true, name: true, slug: true } },
        },
      });
      return banner;
    },
    [`${HERO_BANNERS_TAG}:${id}`],
    {
      tags: [`${HERO_BANNERS_TAG}:${id}`, HERO_BANNERS_TAG],
      revalidate: 120,
    }
  )();
