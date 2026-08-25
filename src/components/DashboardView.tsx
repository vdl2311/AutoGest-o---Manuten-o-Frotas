import React, { useMemo } from 'react';
import { 
  Car, 
  Wrench, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Gauge,
  FileCheck2,
  ChevronRight
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
  Legend
} from 'recharts';
import { Vehicle, MaintenanceRecord, AlertReminder, AppTab } from '../types';
import { formatCurrency, formatKm, formatDate, calculateAlertStatus, getCategoryBadgeClass } from '../utils/formatters';

interface DashboardViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceRecord[];
  alerts: AlertReminder[];
  setCurrentTab: (tab: AppTab) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onOpenNewMaintenance: () => void;
  onOpenNewVehicle: () => void;
  onOpenNewAlert: () => void;
  onOpenQuickKm: () => void;
  onToggleCompleteAlert: (alertId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Troca de Óleo': '#f59e0b',
  'Revisão': '#3b82f6',
  'Pneus': '#64748b',
  'Freios': '#f43f5e',
  'Suspensão': '#a855f7',
  'Motor': '#ea580c',
  'Elétrica': '#eab308',
  'Reparos / Funilaria': '#ef4444',
  'Documentação / IPVA': '#10b981',
  'Ar-condicionado': '#06b6d4',
  'Bateria': '#6366f1',
  'Outros': '#94a3b8',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  maintenances,
  alerts,
  setCurrentTab,
  onSelectVehicle,
  onOpenNewMaintenance,
  onOpenNewVehicle,
  onOpenNewAlert,
  onOpenQuickKm,
  onToggleCompleteAlert,
}) => {
  // Statistics Calculations
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'Ativo').length;
    const inMaintenanceVehicles = vehicles.filter(v => v.status === 'Em Manutenção').length;

    const totalSpent = maintenances.reduce((acc, m) => acc + m.cost, 0);

    // Current Month & Previous Month spent
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthSpent = maintenances
      .filter(m => m.date.startsWith(currentMonthStr))
      .reduce((acc, m) => acc + m.cost, 0);

    const prevMonthSpent = maintenances
      .filter(m => m.date.startsWith(prevMonthStr))
      .reduce((acc, m) => acc + m.cost, 0);

    // Month over Month diff percentage
    let monthDiffPercent = 0;
    if (prevMonthSpent > 0) {
      monthDiffPercent = Math.round(((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100);
    }

    // Urgent Alerts (overdue or warning)
    const alertStatuses = alerts.map(alert => {
      const vehicle = vehicles.find(v => v.id === alert.vehicleId);
      return {
        alert,
        vehicle,
        statusResult: calculateAlertStatus(alert, vehicle),
      };
    });

    const overdueAlerts = alertStatuses.filter(a => !a.alert.isCompleted && a.statusResult.status === 'overdue');
    const warningAlerts = alertStatuses.filter(a => !a.alert.isCompleted && a.statusResult.status === 'warning');
    const urgentCount = overdueAlerts.length + warningAlerts.length;

    // Monthly Evolution Data (Last 6 Months)
    const monthlyData: { month: string; total: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const label = `${monthNames[d.getMonth()]}/${String(year).slice(-2)}`;

      const totalForMonth = maintenances
        .filter(m => m.date.startsWith(key))
        .reduce((sum, m) => sum + m.cost, 0);

      monthlyData.push({
        month: key,
        label,
        total: totalForMonth,
      });
    }

    // Category Distribution Data
    const categoryMap: Record<string, number> = {};
    maintenances.forEach(m => {
      categoryMap[m.category] = (categoryMap[m.category] || 0) + m.cost;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Vehicle Top Spenders Ranking
    const vehicleSpendMap: Record<string, { vehicle: Vehicle; totalCost: number; serviceCount: number }> = {};
    vehicles.forEach(v => {
      vehicleSpendMap[v.id] = { vehicle: v, totalCost: 0, serviceCount: 0 };
    });

    maintenances.forEach(m => {
      if (vehicleSpendMap[m.vehicleId]) {
        vehicleSpendMap[m.vehicleId].totalCost += m.cost;
        vehicleSpendMap[m.vehicleId].serviceCount += 1;
      }
    });

    const topVehicles = Object.values(vehicleSpendMap)
      .sort((a, b) => b.totalCost - a.totalCost);

    return {
      totalVehicles,
      activeVehicles,
      inMaintenanceVehicles,
      totalSpent,
      currentMonthSpent,
      prevMonthSpent,
      monthDiffPercent,
      overdueAlerts,
      warningAlerts,
      urgentCount,
      monthlyData,
      categoryData,
      topVehicles,
      recentMaintenances: [...maintenances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    };
  }, [vehicles, maintenances, alerts]);

  return (
    <div className="space-y-8">
      {/* Top Header / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard Geral
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão consolidada da frota, custos de manutenção e alertas preventivos.
          </p>
        </div>

        {/* Quick Actions Cluster */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewMaintenance}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Serviço</span>
          </button>

          <button
            onClick={onOpenNewVehicle}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Veículo</span>
          </button>

          <button
            onClick={onOpenQuickKm}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm border border-gray-300 shadow-xs active:scale-95 transition-all"
          >
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>Atualizar KM</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Veículos */}
        <div 
          onClick={() => setCurrentTab('vehicles')}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frota Total</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</span>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mb-1">
              {stats.activeVehicles} ativos
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{stats.inMaintenanceVehicles > 0 ? `${stats.inMaintenanceVehicles} em manutenção` : '100% disponíveis'}</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Ver frota <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Gasto Total Acumulado */}
        <div 
          onClick={() => setCurrentTab('financial')}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gasto Total Acumulado</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{maintenances.length} manutenções</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              BI Financeiro <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Gasto do Mês Atual */}
        <div 
          onClick={() => setCurrentTab('financial')}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gastos Este Mês</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(stats.currentMonthSpent)}</span>
            {stats.prevMonthSpent > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded mb-1 ${
                stats.monthDiffPercent <= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
              }`}>
                {stats.monthDiffPercent > 0 ? `+${stats.monthDiffPercent}%` : `${stats.monthDiffPercent}%`}
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Mês anterior: {formatCurrency(stats.prevMonthSpent)}</span>
            <span className="text-blue-600 font-semibold flex items-center">Ver extrato</span>
          </div>
        </div>

        {/* Alertas Críticos */}
        <div 
          onClick={() => setCurrentTab('alerts')}
          className={`p-6 rounded-2xl border shadow-xs hover:shadow-sm transition-all cursor-pointer group ${
            stats.urgentCount > 0 
              ? 'bg-white border-gray-200 border-l-4 border-l-red-500' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-bold uppercase tracking-wider ${stats.urgentCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
              Alertas & Prazos
            </p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              stats.urgentCount > 0 
                ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className={`text-3xl font-bold ${stats.urgentCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {String(stats.urgentCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-500 mb-1">pendências</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-red-600 font-semibold">{stats.overdueAlerts.length} Vencidos</span>
            <span className="text-orange-600 font-semibold">{stats.warningAlerts.length} Próximos</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Next Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Monthly Cost Evolution + Recent Maintenances */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Evolution Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Evolução de Custos</h2>
                <p className="text-xs text-gray-500">Histórico mensal de investimentos em manutenção</p>
              </div>
              <button 
                onClick={() => setCurrentTab('financial')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                Relatório Completo <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#e5e7eb' }} 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(val) => `R$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Total Gasto']}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Maintenances Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Últimos Serviços Realizados</h2>
                <p className="text-xs text-gray-500">Histórico cronológico recente de serviços e peças</p>
              </div>
              <button 
                onClick={() => setCurrentTab('maintenances')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                Ver Todas ({maintenances.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Veículo</th>
                    <th className="px-6 py-3.5">Serviço / Categoria</th>
                    <th className="px-6 py-3.5">Data & KM</th>
                    <th className="px-6 py-3.5">Oficina</th>
                    <th className="px-6 py-3.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {stats.recentMaintenances.map((m) => {
                    const vehicle = vehicles.find(v => v.id === m.vehicleId);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div 
                            onClick={() => vehicle && onSelectVehicle(vehicle.id)}
                            className="cursor-pointer group flex items-center gap-3"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase shrink-0">
                              <Car className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo'}
                              </p>
                              {vehicle && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {vehicle.licensePlate} • {vehicle.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryBadgeClass(m.category)}`}>
                            {m.category}
                          </span>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                            {m.description}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 text-gray-600 text-xs">
                          <p className="font-medium text-gray-800">{formatDate(m.date)}</p>
                          <p className="text-gray-400 font-mono">{formatKm(m.kmAtService)}</p>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-600 max-w-[140px] truncate">
                          {m.workshop}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-gray-900">
                          {formatCurrency(m.cost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Urgent Alerts & Top Spenders */}
        <div className="space-y-8">
          {/* Important Alerts Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-lg">Próximos Alertas</h2>
              <button 
                onClick={() => setCurrentTab('alerts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Ver todos
              </button>
            </div>

            {stats.urgentCount === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Tudo em dia!</p>
                  <p className="text-emerald-700">Nenhum serviço vencido ou próximo do prazo no momento.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {[...stats.overdueAlerts, ...stats.warningAlerts].slice(0, 4).map(({ alert, vehicle, statusResult }) => (
                  <div 
                    key={alert.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border ${
                      statusResult.status === 'overdue'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-orange-50 border-orange-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      statusResult.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {alert.title}
                      </p>
                      {vehicle && (
                        <p className={`text-xs font-medium ${statusResult.status === 'overdue' ? 'text-red-700' : 'text-orange-700'}`}>
                          {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                        </p>
                      )}
                      <p className={`text-[10px] uppercase font-bold mt-1 ${
                        statusResult.status === 'overdue' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {statusResult.details || statusResult.label}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleCompleteAlert(alert.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 border border-gray-200 shadow-2xs transition-colors shrink-0"
                      title="Marcar como realizado"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-1">Gastos por Categoria</h2>
            <p className="text-xs text-gray-500 mb-4">Distribuição das despesas por tipo de manutenção</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Gasto']}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Categories Mini List */}
            <div className="mt-2 space-y-2">
              {stats.categoryData.slice(0, 4).map((cat) => {
                const percent = stats.totalSpent > 0 ? Math.round((cat.value / stats.totalSpent) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#94a3b8' }} 
                      />
                      <span className="text-gray-700 font-medium truncate max-w-[130px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{formatCurrency(cat.value)}</span>
                      <span className="text-[10px] text-gray-400 w-7 text-right font-mono">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Vehicles by Spend */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-1">Top Gastos por Veículo</h2>
            <p className="text-xs text-gray-500 mb-4">Veículos com maior custo acumulado</p>

            <div className="space-y-3">
              {stats.topVehicles.slice(0, 3).map(({ vehicle, totalCost, serviceCount }, idx) => {
                const percent = stats.totalSpent > 0 ? Math.round((totalCost / stats.totalSpent) * 100) : 0;
                return (
                  <div 
                    key={vehicle.id}
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className="p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-gray-900">{vehicle.brand} {vehicle.model}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
                      <span>{serviceCount} manutenções</span>
                      <span>{percent}% do custo total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
