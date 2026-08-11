'use client';

import { useState } from 'react';
import { Tag, Plus, Check, X } from 'lucide-react';
import TagBadge from './TagBadge';

export interface TagOption {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  allTags: TagOption[];
  selectedTagIds: string[];
  onChange: (newTagIds: string[]) => void;
  onCreateTag?: (name: string, color: string) => Promise<TagOption | null>;
  label?: string;
}

const PRESET_COLORS = ['#5CB2D4', '#274283', '#10B981', '#EDA143', '#EB7638', '#E1306C', '#8B5CF6', '#64748B'];

export default function TagSelector({
  allTags,
  selectedTagIds,
  onChange,
  onCreateTag,
  label = 'Etiquetas',
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const handleCreate = async () => {
    if (!newTagName.trim() || !onCreateTag) return;
    setIsCreating(true);
    const created = await onCreateTag(newTagName.trim(), selectedColor);
    setIsCreating(false);
    if (created) {
      onChange([...selectedTagIds, created.id]);
      setNewTagName('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#5CB2D4]" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-[#274283] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>{isOpen ? 'Cerrar' : 'Editar Etiquetas'}</span>
        </button>
      </div>

      {/* Selected tags badges list */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-2xl bg-slate-50 border border-slate-200">
        {selectedTags.length === 0 ? (
          <span className="text-xs text-slate-400 italic">Sin etiquetas asignadas</span>
        ) : (
          selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={() => toggleTag(tag.id)}
            />
          ))
        )}
      </div>

      {/* Popover / Expandable Selector */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-3 mt-2">
          <p className="text-xs font-semibold text-slate-600">Seleccionar Etiquetas Existentes:</p>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {allTags.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay etiquetas creadas todavía.</p>
            ) : (
              allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-[#274283] text-white border-transparent'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span>{tag.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Creation Form */}
          {onCreateTag && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold uppercase text-slate-400">Crear Nueva Etiqueta:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nombre de la etiqueta..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating || !newTagName.trim()}
                  className="btn-primary px-3 py-1.5 text-xs whitespace-nowrap"
                >
                  {isCreating ? 'Guardando...' : 'Crear'}
                </button>
              </div>
              <div className="flex gap-1.5 items-center pt-1">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Color:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      selectedColor === c ? 'scale-125 border-slate-800 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
