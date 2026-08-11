'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import {
  createService,
  updateService,
  addDealServiceItem,
  removeDealServiceItem,
} from '@/lib/services/service-catalog.service';

export async function createServiceAction(data: {
  name: string;
  description?: string;
  defaultPrice: number;
  category?: string;
}) {
  const user = await requireAuth();
  try {
    const service = await createService(data, user);
    revalidatePath('/settings/services');
    return { success: true, service };
  } catch (err: any) {
    return { error: err.message || 'Error al crear el servicio.' };
  }
}

export async function updateServiceAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    defaultPrice?: number;
    category?: string;
    isActive?: boolean;
  }
) {
  const user = await requireAuth();
  try {
    const service = await updateService(id, data, user);
    revalidatePath('/settings/services');
    return { success: true, service };
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar el servicio.' };
  }
}

export async function deleteServiceAction(id: string) {
  const user = await requireAuth();
  try {
    const { deleteService } = await import('@/lib/services/service-catalog.service');
    await deleteService(id, user);
    revalidatePath('/settings/services');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al eliminar el servicio.' };
  }
}

export async function addDealServiceItemAction(
  dealId: string,
  data: {
    serviceId?: string;
    customName: string;
    unitPrice: number;
    quantity?: number;
  }
) {
  const user = await requireAuth();
  try {
    const item = await addDealServiceItem(dealId, data, user);
    revalidatePath(`/deals/${dealId}`);
    revalidatePath('/deals');
    return { success: true, item };
  } catch (err: any) {
    return { error: err.message || 'Error al agregar el ítem a la propuesta.' };
  }
}

export async function removeDealServiceItemAction(itemId: string, dealId: string) {
  const user = await requireAuth();
  try {
    await removeDealServiceItem(itemId, user);
    revalidatePath(`/deals/${dealId}`);
    revalidatePath('/deals');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al eliminar el ítem de la propuesta.' };
  }
}
