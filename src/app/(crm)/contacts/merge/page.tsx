import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/services/auth.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import MergeForm from './MergeForm';
import { GitMerge, ArrowLeft } from 'lucide-react';

export default async function ContactMergePage(props: {
  searchParams?: Promise<{ targetId?: string; sourceId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth('admin');

  const targetId = searchParams?.targetId;
  const sourceId = searchParams?.sourceId;

  // Fetch target contact if provided
  const targetContact = targetId
    ? await db.query.contacts.findFirst({
        where: (c: any, { eq }: any) => eq(c.id, targetId),
        with: { company: true, owner: true },
      })
    : null;

  // Fetch candidate duplicates matching target normalized email or all duplicate contacts
  let duplicateCandidates: any[] = [];

  if (targetContact) {
    duplicateCandidates = await db.query.contacts.findMany({
      where: (c: any, { and, eq, ne }: any) =>
        and(
          eq(c.normalizedEmail, targetContact.normalizedEmail),
          ne(c.id, targetContact.id),
          eq(c.isArchived, false)
        ),
      with: { company: true, owner: true },
    });
  } else {
    // If no target provided, list all contacts with duplicate flags
    duplicateCandidates = await db.query.contacts.findMany({
      where: (c: any, { eq }: any) => eq(c.isArchived, false),
      with: { company: true, owner: true },
      limit: 20,
    });
  }

  const sourceContact = sourceId
    ? await db.query.contacts.findFirst({
        where: (c: any, { eq }: any) => eq(c.id, sourceId),
        with: { company: true, owner: true },
      })
    : duplicateCandidates[0] || null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Contactos</span>
        </Link>
      </div>

      <PageHeader
        title="Fusión Inteligente de Registros Duplicados"
        subtitle="Unifica información, oportunidades, tareas y actividades de dos registros en un solo contacto consolidado de forma transparente."
      />

      {!targetContact ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-display font-bold text-lg text-slate-800">Selecciona el Contacto a Conservar (Objetivo)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {duplicateCandidates.map((c: any) => (
              <Link
                key={c.id}
                href={`/contacts/merge?targetId=${c.id}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-[#274283] hover:shadow-md transition bg-slate-50/50 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">{c.firstName} {c.lastName}</h3>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <span className="text-xs font-bold text-[#274283]">Seleccionar →</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <MergeForm targetContact={targetContact as any} sourceContact={sourceContact as any} candidateList={duplicateCandidates} />
      )}
    </div>
  );
}
