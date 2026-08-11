'use client';

import { useState } from 'react';
import TagBadge from '@/components/TagBadge';
import { createTagAction, deleteTagAction } from '@/app/(crm)/tags/actions';
import { Tag, Plus, Trash2, Check } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  { name: 'Celeste Sokka', hex: '#5CB2D4' },
  { name: 'Azul Sokka', hex: '#274283' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Naranja', hex: '#EDA143' },
  { name: 'Coral', hex: '#EB7638' },
  { name: 'Rosa Instagram', hex: '#E1306C' },
  { name: 'Púrpura', hex: '#8B5CF6' },
  { name: 'Gris', hex: '#64748B' },
];

export default function TagManagerClient({ initialTags }: { initialTags: TagItem[] }) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsSubmitting(true);
    setError('');

    const res = await createTagAction(newTagName.trim(), selectedColor);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.tag) {
      setTags([...tags, res.tag]);
      setNewTagName('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar esta etiqueta? Se quitará de todos los contactos y empresas.')) return;
    const res = await deleteTagAction(id);
    if (res.error) {
      setError(res.error);
    } else {
      setTags(tags.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Form: Create Tag */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#274283]" />
          <span>Crear Nueva Etiqueta</span>
        </h2>

        {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Etiqueta *
            </label>
            <input
              type="text"
              required
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="ej. VIP, Ecommerce, Lead Caliente"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Color de Identificación
            </label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    selectedColor === c.hex
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="text-[11px] font-semibold text-slate-700 truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newTagName.trim()}
            className="w-full btn-primary py-2.5 px-4 text-xs font-semibold shadow-xs"
          >
            {isSubmitting ? 'Guardando...' : 'Crear Etiqueta'}
          </button>
        </form>
      </div>

      {/* Right List: Existing Tags */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#5CB2D4]" />
            <span>Etiquetas Registradas ({tags.length})</span>
          </span>
        </h2>

        {tags.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay etiquetas creadas todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <TagBadge name={tag.name} color={tag.color} size="md" />
                <button
                  type="button"
                  onClick={() => handleDelete(tag.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Eliminar etiqueta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
