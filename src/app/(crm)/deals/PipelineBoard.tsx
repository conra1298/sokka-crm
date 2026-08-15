'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatCurrency, formatDate } from '@/lib/utils/normalization';
import { moveDealStageAction } from './actions';
import {
  AlertCircle,
  Calendar,
  Building2,
  User,
  Clock,
  ArrowUpDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  displayOrder: number;
  isWon: boolean;
  isTerminal: boolean;
}

interface Deal {
  id: string;
  title: string;
  value?: string | number | null;
  monthlyValue?: string | number | null;
  stageId: string;
  ownerId: string;
  expectedCloseDate?: string | Date | null;
  createdAt?: string | Date | null;
  company?: { name: string } | null;
  contact?: { firstName: string; lastName: string } | null;
  owner?: { name: string } | null;
  updatedAt?: string | Date | null;
  tasks?: Array<{ id: string; title: string; isCompleted: boolean; dueDate: string | Date | null }>;
}

interface PipelineBoardProps {
  stages: Stage[];
  initialDeals: Deal[];
  userRole: string;
}

type SortOption = 'custom' | 'highest_value' | 'lowest_value' | 'newest' | 'oldest';

export default function PipelineBoard({ stages, initialDeals, userRole }: PipelineBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [isCompact, setIsCompact] = useState(false);

  // Drag-to-scroll container state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('[data-deal-card="true"]') ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea')
    ) {
      return;
    }

    if (!scrollContainerRef.current) return;

    isPanningRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    setIsPanning(true);

    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isPanningRef.current || !scrollContainerRef.current) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleGlobalMouseUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find((d) => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeDealItem = deals.find((d) => d.id === activeId);
    if (!activeDealItem) return;

    const isOverStage = stages.some((s) => s.id === overId);
    const isOverDeal = deals.some((d) => d.id === overId);

    let targetStageId = activeDealItem.stageId;
    let updatedDeals = [...deals];

    if (isOverStage) {
      targetStageId = overId;
      if (activeDealItem.stageId !== targetStageId) {
        updatedDeals = deals.map((d) =>
          d.id === activeId ? { ...d, stageId: targetStageId } : d
        );
      }
    } else if (isOverDeal) {
      const overDealItem = deals.find((d) => d.id === overId);
      if (overDealItem) {
        targetStageId = overDealItem.stageId;
        const oldIndex = deals.findIndex((d) => d.id === activeId);
        const newIndex = deals.findIndex((d) => d.id === overId);

        const updatedDeal = { ...activeDealItem, stageId: targetStageId };
        const temp = [...deals];
        temp[oldIndex] = updatedDeal;
        updatedDeals = arrayMove(temp, oldIndex, newIndex);
      }
    }

    // Switch sort mode to custom so user's manual ordering persists
    setSortBy('custom');
    setDeals(updatedDeals);

    // Call server action if the stage changed
    if (activeDealItem.stageId !== targetStageId) {
      const previousStageId = activeDealItem.stageId;
      const result = await moveDealStageAction(activeId, targetStageId);
      if (!result.success) {
        setDeals(deals);
        setErrorNotice(result.error || 'Error al cambiar la etapa de la oportunidad.');
        setTimeout(() => setErrorNotice(null), 4000);
      }
    }
  };

  // Sort deals for columns
  const sortedDeals = useMemo(() => {
    if (sortBy === 'custom') return deals;
    const list = [...deals];
    if (sortBy === 'highest_value') {
      return list.sort((a, b) => Number(b.value || b.monthlyValue || 0) - Number(a.value || a.monthlyValue || 0));
    }
    if (sortBy === 'lowest_value') {
      return list.sort((a, b) => Number(a.value || a.monthlyValue || 0) - Number(b.value || b.monthlyValue || 0));
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return list;
  }, [deals, sortBy]);

  return (
    <div className="space-y-4">
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Board Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">
            {deals.length} {deals.length === 1 ? 'oportunidad' : 'oportunidades'} en embudo
          </span>
          {sortBy !== 'custom' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#274283] text-[11px] font-bold">
              Filtro activo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#274283]" />
            <span className="hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            >
              <option value="custom">🔀 Orden Personalizado / Manual</option>
              <option value="highest_value">💰 Ticket Más Alto ($)</option>
              <option value="lowest_value">💵 Ticket Más Bajo ($)</option>
              <option value="newest">⏱️ Más Recientes (Último agregado)</option>
              <option value="oldest">⏳ Más Antiguos</option>
            </select>
          </div>

          {/* Compact / Detailed Toggle */}
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isCompact
                ? 'bg-[#274283] text-white border-[#274283] shadow-xs'
                : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
            }`}
            title={isCompact ? 'Expandir tarjetas (Vista Detallada)' : 'Minimizar tarjetas (Vista Compacta)'}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCompact ? 'Vista Detallada' : 'Vista Compacta'}</span>
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex gap-4 overflow-x-auto pb-6 min-h-[650px] items-stretch select-none transition-colors ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: 'auto' }}
        >
          {stages.map((stage) => {
            const stageDeals = sortedDeals.filter((d) => d.stageId === stage.id);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + Number(d.value || d.monthlyValue || 0), 0);

            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                stageDeals={stageDeals}
                totalStageValue={totalStageValue}
                isCompact={isCompact}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCardCard deal={activeDeal} isCompact={isCompact} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function StageColumn({
  stage,
  stageDeals,
  totalStageValue,
  isCompact,
}: {
  stage: Stage;
  stageDeals: Deal[];
  totalStageValue: number;
  isCompact: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 flex flex-col rounded-2xl border overflow-hidden transition-colors ${
        isOver
          ? 'bg-blue-50/80 border-[#5CB2D4] ring-2 ring-[#5CB2D4]/30'
          : 'bg-slate-100/70 border-slate-200/80'
      }`}
    >
      {/* Stage Header */}
      <div
        className={`p-4 border-b flex flex-col justify-between ${
          stage.isWon
            ? 'bg-emerald-50 border-emerald-200'
            : stage.isTerminal
            ? 'bg-slate-200/60 border-slate-300'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-sm text-slate-800 truncate">
            {stage.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/70 text-slate-700">
            {stageDeals.length}
          </span>
        </div>
        <p className="text-xs font-bold text-[#274283] mt-2">
          {formatCurrency(totalStageValue)}
        </p>
      </div>

      {/* Droppable Card Column */}
      <SortableContext
        id={stage.id}
        items={stageDeals.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[400px]">
          {stageDeals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} isCompact={isCompact} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableDealCard({ deal, isCompact }: { deal: Deal; isCompact: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-deal-card="true"
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      <DealCardCard deal={deal} isCompact={isCompact} />
    </div>
  );
}

function DealCardCard({
  deal,
  isCompact = false,
  isOverlay = false,
}: {
  deal: Deal;
  isCompact?: boolean;
  isOverlay?: boolean;
}) {
  const hasOpenTasks = deal.tasks && deal.tasks.some((t) => !t.isCompleted);

  const daysSinceUpdate = deal.updatedAt
    ? Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isCriticalCold = daysSinceUpdate >= 14;
  const isWarningCold = daysSinceUpdate >= 7 && daysSinceUpdate < 14;

  if (isCompact) {
    return (
      <div
        className={`p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#5CB2D4] hover:shadow-sm transition space-y-1 select-none ${
          isCriticalCold
            ? 'border-l-4 border-l-rose-500 bg-rose-50/10'
            : isWarningCold
            ? 'border-l-4 border-l-amber-400 bg-amber-50/10'
            : ''
        } ${isOverlay ? 'shadow-2xl border-[#274283] rotate-1 scale-102 pointer-events-none' : ''}`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <Link
            href={`/deals/${deal.id}`}
            onClick={(e) => {
              if (isOverlay) e.preventDefault();
            }}
            className="font-semibold text-xs text-[#274283] hover:underline truncate flex-1 leading-tight"
          >
            {deal.title}
          </Link>
          <span className="font-extrabold text-xs text-slate-900 flex-shrink-0">
            {formatCurrency(deal.value || deal.monthlyValue)}
          </span>
        </div>

        {deal.company && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
            <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{deal.company.name}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-[#5CB2D4] hover:shadow-md transition space-y-2 select-none ${
        isCriticalCold ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : isWarningCold ? 'border-l-4 border-l-amber-400 bg-amber-50/20' : ''
      } ${isOverlay ? 'shadow-2xl border-[#274283] rotate-2 scale-105 pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/deals/${deal.id}`}
          onClick={(e) => {
            if (isOverlay) e.preventDefault();
          }}
          className="font-semibold text-sm text-[#274283] hover:underline line-clamp-2"
        >
          {deal.title}
        </Link>
        {isCriticalCold && (
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] whitespace-nowrap">
            🔴 {daysSinceUpdate}d
          </span>
        )}
        {isWarningCold && (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] whitespace-nowrap">
            🟡 {daysSinceUpdate}d
          </span>
        )}
      </div>

      <p className="font-display font-extrabold text-base text-slate-900">
        {formatCurrency(deal.value || deal.monthlyValue)}
      </p>

      <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
        {deal.company && (
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{deal.company.name}</span>
          </div>
        )}

        {deal.contact && (
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {deal.contact.firstName} {deal.contact.lastName}
            </span>
          </div>
        )}

        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(deal.expectedCloseDate)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-medium">
        <span>{deal.owner?.name || 'Sin asignar'}</span>
        {hasOpenTasks && (
          <span className="inline-flex items-center gap-1 text-[#EB7638] font-bold">
            <Clock className="w-3 h-3" />
            Tarea Pendiente
          </span>
        )}
      </div>
    </div>
  );
}
