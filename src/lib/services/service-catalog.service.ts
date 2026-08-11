import { db } from '@/db';
import { services, dealServiceItems, deals } from '@/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: number;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealServiceItemRow {
  id: string;
  dealId: string;
  serviceId: string | null;
  customName: string;
  unitPrice: number;
  quantity: number;
  createdAt: string;
  service?: ServiceItem | null;
}

import { SERVICE_CATEGORIES } from '../constants/services';
export { SERVICE_CATEGORIES };

export async function listServices(options?: {
  category?: string;
  activeOnly?: boolean;
}): Promise<ServiceItem[]> {
  const conditions = [];

  if (options?.activeOnly) {
    conditions.push(eq(services.isActive, true));
  }
  if (options?.category) {
    conditions.push(eq(services.category, options.category));
  }

  return db.query.services.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [asc(services.name)],
  });
}

export async function createService(
  input: {
    name: string;
    description?: string;
    defaultPrice: number;
    category?: string;
  },
  user: SessionUser
): Promise<ServiceItem> {
  if (user.role === 'salesperson') {
    throw new Error('Forbidden: Only admins or managers can manage service catalog.');
  }

  const cleanName = input.name.trim();
  if (!cleanName) throw new Error('El nombre del servicio es obligatorio.');

  const [newService] = await db
    .insert(services)
    .values({
      name: cleanName,
      description: input.description?.trim() || null,
      defaultPrice: Number(input.defaultPrice) || 0,
      category: input.category || 'social_media',
      isActive: true,
    })
    .returning();

  return newService;
}

export async function updateService(
  id: string,
  input: {
    name?: string;
    description?: string;
    defaultPrice?: number;
    category?: string;
    isActive?: boolean;
  },
  user: SessionUser
): Promise<ServiceItem> {
  if (user.role === 'salesperson') {
    throw new Error('Forbidden: Only admins or managers can update service catalog.');
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined) updateData.description = input.description.trim() || null;
  if (input.defaultPrice !== undefined) updateData.defaultPrice = Number(input.defaultPrice);
  if (input.category !== undefined) updateData.category = input.category;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  updateData.updatedAt = new Date().toISOString();

  const [updated] = await db
    .update(services)
    .set(updateData)
    .where(eq(services.id, id))
    .returning();

  return updated;
}

export async function deleteService(id: string, user: SessionUser): Promise<void> {
  if (user.role === 'salesperson') {
    throw new Error('Forbidden: Only admins or managers can delete services.');
  }

  await db.delete(services).where(eq(services.id, id));
}

export async function getDealServiceItems(dealId: string): Promise<DealServiceItemRow[]> {
  const items = await db.query.dealServiceItems.findMany({
    where: eq(dealServiceItems.dealId, dealId),
    with: {
      service: true,
    },
    orderBy: [asc(dealServiceItems.createdAt)],
  });
  return items;
}

export async function addDealServiceItem(
  dealId: string,
  item: {
    serviceId?: string;
    customName: string;
    unitPrice: number;
    quantity?: number;
  },
  user: SessionUser
): Promise<DealServiceItemRow> {
  const cleanName = item.customName.trim();
  if (!cleanName) throw new Error('El concepto del ítem no puede estar vacío.');

  const [newItem] = await db
    .insert(dealServiceItems)
    .values({
      dealId,
      serviceId: item.serviceId || null,
      customName: cleanName,
      unitPrice: Number(item.unitPrice) || 0,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    })
    .returning();

  // Recalculate Deal Total Value automatically
  await recalculateDealValue(dealId);

  return newItem;
}

export async function removeDealServiceItem(itemId: string, user: SessionUser): Promise<void> {
  const item = await db.query.dealServiceItems.findFirst({
    where: eq(dealServiceItems.id, itemId),
  });

  if (!item) return;

  await db.delete(dealServiceItems).where(eq(dealServiceItems.id, itemId));

  // Recalculate Deal Total Value automatically
  await recalculateDealValue(item.dealId);
}

async function recalculateDealValue(dealId: string): Promise<void> {
  const items = await db.query.dealServiceItems.findMany({
    where: eq(dealServiceItems.dealId, dealId),
  });

  const totalCalculated = items.reduce((sum: number, it: any) => sum + (it.unitPrice * it.quantity), 0);

  if (items.length > 0) {
    await db.update(deals).set({ value: totalCalculated, updatedAt: new Date().toISOString() }).where(eq(deals.id, dealId));
  }
}
