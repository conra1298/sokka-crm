'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitMerge, CheckCircle, AlertTriangle, ArrowRight, Info } from 'lucide-react';

interface MergeFormProps {
  targetContact: any;
  sourceContact: any;
  candidateList: any[];
}

export default function MergeForm({ targetContact, sourceContact: initialSource, candidateList }: MergeFormProps) {
  const router = useRouter();
  const [selectedSourceId, setSelectedSourceId] = useState(initialSource?.id || '');
  const [fieldSelections, setFieldSelections] = useState<Record<string, 'target' | 'source'>>({
    firstName: 'target',
    lastName: 'target',
    email: 'target',
    phone: 'target',
    jobTitle: 'target',
    companyId: 'target',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentSource = candidateList.find((c) => c.id === selectedSourceId) || initialSource;

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSource || currentSource.id === targetContact.id) {
      setError('Debes seleccionar dos contactos diferentes para realizar la fusión.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contacts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: targetContact.id,
          sourceId: currentSource.id,
          fieldSelections,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al ejecutar la fusión de registros.');
      }

      router.push(`/contacts/${targetContact.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleMergeSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Side-by-Side Comparison Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-[#274283]" />
              <span>Comparación Campo por Campo</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona qué valor de cada campo conservarás en el registro consolidado.
            </p>
          </div>

          {/* Candidate Source Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Duplicado a fusionar:</span>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white"
            >
              {candidateList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 border-b text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4 pl-6">Campo</th>
                <th className="p-4 w-5/12 bg-emerald-50/50 text-emerald-900 border-x border-emerald-100">
                  Target (Conservado)
                </th>
                <th className="p-4 w-5/12 bg-amber-50/50 text-amber-900">
                  Source (Archivado tras fusionar)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* First Name */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-700">Nombre</td>
                <td className="p-4 bg-emerald-50/20 border-x border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="firstName"
                      checked={fieldSelections.firstName === 'target'}
                      onChange={() => setFieldSelections({ ...fieldSelections, firstName: 'target' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-slate-900">{targetContact.firstName}</span>
                  </label>
                </td>
                <td className="p-4 bg-amber-50/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="firstName"
                      checked={fieldSelections.firstName === 'source'}
                      onChange={() => setFieldSelections({ ...fieldSelections, firstName: 'source' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-slate-900">{currentSource?.firstName || '—'}</span>
                  </label>
                </td>
              </tr>

              {/* Last Name */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-700">Apellido</td>
                <td className="p-4 bg-emerald-50/20 border-x border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lastName"
                      checked={fieldSelections.lastName === 'target'}
                      onChange={() => setFieldSelections({ ...fieldSelections, lastName: 'target' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-slate-900">{targetContact.lastName}</span>
                  </label>
                </td>
                <td className="p-4 bg-amber-50/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lastName"
                      checked={fieldSelections.lastName === 'source'}
                      onChange={() => setFieldSelections({ ...fieldSelections, lastName: 'source' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-slate-900">{currentSource?.lastName || '—'}</span>
                  </label>
                </td>
              </tr>

              {/* Email */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-700">Correo Electrónico</td>
                <td className="p-4 bg-emerald-50/20 border-x border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="email"
                      checked={fieldSelections.email === 'target'}
                      onChange={() => setFieldSelections({ ...fieldSelections, email: 'target' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-[#274283]">{targetContact.email}</span>
                  </label>
                </td>
                <td className="p-4 bg-amber-50/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="email"
                      checked={fieldSelections.email === 'source'}
                      onChange={() => setFieldSelections({ ...fieldSelections, email: 'source' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="font-medium text-[#274283]">{currentSource?.email || '—'}</span>
                  </label>
                </td>
              </tr>

              {/* Job Title */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-700">Cargo / Puesto</td>
                <td className="p-4 bg-emerald-50/20 border-x border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobTitle"
                      checked={fieldSelections.jobTitle === 'target'}
                      onChange={() => setFieldSelections({ ...fieldSelections, jobTitle: 'target' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="text-slate-800">{targetContact.jobTitle || 'Sin especificar'}</span>
                  </label>
                </td>
                <td className="p-4 bg-amber-50/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobTitle"
                      checked={fieldSelections.jobTitle === 'source'}
                      onChange={() => setFieldSelections({ ...fieldSelections, jobTitle: 'source' })}
                      className="text-[#274283] focus:ring-[#5CB2D4]"
                    />
                    <span className="text-slate-800">{currentSource?.jobTitle || 'Sin especificar'}</span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Impact Callout */}
      <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Info className="w-4 h-4 text-[#274283]" />
          <span>Efectos de la Transacción en la Base de Datos:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-blue-800 font-medium">
          <li>Todas las oportunidades de venta vinculadas al registro archivado se re-asociarán al registro consolidado.</li>
          <li>Todas las tareas y el historial completo de actividades se migrarán automáticamente.</li>
          <li>El registro de origen se marcará como archivado (merged_into_id) manteniendo trazabilidad completa en la auditoría.</li>
        </ul>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => router.push(`/contacts/${targetContact.id}`)}
          className="btn-secondary py-2.5 px-6 text-xs font-semibold"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary py-3 px-8 text-sm shadow-md bg-[#EB7638] hover:bg-[#d46529] text-white flex items-center gap-2"
        >
          <GitMerge className="w-4 h-4" />
          <span>{isSubmitting ? 'Fusionando Registros...' : 'Confirmar y Ejecutar Fusión'}</span>
        </button>
      </div>
    </form>
  );
}
