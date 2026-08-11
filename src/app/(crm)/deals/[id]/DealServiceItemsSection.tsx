'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addDealServiceItemAction, removeDealServiceItemAction } from '@/app/(crm)/services/actions';
import type { ServiceItem, DealServiceItemRow } from '@/lib/services/service-catalog.service';
import { formatCurrency } from '@/lib/utils/normalization';
import { FileText, Plus, Trash2, Printer, Sparkles } from 'lucide-react';

interface DealServiceItemsSectionProps {
  dealId: string;
  catalogServices: ServiceItem[];
  initialItems: DealServiceItemRow[];
}

export default function DealServiceItemsSection({
  dealId,
  catalogServices,
  initialItems,
}: DealServiceItemsSectionProps) {
  const [items, setItems] = useState<DealServiceItemRow[]>(initialItems);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customName, setCustomName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When user selects a catalog service, pre-fill customName & unitPrice
  const handleSelectCatalogService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedServiceId(sId);

    if (sId) {
      const found = catalogServices.find((s) => s.id === sId);
      if (found) {
        setCustomName(found.name);
        setUnitPrice(found.defaultPrice.toString());
      }
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !unitPrice) return;
    setIsSubmitting(true);
    setError('');

    const res = await addDealServiceItemAction(dealId, {
      serviceId: selectedServiceId || undefined,
      customName: customName.trim(),
      unitPrice: parseFloat(unitPrice) || 0,
      quantity: parseInt(quantity) || 1,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.item) {
      setItems([...items, res.item]);
      setSelectedServiceId('');
      setCustomName('');
      setUnitPrice('');
      setQuantity('1');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const res = await removeDealServiceItemAction(itemId, dealId);
    if (res.error) {
      setError(res.error);
    } else {
      setItems(items.filter((it) => it.id !== itemId));
    }
  };

  const totalProposalAmount = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#274283]" />
          <span>Ítems y Cotización de la Propuesta</span>
        </h2>
        {items.length > 0 && (
          <Link
            href={`/deals/${dealId}/proposal`}
            target="_blank"
            className="btn-primary bg-[#274283] hover:bg-[#1a2d5a] px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Ver y Imprimir Propuesta PDF</span>
          </Link>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

      {/* Items Table */}
      {items.length === 0 ? (
        <div className="p-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Sparkles className="w-6 h-6 text-[#5CB2D4] mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Propuesta sin servicios desglosados</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Seleccioná un servicio del catálogo corporativo o agregá conceptos personalizados para generar el presupuesto PDF.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2 px-3">Servicio / Concepto</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">Precio Unit. (ARS)</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
                <th className="py-2 px-1 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">{it.customName}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{it.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(it.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#274283]">
                    {formatCurrency(it.unitPrice * it.quantity)}
                  </td>
                  <td className="py-2.5 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-bold text-sm bg-slate-50/70">
                <td colSpan={3} className="py-3 px-3 text-slate-700">Total Cotizado de la Propuesta:</td>
                <td className="py-3 px-3 text-right text-[#274283] text-base">{formatCurrency(totalProposalAmount)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Agregar Servicio a la Cotización:</p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Del Catálogo (Opcional):</label>
            <select
              value={selectedServiceId}
              onChange={handleSelectCatalogService}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- Personalizado / Otro --</option>
              {catalogServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.defaultPrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Concepto / Nombre *:</label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ej. Campañas Meta Ads + Landing Page"
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Precio Unit. ($) *:</label>
            <input
              type="number"
              step="1000"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="150000"
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Cant. *:</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !customName.trim() || !unitPrice}
            className="btn-primary py-1.5 px-4 text-xs font-semibold"
          >
            {isSubmitting ? 'Guardando...' : '+ Agregar Ítem'}
          </button>
        </div>
      </form>
    </div>
  );
}
