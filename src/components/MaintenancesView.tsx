import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  Car, 
  Paperclip, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  Building2,
  Tag
} from 'lucide-react';
import { MaintenanceRecord, Vehicle, MaintenanceCategory, MaintenanceType } from '../types';
import { formatCurrency, formatKm, formatDate, getCategoryBadgeClass, getTypeBadgeClass } from '../utils/formatters';

interface MaintenancesViewProps {
  maintenances: MaintenanceRecord[];
  vehicles: Vehicle[];
  onOpenNewMaintenance: () => void;
  onEditMaintenance: (record: MaintenanceRecord) => void;
  onDeleteMaintenance: (recordId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onViewAttachment: (url: string, name: string) => void;
}

export const MaintenancesView: React.FC<MaintenancesViewProps> = ({
  maintenances,
  vehicles,
  onOpenNewMaintenance,
  onEditMaintenance,
  onDeleteMaintenance,
  onSelectVehicle,
  onViewAttachment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtered maintenances
  const filteredMaintenances = useMemo(() => {
    const now = new Date();

    return maintenances.filter(m => {
      // Vehicle match
      if (selectedVehicleId !== 'all' && m.vehicleId !== selectedVehicleId) return false;

      // Category match
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;

      // Type match
      if (selectedType !== 'all' && m.type !== selectedType) return false;

      // Search match
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const vehicle = vehicles.find(v => v.id === m.vehicleId);
        const vehicleText = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.licensePlate}`.toLowerCase() : '';
        const matchSearch =
          m.description.toLowerCase().includes(term) ||
          m.workshop.toLowerCase().includes(term) ||
          (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(term)) ||
          (m.notes && m.notes.toLowerCase().includes(term)) ||
          (m.partsReplaced && m.partsReplaced.some(p => p.toLowerCase().includes(term))) ||
          vehicleText.includes(term);

        if (!matchSearch) return false;
      }

      // Period match
      if (periodFilter === '30days') {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 30);
        const mDate = new Date(m.date + 'T00:00:00');
        if (mDate < dateLimit) return false;
      } else if (periodFilter === '90days') {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 90);
        const mDate = new Date(m.date + 'T00:00:00');
        if (mDate < dateLimit) return false;
      } else if (periodFilter === 'thisYear') {
        const startOfYear = `${now.getFullYear()}-01-01`;
        if (m.date < startOfYear) return false;
      } else if (periodFilter === 'custom') {
        if (customStartDate && m.date < customStartDate) return false;
        if (customEndDate && m.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenances, vehicles, selectedVehicleId, selectedCategory, selectedType, searchTerm, periodFilter, customStartDate, customEndDate]);

  // Aggregate statistics for the filtered list
  const aggregateStats = useMemo(() => {
    const totalSpent = filteredMaintenances.reduce((acc, m) => acc + m.cost, 0);
    const count = filteredMaintenances.length;
    const avgCost = count > 0 ? totalSpent / count : 0;
    return { totalSpent, count, avgCost };
  }, [filteredMaintenances]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Controle de Manutenções & Serviços
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro detalhado de revisões, trocas de óleo, reparos mecânicos e despesas da frota.
          </p>
        </div>

        <button
          onClick={onOpenNewMaintenance}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Manutenção</span>
        </button>
      </div>

      {/* Aggregate Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Serviços Filtrados</p>
            <span className="text-3xl font-bold text-gray-900 mt-1 block">{aggregateStats.count}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Gasto Filtrado</p>
            <span className="text-3xl font-bold text-gray-900 mt-1 block">{formatCurrency(aggregateStats.totalSpent)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Média por Serviço</p>
            <span className="text-3xl font-bold text-gray-900 mt-1 block">{formatCurrency(aggregateStats.avgCost)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar serviço, oficina, NF, peças..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Vehicle filter */}
          <div>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Todos os Veículos ({vehicles.length})</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Troca de Óleo">Troca de Óleo</option>
              <option value="Revisão">Revisão Periódica</option>
              <option value="Pneus">Pneus & Rodas</option>
              <option value="Freios">Sistema de Freios</option>
              <option value="Suspensão">Suspensão & Direção</option>
              <option value="Motor">Motor & Transmissão</option>
              <option value="Elétrica">Elétrica & Injeção</option>
              <option value="Reparos / Funilaria">Reparos & Funilaria</option>
              <option value="Documentação / IPVA">Documentação & Taxas</option>
              <option value="Ar-condicionado">Ar-condicionado</option>
              <option value="Bateria">Bateria</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Type / Nature */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Emergencial">Emergencial</option>
              <option value="Estética">Estética</option>
              <option value="Documental">Documental</option>
            </select>
          </div>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold mr-1">Período:</span>
            {[
              { id: 'all', label: 'Todo o Histórico' },
              { id: '30days', label: 'Últimos 30 dias' },
              { id: '90days', label: 'Últimos 90 dias' },
              { id: 'thisYear', label: 'Este Ano' },
              { id: 'custom', label: 'Personalizado' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                  periodFilter === p.id 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {periodFilter === 'custom' && (
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="py-1 px-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="py-1 px-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
          )}

          {(searchTerm || selectedVehicleId !== 'all' || selectedCategory !== 'all' || selectedType !== 'all' || periodFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedVehicleId('all');
                setSelectedCategory('all');
                setSelectedType('all');
                setPeriodFilter('all');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-xs text-blue-600 font-semibold hover:text-blue-800"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Maintenances List */}
      {filteredMaintenances.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Nenhuma manutenção encontrada</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            Nenhum registro corresponde aos filtros selecionados. Altere os filtros ou adicione uma nova manutenção.
          </p>
          <button
            onClick={onOpenNewMaintenance}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Registrar Nova Manutenção
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaintenances.map((record) => {
            const vehicle = vehicles.find(v => v.id === record.vehicleId);

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category & Type badges */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(record.category)}`}>
                      {record.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getTypeBadgeClass(record.type)}`}>
                      {record.type}
                    </span>

                    {/* Vehicle pill */}
                    {vehicle && (
                      <button
                        onClick={() => onSelectVehicle(vehicle.id)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-gray-50 hover:bg-blue-50 text-gray-800 hover:text-blue-600 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                      >
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        <span>{vehicle.brand} {vehicle.model}</span>
                        <span className="font-mono text-[10px] text-gray-500">[{vehicle.licensePlate}]</span>
                      </button>
                    )}
                  </div>

                  {/* Date & Cost */}
                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">{formatDate(record.date)}</span>
                      <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {formatKm(record.kmAtService)}
                      </span>
                    </div>

                    <div className="text-right pl-3 border-l border-gray-200">
                      <span className="text-lg font-bold text-gray-900 block">
                        {formatCurrency(record.cost)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditMaintenance(record)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a manutenção "${record.description}"?`)) {
                            onDeleteMaintenance(record.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description & Workshop */}
                <div>
                  <h3 className="text-base font-bold text-gray-900">{record.description}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center space-x-1 font-medium text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{record.workshop}</span>
                    </span>

                    {record.invoiceNumber && (
                      <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 text-[11px]">
                        NF: {record.invoiceNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Parts replaced */}
                {record.partsReplaced && record.partsReplaced.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>Itens substituídos:</span>
                    </span>
                    {record.partsReplaced.map((part, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded-md font-medium border border-gray-200"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {record.notes && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{record.notes}"
                  </p>
                )}

                {/* Attachments / Receipts */}
                {record.attachments && record.attachments.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Comprovantes anexados:</span>
                    </span>
                    {record.attachments.map((att) => (
                      <button
                        key={att.id}
                        onClick={() => onViewAttachment(att.url, att.name)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{att.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
