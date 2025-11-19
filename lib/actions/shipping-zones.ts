"use server";

import { revalidatePath } from "next/cache";
import { ShippingZoneFormData } from "../schemas/shipping";

const mockShippingZones = new Map<string, any>();

export async function createShippingZone(data: ShippingZoneFormData) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const id = `zone-${Date.now()}`;
    mockShippingZones.set(id, { id, ...data, createdAt: new Date() });

    revalidatePath("/shipping-zones");
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: "Failed to create shipping zone" };
  }
}

export async function updateShippingZone(
  id: string,
  data: ShippingZoneFormData
) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const existing = mockShippingZones.get(id);
    if (!existing) {
      return { success: false, error: "Shipping zone not found" };
    }

    mockShippingZones.set(id, { ...existing, ...data, updatedAt: new Date() });

    revalidatePath("/shipping-zones");
    revalidatePath(`/shipping-zones/${id}/edit`);
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: "Failed to update shipping zone" };
  }
}

export async function getShippingZone(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockShippingZones.get(id) || null;
}

export async function getShippingZones() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Array.from(mockShippingZones.values());
}
