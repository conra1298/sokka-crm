'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import { db } from '@/db';
import { deals, companies, pipelineStages, contacts, activities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function createActiveClientAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const title = formData.get('title') as string;
  const monthlyValue = formData.get('monthlyValue') ? parseFloat(formData.get('monthlyValue') as string) : 0;
  const renewalDay = formData.get('renewalDay') as string;
  const startDate = formData.get('startDate') as string;
  const ownerId = (formData.get('ownerId') as string) || user.id;
  const existingCompanyId = formData.get('companyId') as string;
  const newCompanyName = formData.get('newCompanyName') as string;
  const contactId = formData.get('contactId') as string;
  const notes = formData.get('notes') as string;

  if (!title || (!existingCompanyId && !newCompanyName)) {
    return { error: 'El nombre del servicio y la empresa son obligatorios.' };
  }

  try {
    // 1. Resolver o Crear Empresa
    let finalCompanyId = existingCompanyId;
    if (!finalCompanyId && newCompanyName?.trim()) {
      const [newComp] = await db
        .insert(companies)
        .values({
          name: newCompanyName.trim(),
          clientStatus: 'active_client',
          ownerId,
        })
        .returning();
      finalCompanyId = newComp.id;
    } else if (finalCompanyId) {
      // Actualizar estado a cliente activo
      await db
        .update(companies)
        .set({ clientStatus: 'active_client', updatedAt: new Date().toISOString() })
        .where(eq(companies.id, finalCompanyId));
    }

    // 2. Obtener Etapa Ganada
    const wonStage = await db.query.pipelineStages.findFirst({
      where: (s: any, { eq }: any) => eq(s.isWon, true),
    });

    const fallbackStage =
      wonStage ||
      (await db.query.pipelineStages.findFirst({
        orderBy: [desc(pipelineStages.displayOrder)],
      }));

    if (!fallbackStage) {
      return { error: 'No se encontró una etapa configurada en el embudo.' };
    }

    // 3. Crear el Deal de Retainer Activo
    const [newDeal] = await db
      .insert(deals)
      .values({
        title: title.trim(),
        value: monthlyValue,
        monthlyValue,
        currency: 'ARS',
        dealType: 'retainer',
        retainerStartDate: startDate || new Date().toISOString().split('T')[0],
        retainerRenewalDate: renewalDay ? `Día ${renewalDay} de cada mes` : null,
        briefNotes: notes?.trim() || null,
        stageId: fallbackStage.id,
        companyId: finalCompanyId || null,
        contactId: contactId && contactId.trim() !== '' ? contactId : null,
        ownerId,
        closedAt: new Date().toISOString(),
      })
      .returning();

    // 4. Registrar Actividad
    await db.insert(activities).values({
      type: 'deal_created',
      content: `Cliente activo dado de alta con servicio mensual: "${title}" ($ ${monthlyValue.toLocaleString('es-AR')}) por ${user.name}`,
      metadata: {
        deal_id: newDeal.id,
        monthly_value: monthlyValue,
        renewal_day: renewalDay,
      },
      dealId: newDeal.id,
      companyId: finalCompanyId || null,
      contactId: contactId && contactId.trim() !== '' ? contactId : null,
      createdBy: user.id,
    });

    revalidatePath('/clients');
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    revalidatePath('/companies');
    return { success: true, dealId: newDeal.id };
  } catch (err: any) {
    console.error('Error creating active client:', err);
    return { error: err.message || 'Error al guardar el cliente activo.' };
  }
}

export async function cancelRetainerAction(dealId: string) {
  const user = await requireAuth();

  try {
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
      with: { company: true },
    });

    if (!deal) return { error: 'Servicio no encontrado' };

    // Buscar etapa de cerrada perdida
    const lostStage = await db.query.pipelineStages.findFirst({
      where: (s: any, { and, eq }: any) => and(eq(s.isTerminal, true), eq(s.isWon, false)),
    });

    await db
      .update(deals)
      .set({
        stageId: lostStage ? lostStage.id : deal.stageId,
        isArchived: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(deals.id, dealId));

    if (deal.companyId) {
      await db
        .update(companies)
        .set({ clientStatus: 'ex_client', updatedAt: new Date().toISOString() })
        .where(eq(companies.id, deal.companyId));
    }

    await db.insert(activities).values({
      type: 'status_change',
      content: `Servicio mensual "${deal.title}" dado de baja por ${user.name}`,
      dealId: deal.id,
      companyId: deal.companyId,
      createdBy: user.id,
    });

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    revalidatePath('/deals');
    revalidatePath('/companies');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al cancelar el servicio.' };
  }
}
