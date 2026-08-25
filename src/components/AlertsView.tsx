import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Gauge, 
  Car, 
  Wrench, 
  Edit, 
  Trash2, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { AlertReminder, Vehicle, AlertStatus } from '../types';
import { calculateAlertStatus, formatDate, formatKm, getCategoryBadgeClass } from '../utils/formatters';

interface AlertsViewProps {
  alerts: AlertReminder[];
  vehicles: Vehicle[];
  onOpenNewAlert: () => void;
  onEditAlert: (alert: AlertReminder) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleCompleteAlert: (alertId: string) => void;
  onConvertAlertToMaintenance: (alert: AlertReminder) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  vehicles,
  onOpenNewAlert,
  onEditAlert,
  onDeleteAlert,
  onToggleCompleteAlert,
  onConvertAlertToMaintenance,
  onSelectVehicle,
}) => {
  const [statusTab, setStatusTab] = useState<string>('active');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calculate status for each alert
  const enhancedAlerts = useMemo(() => {
    return alerts.map(alert => {
      const vehicle = vehicles.find(v => v.id === alert.vehicleId);
      const statusResult = calculateAlertStatus(alert, vehicle);
      return {
        ...alert,
        vehicle,
        statusResult,
      };
    });
  }, [alerts, vehicles]);

  // Status counts
  const counts = useMemo(() => {
    const overdue = enhancedAlerts.filter(a => !a.isCompleted && a.statusResult.status === 'overdue').length;
    const warning = enhancedAlerts.filter(a => !a.isCompleted && a.statusResult.status === 'warning').length;
    const ok = enhancedAlerts.filter(a => !a.isCompleted && a.statusResult.status === 'ok').length;
    const completed = enhancedAlerts.filter(a => a.isCompleted).length;
    const activeTotal = overdue + warning + ok;
    return { overdue, warning, ok, completed, activeTotal };
  }, [enhancedAlerts]);

  // Filtered alerts list
  const filteredAlerts = useMemo(() => {
    return enhancedAlerts.filter(a => {
      if (vehicleFilter !== 'all' && a.vehicleId !== vehicleFilter) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;

      if (statusTab === 'active') return !a.isCompleted;
      if (statusTab === 'overdue') return !a.isCompleted && a.statusResult.status === 'overdue';
      if (statusTab === 'warning') return !a.isCompleted && a.statusResult.status === 'warning';
      if (statusTab === 'ok') return !a.isCompleted && a.statusResult.status === 'ok';
      if (statusTab === 'completed') return a.isCompleted;

      return true;
    }).sort((a, b) => {
      // Sort priority: overdue first, warning second, ok third, completed last
      const priority: Record<string, number> = { overdue: 1, warning: 2, ok: 3, completed: 4 };
      const prioA = a.isCompleted ? 4 : (priority[a.statusResult.status] || 3);
      const prioB = b.isCompleted ? 4 : (priority[b.statusResult.status] || 3);
      return prioA - prioB;
    });
  }, [enhancedAlerts, statusTab, vehicleFilter, categoryFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Agenda & Alertas de Manutenção
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle de revisões periódicas, trocas de óleo, seguros e vencimentos por data e quilometragem.
          </p>
        </div>

        <button
          onClick={onOpenNewAlert}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Alerta</span>
        </button>
      </div>

      {/* KPI Status Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusTab('overdue')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusTab === 'overdue' 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400' 
              : 'bg-white border-gray-200 hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Atrasados / Vencidos</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <span className="text-2xl font-bold text-red-700 mt-2 block">
            {counts.overdue}
          </span>
          <span className="text-xs text-red-600 font-medium">Requer ação urgente</span>
        </div>

        <div 
          onClick={() => setStatusTab('warning')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusTab === 'warning' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' 
              : 'bg-white border-gray-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Próximos</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <span className="text-2xl font-bold text-amber-700 mt-2 block">
            {counts.warning}
          </span>
          <span className="text-xs text-amber-600 font-medium">Nos próx. 15 dias ou 1.000 km</span>
        </div>

        <div 
          onClick={() => setStatusTab('ok')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusTab === 'ok' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' 
              : 'bg-white border-gray-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Em Dia</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-700 mt-2 block">
            {counts.ok}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Com prazos regulares</span>
        </div>

        <div 
          onClick={() => setStatusTab('completed')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusTab === 'completed' 
              ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-400' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Concluídos</p>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-700 mt-2 block">
            {counts.completed}
          </span>
          <span className="text-xs text-gray-400 font-medium">Histórico finalizado</span>
        </div>
      </div>

      {/* Filter Tabs & Vehicle Selector */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === 'active' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pendentes ({counts.activeTotal})
          </button>

          <button
            onClick={() => setStatusTab('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === 'overdue' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Vencidos ({counts.overdue})
          </button>

          <button
            onClick={() => setStatusTab('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === 'warning' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Próximos ({counts.warning})
          </button>

          <button
            onClick={() => setStatusTab('ok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === 'ok' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Em Dia ({counts.ok})
          </button>

          <button
            onClick={() => setStatusTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === 'completed' 
                ? 'bg-gray-800 text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Concluídos ({counts.completed})
          </button>
        </div>

        {/* Vehicle filter dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="text-xs bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todos os Veículos</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Cards List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Nenhum alerta nesta categoria</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Não há lembretes correspondentes aos filtros selecionados.
          </p>
          <button
            onClick={onOpenNewAlert}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Criar Novo Lembrete
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map(item => {
            const { statusResult, vehicle } = item;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 bg-white ${
                  item.isCompleted 
                    ? 'border-gray-200 opacity-60' :
                  statusResult.status === 'overdue' 
                    ? 'border-red-200 shadow-xs ring-1 ring-red-100' :
                  statusResult.status === 'warning'
                    ? 'border-amber-200 shadow-xs ring-1 ring-amber-100'
                    : 'border-gray-200 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        item.isCompleted ? 'bg-gray-100 text-gray-700' :
                        statusResult.status === 'overdue' ? 'bg-red-50 text-red-700 border border-red-200' :
                        statusResult.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {statusResult.label}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditAlert(item)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        title="Editar Alerta"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o alerta "${item.title}"?`)) {
                            onDeleteAlert(item.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Excluir Alerta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h3>

                  {vehicle && (
                    <div 
                      onClick={() => onSelectVehicle(vehicle.id)}
                      className="inline-flex items-center space-x-2 text-xs text-gray-600 font-semibold cursor-pointer hover:text-blue-600"
                    >
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      <span>{vehicle.brand} {vehicle.model}</span>
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">{vehicle.licensePlate}</span>
                      <span className="text-gray-400 font-normal">({formatKm(vehicle.currentKm)})</span>
                    </div>
                  )}
                </div>

                {/* Target Metrics */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-500">Condição do Alerta:</span>
                    <span className="font-bold text-gray-800">{statusResult.details}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-[11px]">
                    {item.targetDate && (
                      <div>
                        <span className="text-gray-400 block">Data Alvo:</span>
                        <span className="font-semibold text-gray-700">{formatDate(item.targetDate)}</span>
                      </div>
                    )}
                    {item.targetKm && (
                      <div>
                        <span className="text-gray-400 block">Quilometragem Alvo:</span>
                        <span className="font-semibold text-gray-700">{formatKm(item.targetKm)}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-gray-600 italic pt-1.5 border-t border-gray-200/60">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                  <button
                    onClick={() => onToggleCompleteAlert(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      item.isCompleted
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.isCompleted ? 'Reabrir Alerta' : 'Marcar Concluído'}</span>
                  </button>

                  {!item.isCompleted && (
                    <button
                      onClick={() => onConvertAlertToMaintenance(item)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      title="Registrar manutenção a partir deste alerta"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Registrar Serviço</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
