import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Gauge, 
  Wrench, 
  DollarSign, 
  MoreVertical, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Fuel, 
  LayoutGrid, 
  List,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, AlertReminder, VehicleStatus, VehicleCategory } from '../types';
import { formatCurrency, formatKm, formatDate, calculateAlertStatus } from '../utils/formatters';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceRecord[];
  alerts: AlertReminder[];
  onSelectVehicle: (vehicleId: string) => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onOpenNewVehicle: () => void;
  onOpenNewMaintenanceForVehicle: (vehicleId: string) => void;
  onOpenQuickKmForVehicle: (vehicleId: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  maintenances,
  alerts,
  onSelectVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onOpenNewVehicle,
  onOpenNewMaintenanceForVehicle,
  onOpenQuickKmForVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered vehicles list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = 
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.chassi && v.chassi.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || v.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [vehicles, searchTerm, statusFilter, categoryFilter]);

  // Statistics per vehicle helper
  const getVehicleStats = (vehicleId: string) => {
    const vehicleMaint = maintenances.filter(m => m.vehicleId === vehicleId);
    const totalSpent = vehicleMaint.reduce((sum, m) => sum + m.cost, 0);
    const count = vehicleMaint.length;

    const vehicleAlerts = alerts.filter(a => a.vehicleId === vehicleId && !a.isCompleted);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const urgentAlerts = vehicleAlerts.filter(a => {
      const res = calculateAlertStatus(a, vehicle);
      return res.status === 'overdue' || res.status === 'warning';
    }).length;

    return { totalSpent, count, urgentAlerts };
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Em Manutenção':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Inativo':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestão da Frota de Veículos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre, monitore quilometragem, histórico de serviços e alertas individuais de cada veículo.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicle}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo, marca, placa ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Em Manutenção">Em Manutenção</option>
            <option value="Inativo">Inativos</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Todas Categorias</option>
            <option value="Passeio / Sedan">Passeio / Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Picape">Picape</option>
            <option value="Hatch">Hatch</option>
            <option value="Moto">Moto</option>
            <option value="Van">Van</option>
            <option value="Caminhão">Caminhão</option>
            <option value="Elétrico / Híbrido">Elétrico / Híbrido</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em Lista/Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid / Table */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Nenhum veículo encontrado</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            Nenhum veículo corresponde aos filtros selecionados ou à busca informada.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Limpar Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const { totalSpent, count, urgentAlerts } = getVehicleStats(vehicle.id);

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col group"
              >
                {/* Photo & Status Badge */}
                <div className="relative h-44 w-full bg-gray-900 overflow-hidden">
                  <img
                    src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80'}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/30" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${getStatusBadge(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900/70 text-white backdrop-blur-xs border border-white/20">
                      {vehicle.category}
                    </span>
                  </div>

                  {/* Urgent Alerts Flag */}
                  {urgentAlerts > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center space-x-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{urgentAlerts} {urgentAlerts === 1 ? 'Alerta' : 'Alertas'}</span>
                    </div>
                  )}

                  {/* Mercosul Plate on image bottom right */}
                  <div className="absolute bottom-3 right-3 bg-white rounded border border-gray-300 shadow-sm px-2 py-0.5 font-mono text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2 bg-blue-700 rounded-2xs inline-block"></span>
                    <span className="tracking-wider">{vehicle.licensePlate}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-medium text-gray-300">{vehicle.brand}</span>
                    <h3 className="text-base font-bold leading-tight truncate max-w-[200px]">{vehicle.model}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Key specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] block font-medium">Odômetro Atual</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-bold text-gray-900">{formatKm(vehicle.currentKm)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenQuickKmForVehicle(vehicle.id); }}
                          className="text-blue-600 hover:text-blue-800 p-0.5 rounded"
                          title="Atualizar KM"
                        >
                          <Gauge className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] block font-medium">Ano / Combustível</span>
                      <span className="font-bold text-gray-900 truncate block mt-0.5">
                        {vehicle.yearManufacture}/{vehicle.yearModel}
                      </span>
                    </div>
                  </div>

                  {/* Financial Stats for this car */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-medium">Total em Manutenções</span>
                      <span className="text-sm font-extrabold text-gray-900">{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[10px] block font-medium">Histórico</span>
                      <span className="text-xs font-semibold text-gray-700">{count} {count === 1 ? 'serviço' : 'serviços'}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectVehicle(vehicle.id)}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>Ver Ficha</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenNewMaintenanceForVehicle(vehicle.id)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                      title="Registrar Nova Manutenção neste veículo"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditVehicle(vehicle)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors"
                      title="Editar Cadastro"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o veículo ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})?`)) {
                          onDeleteVehicle(vehicle.id);
                        }
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs transition-colors"
                      title="Excluir Veículo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Veículo</th>
                  <th className="py-3.5 px-4">Placa & Cor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Odômetro (KM)</th>
                  <th className="py-3.5 px-4">Total Gasto</th>
                  <th className="py-3.5 px-4">Serviços</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => {
                  const { totalSpent, count, urgentAlerts } = getVehicleStats(vehicle.id);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div 
                          onClick={() => onSelectVehicle(vehicle.id)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <img
                            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80'}
                            alt={vehicle.model}
                            className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-blue-600 block">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {vehicle.yearManufacture}/{vehicle.yearModel} • {vehicle.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-xs">
                          {vehicle.licensePlate}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">{vehicle.color}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-gray-800">{formatKm(vehicle.currentKm)}</span>
                          <button
                            onClick={() => onOpenQuickKmForVehicle(vehicle.id)}
                            className="text-blue-600 hover:text-blue-800 p-0.5"
                            title="Atualizar KM"
                          >
                            <Gauge className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="font-medium">{count} serviços</span>
                        {urgentAlerts > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded">
                            {urgentAlerts} alert.
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectVehicle(vehicle.id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded text-xs hover:bg-blue-100"
                          >
                            Ver Ficha
                          </button>
                          <button
                            onClick={() => onOpenNewMaintenanceForVehicle(vehicle.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Nova Manutenção"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditVehicle(vehicle)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja excluir ${vehicle.brand} ${vehicle.model}?`)) {
                                onDeleteVehicle(vehicle.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
