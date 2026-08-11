'use client';

import { useState } from 'react';
import { createServiceAction, updateServiceAction, deleteServiceAction } from '@/app/(crm)/services/actions';
import { SERVICE_CATEGORIES } from '@/lib/constants/services';
import type { ServiceItem } from '@/lib/services/service-catalog.service';
import { formatCurrency } from '@/lib/utils/normalization';
import { Package, Plus, Edit2, CheckCircle2, XCircle, Trash2, X, Check } from 'lucide-react';

export default function ServiceCatalogClient({ initialServices }: { initialServices: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  // New Service Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [category, setCategory] = useState('social_media');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edit Service State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('social_media');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError('');

    const res = await createServiceAction({
      name: name.trim(),
      description: description.trim() || undefined,
      defaultPrice: parseFloat(defaultPrice) || 0,
      category,
    });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.service) {
      setServices([...services, res.service]);
      setName('');
      setDescription('');
      setDefaultPrice('');
    }
  };

  const handleStartEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDescription(service.description || '');
    setEditPrice(service.defaultPrice.toString());
    setEditCategory(service.category);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    const res = await updateServiceAction(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      defaultPrice: parseFloat(editPrice) || 0,
      category: editCategory,
    });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.service) {
      setServices(services.map((s) => (s.id === id ? res.service! : s)));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este servicio del catálogo?')) return;
    const res = await deleteServiceAction(id);
    if (res.error) {
      setError(res.error);
    } else {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    const newStatus = !service.isActive;
    const res = await updateServiceAction(service.id, { isActive: newStatus });
    if (res.service) {
      setServices(services.map((s) => (s.id === service.id ? res.service! : s)));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form: Add Service */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#274283]" />
          <span>Agregar Servicio al Catálogo</span>
        </h2>

        {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Gestión Social Media Full (12 posts/mes)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            >
              {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Precio Sugerido / Base (ARS) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">$</span>
              <input
                type="number"
                step="5000"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                placeholder="250000"
                className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Descripción / Alcance Sugerido
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incluye diseño gráfico, copy, calendario de publicación y reporte mensual de métricas..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full btn-primary py-2.5 px-4 text-xs font-semibold shadow-xs"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar en Catálogo'}
          </button>
        </form>
      </div>

      {/* Services List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#5CB2D4]" />
            <span>Servicios Habilitados ({services.length})</span>
          </span>
        </h2>

        {services.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay servicios guardados en el catálogo aún.</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const isEditing = editingId === service.id;

              if (isEditing) {
                return (
                  <div key={service.id} className="p-4 rounded-2xl border border-[#5CB2D4] bg-blue-50/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Categoría</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        >
                          {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Precio (ARS)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(service.id)}
                        disabled={isSubmitting}
                        className="btn-primary px-3 py-1 text-xs font-semibold"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    service.isActive
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-100/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{service.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#274283]/10 text-[#274283]">
                          {SERVICE_CATEGORIES[service.category] || service.category}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="font-bold text-base text-[#274283]">
                        {formatCurrency(service.defaultPrice)}
                      </p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            service.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Cambiar estado activo/inactivo"
                        >
                          {service.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(service)}
                          className="p-1 text-slate-400 hover:text-[#274283] hover:bg-slate-200/50 rounded-lg transition"
                          title="Editar servicio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
