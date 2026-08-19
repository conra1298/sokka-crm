'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils/normalization';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface FinancesDashboardProps {
  transactions: any[];
  categories: any[];
  companies: any[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DEFAULT_COLORS = ['#274283', '#5CB2D4', '#EDA143', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#F59E0B'];

export default function FinancesDashboard({
  transactions,
  categories,
  companies,
}: FinancesDashboardProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // Available years from data or current
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear]);
    transactions.forEach((t) => {
      if (t.periodYear) years.add(t.periodYear);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Annual Totals
  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => (t.periodYear || new Date(t.createdAt).getFullYear()) === selectedYear);
  }, [transactions, selectedYear]);

  const yearIncomesPaid = useMemo(() => {
    return yearTransactions
      .filter((t) => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [yearTransactions]);

  const yearExpenses = useMemo(() => {
    return yearTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [yearTransactions]);

  const yearNetProfit = yearIncomesPaid - yearExpenses;

  // Monthly Cash Flow data for BarChart
  const cashFlowData = useMemo(() => {
    return SHORT_MONTHS.map((name, index) => {
      const monthNum = index + 1;
      const monthTxs = yearTransactions.filter((t) => t.periodMonth === monthNum);

      const incomePaid = monthTxs
        .filter((t) => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const incomePending = monthTxs
        .filter((t) => t.type === 'income' && t.status === 'pending')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expense = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const net = incomePaid - expense;

      return {
        name,
        monthNum,
        'Ingresos Cobrados': incomePaid,
        'Ingresos Pendientes': incomePending,
        Egresos: expense,
        Margen: net,
      };
    });
  }, [yearTransactions]);

  // Month Collection Status Data
  const monthCollectionStats = useMemo(() => {
    const monthTxs = transactions.filter(
      (t) =>
        t.type === 'income' &&
        t.periodMonth === selectedMonth &&
        (t.periodYear || currentYear) === selectedYear
    );

    const paid = monthTxs
      .filter((t) => t.status === 'paid')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pending = monthTxs
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const total = paid + pending;
    const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;
    const percentPending = total > 0 ? Math.round((pending / total) * 100) : 0;

    return {
      total,
      paid,
      pending,
      percentPaid,
      percentPending,
      count: monthTxs.length,
      paidCount: monthTxs.filter((t) => t.status === 'paid').length,
      pendingCount: monthTxs.filter((t) => t.status === 'pending').length,
    };
  }, [transactions, selectedMonth, selectedYear, currentYear]);

  // Expense Distribution by Category
  const expenseCategoryData = useMemo(() => {
    const expenses = yearTransactions.filter((t) => t.type === 'expense');
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};

    expenses.forEach((t) => {
      const catId = t.categoryId || 'uncategorized';
      const cat = categories.find((c) => c.id === catId);
      const catName = cat ? cat.name : 'Sin Categoría';
      const catColor = cat?.color || '#94A3B8';

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          name: catName,
          value: 0,
          color: catColor,
        };
      }
      categoryTotals[catId].value += t.amount || 0;
    });

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [yearTransactions, categories]);

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar className="h-4 w-4 text-sokka-blue" />
          <span>Filtros del Resumen:</span>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="mr-2 text-xs font-medium text-gray-500">Año:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:border-sokka-blue focus:outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-2 text-xs font-medium text-gray-500">Mes para Cobranzas:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:border-sokka-blue focus:outline-none"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ingresos Cobrados ({selectedYear})
            </p>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(yearIncomesPaid)}</p>
          <p className="mt-1 text-xs text-gray-400">Total acumulado en el año</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Gastos Totales ({selectedYear})
            </p>
            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(yearExpenses)}</p>
          <p className="mt-1 text-xs text-gray-400">Egresos registrados</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Margen Neto ({selectedYear})
            </p>
            <div className="rounded-lg bg-blue-50 p-2 text-sokka-blue">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold ${
              yearNetProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(yearNetProfit)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {yearIncomesPaid > 0
              ? `${Math.round((yearNetProfit / yearIncomesPaid) * 100)}% margen operativo`
              : 'Sin ingresos'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pendiente ({MONTH_NAMES[selectedMonth - 1]})
            </p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600">
            {formatCurrency(monthCollectionStats.pending)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {monthCollectionStats.pendingCount} clientes por cobrar
          </p>
        </div>
      </div>

      {/* Chart 1: Cashflow (Ingresos vs Egresos) */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Flujo de Caja Anual ({selectedYear})
            </h3>
            <p className="text-xs text-gray-500">
              Comparativa mensual entre dinero cobrado y gastos realizados
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />
              <Bar dataKey="Ingresos Cobrados" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ingresos Pendientes" fill="#FBBF24" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Egresos" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row with 2 Columns: Estado de Cobranzas + Distribución de Gastos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 2: Estado de Cobranzas del Mes */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Estado de Cobranzas: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </h3>
                <p className="text-xs text-gray-500">
                  Rendimiento y cobranza de retainers activos en este período
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="text-gray-700">Progreso de Cobro</span>
                <span className="font-bold text-gray-900">{monthCollectionStats.percentPaid}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100 flex">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${monthCollectionStats.percentPaid}%` }}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${monthCollectionStats.percentPending}%` }}
                />
              </div>
            </div>

            {/* Metrics breakdown */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-green-50/60 border border-green-100 p-4">
                <div className="flex items-center gap-2 text-green-700 text-xs font-semibold uppercase">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cobrado</span>
                </div>
                <p className="mt-2 text-xl font-bold text-green-700">
                  {formatCurrency(monthCollectionStats.paid)}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {monthCollectionStats.paidCount} de {monthCollectionStats.count} cobros
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase">
                  <AlertCircle className="h-4 w-4" />
                  <span>Pendiente</span>
                </div>
                <p className="mt-2 text-xl font-bold text-amber-700">
                  {formatCurrency(monthCollectionStats.pending)}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {monthCollectionStats.pendingCount} pendientes
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Facturación Proyectada del Mes:</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(monthCollectionStats.total)}
            </span>
          </div>
        </div>

        {/* Chart 3: Distribución de Gastos por Etiqueta */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Distribución de Gastos ({selectedYear})
            </h3>
            <p className="text-xs text-gray-500">
              Desglose de egresos por etiquetas/categorías
            </p>

            {expenseCategoryData.length > 0 ? (
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      formatter={(value, entry: any) => (
                        <span className="text-xs font-medium text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-500">
                  No hay gastos registrados en {selectedYear}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Carga gastos con etiquetas para ver la distribución
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Gasto Total Acumulado:</span>
            <span className="font-bold text-gray-900">{formatCurrency(yearExpenses)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
