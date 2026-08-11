'use client';

import { Printer, ArrowLeft, Building2, User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/normalization';

interface PrintProposalClientProps {
  deal: any;
  items: any[];
  totalAmount: number;
  proposalDate: string;
  validUntilDate: string;
}

export default function PrintProposalClient({
  deal,
  items,
  totalAmount,
  proposalDate,
  validUntilDate,
}: PrintProposalClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <Link
          href={`/deals/${deal.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Negocio</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-primary bg-[#274283] hover:bg-[#1a2d5a] px-5 py-2 text-xs flex items-center gap-2 shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar en PDF</span>
        </button>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg print:shadow-none print:border-none print:p-0 space-y-8 font-sans">
        {/* Header Branding */}
        <div className="flex items-start justify-between border-b-2 border-[#274283] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EB7638] flex items-center justify-center font-bold text-white shadow-md text-xl">
                S
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-[#274283] tracking-tight">
                  SOKKA ESTUDIO
                </h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Agencia de Marketing Digital & Growth B2B
                </p>
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#5CB2D4]/20 text-[#274283] font-bold text-xs">
              Propuesta Comercial
            </span>
            <p className="text-slate-500 pt-1 font-mono">Ref: PROP-{deal.id.substring(0, 8).toUpperCase()}</p>
            <p className="text-slate-600 font-medium">Fecha: {proposalDate}</p>
            <p className="text-slate-500 text-[11px]">Validez: Hasta el {validUntilDate}</p>
          </div>
        </div>

        {/* Title & Customer Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#274283]">Preparado Para:</p>
            <h2 className="font-display font-bold text-lg text-slate-900">
              {deal.company?.name || 'Cliente'}
            </h2>
            {deal.contact && (
              <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Attn: {deal.contact.firstName} {deal.contact.lastName} ({deal.contact.jobTitle || 'Contacto Principal'})</span>
              </p>
            )}
            {deal.contact?.email && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{deal.contact.email}</span>
              </p>
            )}
          </div>

          <div className="space-y-2 sm:text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#274283]">Presentado Por:</p>
            <p className="font-bold text-sm text-slate-900">{deal.owner?.name || 'Sokka Estudio'}</p>
            <p className="text-xs text-slate-600">Sokka Estudio Creativo</p>
            <p className="text-xs text-slate-500">contacto@sokkaestudio.com</p>
          </div>
        </div>

        {/* Project Title & Strategic Brief Notes */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-[#274283]">
            {deal.title}
          </h3>
          {deal.briefNotes ? (
            <div className="p-4 rounded-2xl bg-[#5CB2D4]/10 border border-[#5CB2D4]/30 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#274283]">Alcance / Resumen Ejecutivo del Servicio:</p>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{deal.briefNotes}</p>
            </div>
          ) : deal.company?.briefNotes ? (
            <div className="p-4 rounded-2xl bg-[#5CB2D4]/10 border border-[#5CB2D4]/30 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#274283]">Alcance / Contexto del Cliente:</p>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{deal.company.briefNotes}</p>
            </div>
          ) : null}
        </div>

        {/* Commercial Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Desglose de Inversión</h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase text-[10px] bg-slate-100">
                <th className="py-2.5 px-4">Servicio / Entregable</th>
                <th className="py-2.5 px-4 text-center">Cantidad</th>
                <th className="py-2.5 px-4 text-right">Precio Unitario (ARS)</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-center text-slate-500 italic">
                    Propuesta global por un valor estipulado de {formatCurrency(deal.value)} ARS.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{it.customName}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{it.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(it.unitPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#274283]">
                      {formatCurrency(it.unitPrice * it.quantity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#274283] font-bold text-base bg-slate-50">
                <td colSpan={3} className="py-3.5 px-4 text-slate-800">
                  Inversión Total {deal.dealType === 'retainer' ? 'Mensual (Retainer)' : 'del Proyecto'}:
                </td>
                <td className="py-3.5 px-4 text-right text-[#274283] text-lg font-display">
                  {formatCurrency(totalAmount > 0 ? totalAmount : deal.value)} ARS
                </td>
              </tr>
            </tfoot>
          </table>
          <p className="text-[11px] text-slate-400 text-right italic">* Los valores no incluyen IVA salvo especificación explícita.</p>
        </div>

        {/* Terms & Conditions Block */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
          <p className="font-bold text-[#274283] uppercase tracking-wider text-[11px]">Términos y Condiciones de Contratación:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
            <li>Forma de pago: 50% al inicio de la contratación y 50% a la entrega del proyecto o al cierre del ciclo mensual.</li>
            <li>La presente cotización se mantiene vigente por un período de 15 días corridos desde su emisión.</li>
            <li>Los presupuestos publicitarios en plataformas (Meta Ads, Google Ads) se abonan directamente por el cliente a las plataformas.</li>
          </ul>
        </div>

        {/* Signatures Block */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs border-t border-slate-200">
          <div className="space-y-8">
            <div className="h-12 border-b border-slate-300 mx-auto w-3/4"></div>
            <div>
              <p className="font-bold text-slate-900">{deal.company?.name || 'Cliente'}</p>
              <p className="text-slate-400 text-[11px]">Firma de Aceptación y Conformidad</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-12 border-b border-slate-300 mx-auto w-3/4"></div>
            <div>
              <p className="font-bold text-slate-900">Sokka Estudio</p>
              <p className="text-slate-400 text-[11px]">Representante Comercial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
