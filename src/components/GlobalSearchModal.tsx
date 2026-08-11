'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Building2, Kanban, X, Command } from 'lucide-react';
import { SearchResultItem } from '@/lib/services/search.service';

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search API request
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contact': return <User className="w-4 h-4 text-[#5CB2D4]" />;
      case 'company': return <Building2 className="w-4 h-4 text-[#274283]" />;
      case 'deal': return <Kanban className="w-4 h-4 text-[#EB7638]" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs transition font-sans"
      >
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Buscar contactos, empresas...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-500 border border-slate-300 ml-2 shadow-2xs">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Input Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#274283] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí para buscar contactos, empresas u oportunidades..."
                className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-1">
              {isLoading && (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  Buscando en la base de datos...
                </div>
              )}

              {!isLoading && query.trim().length >= 2 && results.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No se encontraron registros que coincidan con &quot;{query}&quot;.
                </div>
              )}

              {!isLoading && results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => handleSelectResult(item.href)}
                  className="w-full p-3 rounded-2xl text-left hover:bg-slate-50 flex items-center justify-between transition group border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-white transition flex-shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate group-hover:text-[#274283]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-[#274283] group-hover:text-white transition">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-4">
              <span>Apretá <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">ESC</kbd> para salir</span>
              <span>Sokka CRM Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
