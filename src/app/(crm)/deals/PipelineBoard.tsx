'use client';

import { useState, useRef } from 'react';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatCurrency, formatDate } from '@/lib/utils/normalization';
import { moveDealStageAction } from './actions';
import { AlertCircle, Calendar, Building2, User, Clock } from 'lucide-react';

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
  stageId: string;
  ownerId: string;
  expectedCloseDate?: string | Date | null;
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

export default function PipelineBoard({ stages, initialDeals, userRole }: PipelineBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Drag-to-scroll container state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only primary (left) button
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    // Check if clicked inside a deal card or interactive element
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

    // Determine target stage ID
    let targetStageId = overId;
    const isOverDealCard = deals.some((d) => d.id === overId);

    if (isOverDealCard) {
      const overDeal = deals.find((d) => d.id === overId);
      if (overDeal) targetStageId = overDeal.stageId;
    }

    const currentDeal = deals.find((d) => d.id === activeId);
    if (!currentDeal || currentDeal.stageId === targetStageId) return;

    // Optimistic UI update
    const previousStageId = currentDeal.stageId;
    setDeals((prev) =>
      prev.map((d) => (d.id === activeId ? { ...d, stageId: targetStageId } : d))
    );

    // Server Action Invocation
    const result = await moveDealStageAction(activeId, targetStageId);
    if (!result.success) {
      // Rollback on failure
      setDeals((prev) =>
        prev.map((d) => (d.id === activeId ? { ...d, stageId: previousStageId } : d))
      );
      setErrorNotice(result.error || 'Error al cambiar la etapa de la oportunidad.');
      setTimeout(() => setErrorNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

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
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                stageDeals={stageDeals}
                totalStageValue={totalStageValue}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCardCard deal={activeDeal} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function StageColumn({
  stage,
  stageDeals,
  totalStageValue,
}: {
  stage: Stage;
  stageDeals: Deal[];
  totalStageValue: number;
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
            <SortableDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableDealCard({ deal }: { deal: Deal }) {
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
      <DealCardCard deal={deal} />
    </div>
  );
}

function DealCardCard({ deal, isOverlay = false }: { deal: Deal; isOverlay?: boolean }) {
  const hasOpenTasks = deal.tasks && deal.tasks.some((t) => !t.isCompleted);

  const daysSinceUpdate = deal.updatedAt
    ? Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isCriticalCold = daysSinceUpdate >= 14;
  const isWarningCold = daysSinceUpdate >= 7 && daysSinceUpdate < 14;

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
            // Prevent navigating if dragged
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
        {formatCurrency(deal.value)}
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
