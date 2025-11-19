"use server";

import { revalidatePath } from "next/cache";
import { DiscountFormData } from "../schemas/discount";

const mockDiscounts = new Map<string, any>();

export async function createDiscount(data: DiscountFormData) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const id = `disc-${Date.now()}`;
    mockDiscounts.set(id, { id, ...data, createdAt: new Date() });

    revalidatePath("/discounts");
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: "Failed to create discount" };
  }
}

export async function updateDiscount(id: string, data: DiscountFormData) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const existing = mockDiscounts.get(id);
    if (!existing) {
      return { success: false, error: "Discount not found" };
    }

    mockDiscounts.set(id, { ...existing, ...data, updatedAt: new Date() });

    revalidatePath("/discounts");
    revalidatePath(`/discounts/${id}/edit`);
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: "Failed to update discount" };
  }
}

export async function getDiscount(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockDiscounts.get(id) || null;
}

export async function getDiscounts() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Array.from(mockDiscounts.values());
}
