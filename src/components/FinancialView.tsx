import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  ArrowUpRight, 
  Car, 
  Wrench, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  ArrowDownRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Vehicle, MaintenanceRecord } from '../types';
import { formatCurrency, formatKm } from '../utils/formatters';

interface FinancialViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceRecord[];
  onSelectVehicle: (vehicleId: string) => void;
}

const CATEGORY_PALETTE = [
  '#2563eb', '#3b82f6', '#10b981', '#f59e0b', 
  '#ef4444', '#8b5cf6', '#06b6d4', '#ea580c', 
  '#64748b', '#ec4899', '#14b8a6', '#f43f5e'
];

const TYPE_COLORS: Record<string, string> = {
  'Preventiva': '#10b981',
  'Corretiva': '#f59e0b',
  'Emergencial': '#ef4444',
  'Documental': '#06b6d4',
  'Estética': '#8b5cf6',
};

export const FinancialView: React.FC<FinancialViewProps> = ({
  vehicles,
  maintenances,
  onSelectVehicle,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'total' | 'costPerKm' | 'count'>('total');

  // Available years from maintenance dates
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    maintenances.forEach(m => {
      const yr = m.date.split('-')[0];
      if (yr) years.add(yr);
    });
    return Array.from(years).sort().reverse();
  }, [maintenances]);

  // Filtered maintenance list for analysis
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(m => {
      if (selectedYear !== 'all' && !m.date.startsWith(selectedYear)) return false;
      if (vehicleFilter !== 'all' && m.vehicleId !== vehicleFilter) return false;
      return true;
    });
  }, [maintenances, selectedYear, vehicleFilter]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalSpent = filteredMaintenances.reduce((sum, m) => sum + m.cost, 0);
    const totalServices = filteredMaintenances.length;
    const avgCostPerVehicle = vehicles.length > 0 ? totalSpent / vehicles.length : 0;
    const avgCostPerService = totalServices > 0 ? totalSpent / totalServices : 0;

    // Total KM driven across filtered vehicles
    const activeVehs = vehicleFilter === 'all' 
      ? vehicles 
      : vehicles.filter(v => v.id === vehicleFilter);

    const totalKmDriven = activeVehs.reduce((acc, v) => acc + Math.max(0, v.currentKm - v.initialKm), 0);
    const generalCostPerKm = totalKmDriven > 0 ? totalSpent / totalKmDriven : 0;

    // Spend by Type (Preventiva vs Corretiva, etc.)
    const typeMap: Record<string, number> = {
      'Preventiva': 0,
      'Corretiva': 0,
      'Emergencial': 0,
      'Documental': 0,
      'Estética': 0,
    };
    filteredMaintenances.forEach(m => {
      typeMap[m.type] = (typeMap[m.type] || 0) + m.cost;
    });

    const typeData = Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    // Spend by Category
    const catMap: Record<string, number> = {};
    filteredMaintenances.forEach(m => {
      catMap[m.category] = (catMap[m.category] || 0) + m.cost;
    });

    const categoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Spend by Vehicle Chart Data
    const vehicleSpendData = vehicles.map(v => {
      const vMaint = filteredMaintenances.filter(m => m.vehicleId === v.id);
      const spent = vMaint.reduce((s, m) => s + m.cost, 0);
      const count = vMaint.length;
      const kmDriven = Math.max(0, v.currentKm - v.initialKm);
      const costPerKm = kmDriven > 0 ? spent / kmDriven : 0;

      return {
        id: v.id,
        name: `${v.brand} ${v.model}`,
        shortName: `${v.model.split(' ')[0]} (${v.licensePlate})`,
        plate: v.licensePlate,
        spent,
        count,
        kmDriven,
        costPerKm,
        vehicle: v,
      };
    }).sort((a, b) => b.spent - a.spent);

    const topSpender = vehicleSpendData[0];

    // Monthly Evolution Data
    const monthMap: Record<string, number> = {};
    filteredMaintenances.forEach(m => {
      const ym = m.date.slice(0, 7); // YYYY-MM
      monthMap[ym] = (monthMap[ym] || 0) + m.cost;
    });

    const monthlyTimeline = Object.entries(monthMap)
      .map(([ym, total]) => {
        const [year, month] = ym.split('-');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const label = `${monthNames[parseInt(month, 10) - 1]}/${year.slice(-2)}`;
        return { ym, label, total };
      })
      .sort((a, b) => a.ym.localeCompare(b.ym));

    return {
      totalSpent,
      totalServices,
      avgCostPerVehicle,
      avgCostPerService,
      totalKmDriven,
      generalCostPerKm,
      typeData,
      categoryData,
      vehicleSpendData,
      topSpender,
      monthlyTimeline,
    };
  }, [filteredMaintenances, vehicles, vehicleFilter]);

  // Sorted Comparison Matrix
  const sortedComparison = useMemo(() => {
    return [...metrics.vehicleSpendData].sort((a, b) => {
      if (sortBy === 'total') return b.spent - a.spent;
      if (sortBy === 'costPerKm') return b.costPerKm - a.costPerKm;
      if (sortBy === 'count') return b.count - a.count;
      return 0;
    });
  }, [metrics.vehicleSpendData, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Painel Financeiro & Indicadores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Análise de custos operacionais, comparativos entre veículos e rentabilidade por quilômetro rodado.
          </p>
        </div>

        {/* Top Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todo o Histórico</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>Ano {yr}</option>
            ))}
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Toda a Frota ({vehicles.length} veículos)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Investimento Total</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 mt-2 block">
            {formatCurrency(metrics.totalSpent)}
          </span>
          <span className="text-xs text-gray-400 mt-1 block">
            {metrics.totalServices} serviços realizados no período
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custo Médio / KM</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-bold text-blue-600 mt-2 block">
            {formatCurrency(metrics.generalCostPerKm)}/km
          </span>
          <span className="text-xs text-gray-400 mt-1 block">
            Total rodado: {formatKm(metrics.totalKmDriven)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custo Médio / Veículo</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 mt-2 block">
            {formatCurrency(metrics.avgCostPerVehicle)}
          </span>
          <span className="text-xs text-gray-400 mt-1 block">
            Média por visita: {formatCurrency(metrics.avgCostPerService)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Maior Despesa</p>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-gray-900 truncate block">
              {metrics.topSpender ? metrics.topSpender.name : 'N/A'}
            </span>
            <span className="text-xl font-bold text-red-600">
              {metrics.topSpender ? formatCurrency(metrics.topSpender.spent) : 'R$ 0'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Monthly Evolution + Spend by Nature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Timeline Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Evolução dos Custos de Manutenção</h3>
            <p className="text-xs text-gray-500">Histórico cronológico de despesas com serviços e peças</p>
          </div>

          <div className="h-64 w-full">
            {metrics.monthlyTimeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Nenhum dado registrado para o período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpentFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#e5e7eb' }} 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(val) => `R$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Despesa']}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpentFin)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spend by Nature / Type (Preventiva x Corretiva) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Tipo de Manutenção</h3>
            <p className="text-xs text-gray-500 mb-4">Distribuição: Preventiva vs Corretiva vs Emergencial</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {metrics.typeData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={TYPE_COLORS[entry.name] || '#9ca3af'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Total']}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Type stats */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            {metrics.typeData.map(t => {
              const percent = metrics.totalSpent > 0 ? Math.round((t.value / metrics.totalSpent) * 100) : 0;
              return (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[t.name] || '#9ca3af' }} />
                    <span className="font-semibold text-gray-700">{t.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{formatCurrency(t.value)}</span>
                    <span className="text-[10px] text-gray-400 w-7 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Spend by Vehicle & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Vehicle (Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Comparativo de Custos por Veículo</h3>
            <p className="text-xs text-gray-500">Volume financeiro total investido em cada automóvel</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={metrics.vehicleSpendData} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis 
                  type="number" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(val) => `R$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="shortName" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: '600' }}
                />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Gasto Total']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="spent" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Category Table & Visual */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Gastos por Categoria de Serviço</h3>
            <p className="text-xs text-gray-500">Divisão percentual das despesas por área da manutenção</p>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {metrics.categoryData.map((cat, idx) => {
              const percent = metrics.totalSpent > 0 ? (cat.value / metrics.totalSpent) * 100 : 0;
              const color = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
              return (
                <div key={cat.name} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-bold text-gray-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{formatCurrency(cat.value)}</span>
                      <span className="text-[11px] font-semibold text-gray-500 w-10 text-right">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Vehicle Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Matriz Comparativa da Frota</h3>
            <p className="text-xs text-gray-500">
              Comparativo direto de custos, KM rodada e índice de custo por quilômetro
            </p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500 font-semibold">Ordenar por:</span>
            <button
              onClick={() => setSortBy('total')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                sortBy === 'total' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gasto Total
            </button>
            <button
              onClick={() => setSortBy('costPerKm')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                sortBy === 'costPerKm' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Custo / KM
            </button>
            <button
              onClick={() => setSortBy('count')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                sortBy === 'count' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nº Serviços
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Veículo</th>
                <th className="py-3 px-3">Placa</th>
                <th className="py-3 px-3">Odômetro</th>
                <th className="py-3 px-3">KM Rodado</th>
                <th className="py-3 px-3">Serviços</th>
                <th className="py-3 px-3">Gasto Total</th>
                <th className="py-3 px-3">Custo / KM</th>
                <th className="py-3 px-3">% da Frota</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedComparison.map(({ vehicle, spent, count, kmDriven, costPerKm }) => {
                const percentFleet = metrics.totalSpent > 0 ? (spent / metrics.totalSpent) * 100 : 0;
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <div 
                        onClick={() => onSelectVehicle(vehicle.id)}
                        className="cursor-pointer group flex items-center space-x-2"
                      >
                        <span className="font-bold text-gray-900 group-hover:text-blue-600">
                          {vehicle.brand} {vehicle.model}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                        {vehicle.licensePlate}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-700">
                      {formatKm(vehicle.currentKm)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {formatKm(kmDriven)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-800">
                      {count} {count === 1 ? 'visita' : 'visitas'}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {formatCurrency(spent)}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-600">
                      {formatCurrency(costPerKm)}/km
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${percentFleet}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600">
                          {percentFleet.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectVehicle(vehicle.id)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
