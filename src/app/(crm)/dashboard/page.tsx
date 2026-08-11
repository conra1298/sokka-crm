import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getDashboardMetrics } from '@/lib/services/dashboard.service';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import Badge from '@/components/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/normalization';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Kanban,
  UserPlus,
  PlusCircle,
  Clock,
  Award,
  Flame,
  Snowflake,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch complete Dashboard metrics for Marketing Agency
  const metrics = await getDashboardMetrics(user);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Panel Comercial Sokka"
        subtitle={`Hola ${user.name}. Resumen estratégico del embudo y facturación recurrente en ARS.`}
      >
        <Link href="/deals?action=new" className="btn-primary flex items-center gap-2 text-sm shadow-sm">
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Oportunidad</span>
        </Link>
        <Link href="/contacts?action=new" className="btn-secondary flex items-center gap-2 text-sm">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Contacto</span>
        </Link>
      </PageHeader>

      {/* Top 4 Key Performance Indicators (KPIs) in ARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="MRR Activo (Retainers)"
          value={`${formatCurrency(metrics.mrrActive)}/mes`}
          subtitle="Facturación mensual recurrente"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="#274283"
        />
        <MetricCard
          title="Ingresos Ganados (Mes)"
          value={formatCurrency(metrics.monthlyRevenueWon)}
          subtitle={`${metrics.wonDealsCount} oportunidad(es) ganada(s)`}
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="#10B981"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${metrics.conversionRate}%`}
          subtitle={`De ${metrics.totalDealsCount} oportunidades totales`}
          icon={<Award className="w-5 h-5" />}
          highlightColor="#EDA143"
        />
        <MetricCard
          title="Alertas de Negocios Fríos"
          value={metrics.coldDealsCount}
          subtitle={metrics.coldDealsCount > 0 ? 'Oportunidades sin actividad > 7d' : '¡Pipeline al día!'}
          icon={<Snowflake className="w-5 h-5" />}
          highlightColor={metrics.coldDealsCount > 0 ? '#EB7638' : '#5CB2D4'}
        />
      </div>

      {/* Charts Section: Deals by Stage & Leads by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deals by Pipeline Stage (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#274283]" />
              <span>Oportunidades por Etapa del Embudo</span>
            </h2>
            <Link href="/deals" className="text-xs font-semibold text-[#5CB2D4] hover:underline">
              Ver Embudo →
            </Link>
          </div>
          <BarChart
            data={metrics.dealsByStage.map((s) => ({
              label: s.stageName,
              value: s.totalValue,
              count: s.count,
              color: s.color,
            }))}
          />
        </div>

        {/* Leads by Source (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#EDA143]" />
              <span>Origen de Leads</span>
            </h2>
          </div>
          <PieChart data={metrics.leadsBySource} />
        </div>
      </div>

      {/* Cold Deals Warning & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cold Deals Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-[#EB7638]" />
              <span>Oportunidades Frías (Sin actividad reciente)</span>
            </h2>
            <span className="text-xs text-slate-400">🟡 7+ días | 🔴 14+ días</span>
          </div>

          {metrics.coldDeals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-50 rounded-2xl">
              🎉 ¡Excelente! No hay oportunidades frías sin atención en el embudo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-2">Oportunidad</th>
                    <th className="pb-2">Etapa</th>
                    <th className="pb-2">Vendedor</th>
                    <th className="pb-2 text-right">Inactividad</th>
                    <th className="pb-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.coldDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pr-2 font-semibold text-slate-800">
                        <Link href={`/deals/${deal.id}`} className="hover:text-[#274283] hover:underline">
                          {deal.title}
                        </Link>
                        {deal.companyName && (
                          <p className="text-[11px] font-normal text-slate-500">{deal.companyName}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-600 font-medium">{deal.stageName}</td>
                      <td className="py-2.5 pr-2 text-slate-600">{deal.ownerName}</td>
                      <td className="py-2.5 pr-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            deal.status === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {deal.status === 'critical' ? '🔴' : '🟡'} {deal.daysInactive} días
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white font-semibold transition"
                        >
                          Reactivar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Sellers Leaderboard (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600" />
              <span>Ranking Comercial del Mes</span>
            </h2>
          </div>

          {metrics.topSellers.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Aún no hay ventas cerradas este mes.</p>
          ) : (
            <div className="space-y-3">
              {metrics.topSellers.map((seller, idx) => (
                <div
                  key={seller.sellerId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-700/20 text-amber-900'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{seller.sellerName}</p>
                      <p className="text-[11px] text-slate-500">{seller.wonCount} negocio(s) ganado(s)</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-emerald-700 font-mono">
                    {formatCurrency(seller.totalWonValue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
