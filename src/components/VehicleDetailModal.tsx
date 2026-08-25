import React, { useState, useMemo } from 'react';
import { 
  X, 
  Car, 
  Wrench, 
  DollarSign, 
  Gauge, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit, 
  Paperclip, 
  Clock, 
  Tag, 
  ShieldCheck, 
  Printer, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, AlertReminder, MaintenanceCategory } from '../types';
import { formatCurrency, formatKm, formatDate, calculateAlertStatus, getCategoryBadgeClass, getTypeBadgeClass } from '../utils/formatters';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  maintenances: MaintenanceRecord[];
  alerts: AlertReminder[];
  onClose: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onOpenNewMaintenance: (vehicleId: string) => void;
  onOpenNewAlert: (vehicleId: string) => void;
  onOpenQuickKm: (vehicleId: string) => void;
  onEditMaintenance: (record: MaintenanceRecord) => void;
  onDeleteMaintenance: (recordId: string) => void;
  onToggleCompleteAlert: (alertId: string) => void;
  onViewAttachment: (url: string, name: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  maintenances,
  alerts,
  onClose,
  onEditVehicle,
  onOpenNewMaintenance,
  onOpenNewAlert,
  onOpenQuickKm,
  onEditMaintenance,
  onDeleteMaintenance,
  onToggleCompleteAlert,
  onViewAttachment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchMaint, setSearchMaint] = useState<string>('');

  // Vehicle specific records
  const vehicleMaintenances = useMemo(() => {
    return maintenances
      .filter(m => m.vehicleId === vehicle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenances, vehicle.id]);

  const vehicleAlerts = useMemo(() => {
    return alerts.filter(a => a.vehicleId === vehicle.id);
  }, [alerts, vehicle.id]);

  // Financial calculations
  const metrics = useMemo(() => {
    const totalSpent = vehicleMaintenances.reduce((sum, m) => sum + m.cost, 0);
    const serviceCount = vehicleMaintenances.length;
    const avgCostPerService = serviceCount > 0 ? totalSpent / serviceCount : 0;

    const kmDriven = Math.max(0, vehicle.currentKm - vehicle.initialKm);
    const costPerKm = kmDriven > 0 ? totalSpent / kmDriven : 0;

    const preventiveSpent = vehicleMaintenances
      .filter(m => m.type === 'Preventiva')
      .reduce((sum, m) => sum + m.cost, 0);

    const correctiveSpent = vehicleMaintenances
      .filter(m => m.type === 'Corretiva' || m.type === 'Emergencial')
      .reduce((sum, m) => sum + m.cost, 0);

    return {
      totalSpent,
      serviceCount,
      avgCostPerService,
      kmDriven,
      costPerKm,
      preventiveSpent,
      correctiveSpent,
    };
  }, [vehicleMaintenances, vehicle]);

  // Filtered maintenance list
  const filteredMaintenances = useMemo(() => {
    return vehicleMaintenances.filter(m => {
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch = 
        m.description.toLowerCase().includes(searchMaint.toLowerCase()) ||
        m.workshop.toLowerCase().includes(searchMaint.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchMaint.toLowerCase())) ||
        (m.partsReplaced && m.partsReplaced.some(p => p.toLowerCase().includes(searchMaint.toLowerCase())));
      return matchCat && matchSearch;
    });
  }, [vehicleMaintenances, selectedCategory, searchMaint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Modal Header Banner */}
        <div className="relative bg-gray-900 text-white min-h-[160px] sm:min-h-[180px] flex flex-col justify-end p-4 sm:p-6 overflow-hidden">
          {/* Background Image with Overlay */}
          <img
            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />

          {/* Close & Action Buttons at top right */}
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-white backdrop-blur-xs transition-colors cursor-pointer"
              title="Imprimir Ficha"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditVehicle(vehicle)}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-white backdrop-blur-xs transition-colors cursor-pointer"
              title="Editar Veículo"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-red-600 text-white backdrop-blur-xs transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Key specs overlay */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  vehicle.status === 'Ativo' ? 'bg-emerald-500 text-white' :
                  vehicle.status === 'Em Manutenção' ? 'bg-amber-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {vehicle.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-200 border border-gray-700">
                  {vehicle.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-200 border border-gray-700">
                  {vehicle.fuelType}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Ano {vehicle.yearManufacture}/{vehicle.yearModel} • Cor: {vehicle.color}
              </p>
            </div>

            {/* Mercosul License Plate Badge */}
            <div className="bg-white rounded-md border border-gray-200 shadow-md overflow-hidden self-start sm:self-auto">
              <div className="bg-blue-800 px-3 py-0.5 text-center text-[10px] font-bold text-white tracking-widest uppercase flex items-center justify-between space-x-2">
                <span>BRASIL</span>
                <span className="w-2 h-1.5 bg-yellow-400 rounded-2xs inline-block"></span>
              </div>
              <div className="px-3 py-1 font-mono text-sm font-bold text-gray-900 tracking-wider text-center">
                {vehicle.licensePlate}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* KPI Mini-Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Gasto Total</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 mt-1 block">
                {formatCurrency(metrics.totalSpent)}
              </span>
              <span className="text-[11px] text-gray-400">{metrics.serviceCount} manutenções</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Odômetro Atual</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatKm(vehicle.currentKm)}
                </span>
                <button
                  onClick={() => onOpenQuickKm(vehicle.id)}
                  className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                  title="Atualizar Odômetro"
                >
                  <Gauge className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-gray-400">Rodados: {formatKm(metrics.kmDriven)}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Custo por KM</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 mt-1 block">
                {formatCurrency(metrics.costPerKm)}/km
              </span>
              <span className="text-[11px] text-gray-400">Média em manutenções</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Média por Serviço</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 mt-1 block">
                {formatCurrency(metrics.avgCostPerService)}
              </span>
              <span className="text-[11px] text-gray-400">Por visita à oficina</span>
            </div>
          </div>

          {/* Quick Technical Information Block */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Ficha Técnica & Documentação</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 text-[11px] block">Data de Aquisição</span>
                <span className="font-semibold text-gray-800">{formatDate(vehicle.purchaseDate)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Valor de Compra</span>
                <span className="font-semibold text-gray-800">{formatCurrency(vehicle.purchasePrice)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Quilometragem Inicial</span>
                <span className="font-semibold text-gray-800">{formatKm(vehicle.initialKm)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Licenciamento Anual</span>
                <span className="font-semibold text-gray-800">{vehicle.licensingExpiry ? formatDate(vehicle.licensingExpiry) : 'Não informado'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Chassi</span>
                <span className="font-mono font-semibold text-gray-800">{vehicle.chassi || 'Não cadastrado'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Renavam</span>
                <span className="font-mono font-semibold text-gray-800">{vehicle.renavam || 'Não cadastrado'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Vencimento do Seguro</span>
                <span className="font-semibold text-gray-800">{vehicle.insuranceExpiry ? formatDate(vehicle.insuranceExpiry) : 'Não informado'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Preventiva vs Corretiva</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(metrics.preventiveSpent)} / {formatCurrency(metrics.correctiveSpent)}
                </span>
              </div>
            </div>
            {vehicle.notes && (
              <div className="mt-4 pt-3 border-t border-gray-200 text-xs">
                <span className="text-gray-400 text-[11px] block">Observações do Veículo:</span>
                <p className="text-gray-700 italic mt-0.5">{vehicle.notes}</p>
              </div>
            )}
          </div>

          {/* Alerts & Next Scheduled Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Alertas e Próximas Manutenções Programadas</span>
              </h4>
              <button
                onClick={() => onOpenNewAlert(vehicle.id)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Lembrete</span>
              </button>
            </div>

            {vehicleAlerts.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                Nenhum alerta ou lembrete programado para este veículo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicleAlerts.map(alert => {
                  const statusResult = calculateAlertStatus(alert, vehicle);
                  return (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between ${
                        alert.isCompleted 
                          ? 'bg-gray-50 border-gray-200 opacity-60' :
                        statusResult.status === 'overdue' 
                          ? 'bg-red-50/60 border-red-200' :
                        statusResult.status === 'warning'
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            alert.isCompleted ? 'bg-gray-100 text-gray-700' :
                            statusResult.status === 'overdue' ? 'bg-red-100 text-red-800 border border-red-200' :
                            statusResult.status === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {statusResult.label}
                          </span>
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {statusResult.details}
                        </p>
                        {alert.notes && (
                          <p className="text-[11px] text-gray-500 mt-0.5 italic">{alert.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => onToggleCompleteAlert(alert.id)}
                        className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer ${
                          alert.isCompleted
                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            : 'bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border-gray-200 shadow-xs'
                        }`}
                        title={alert.isCompleted ? 'Reabrir Alerta' : 'Marcar como Concluído'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Maintenance History Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Histórico Completo de Manutenções</span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registro cronológico de todos os serviços, peças substituídas e despesas.
                </p>
              </div>

              <button
                onClick={() => onOpenNewMaintenance(vehicle.id)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs self-start sm:self-auto transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Serviço</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por oficina, serviço ou peça..."
                value={searchMaint}
                onChange={(e) => setSearchMaint(e.target.value)}
                className="text-xs py-2 px-3 bg-white border border-gray-200 rounded-lg flex-1 min-w-[200px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Todas Categorias</option>
                <option value="Troca de Óleo">Troca de Óleo</option>
                <option value="Revisão">Revisão</option>
                <option value="Pneus">Pneus</option>
                <option value="Freios">Freios</option>
                <option value="Suspensão">Suspensão</option>
                <option value="Motor">Motor</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Reparos / Funilaria">Reparos</option>
                <option value="Documentação / IPVA">Documentação</option>
                <option value="Ar-condicionado">Ar-condicionado</option>
                <option value="Bateria">Bateria</option>
              </select>
            </div>

            {/* Maintenances Timeline / List */}
            {filteredMaintenances.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Nenhum registro de manutenção encontrado.</p>
                <p className="text-xs text-gray-400 mt-0.5">Clique em "Registrar Serviço" para adicionar a primeira manutenção deste veículo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaintenances.map((record) => (
                  <div 
                    key={record.id}
                    className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getCategoryBadgeClass(record.category)}`}>
                          {record.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getTypeBadgeClass(record.type)}`}>
                          {record.type}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs font-semibold text-gray-700">{formatDate(record.date)}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {formatKm(record.kmAtService)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(record.cost)}
                        </span>
                        <button
                          onClick={() => onEditMaintenance(record)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir o registro "${record.description}"?`)) {
                              onDeleteMaintenance(record.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                          title="Excluir"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">{record.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-2">
                        <span><strong>Oficina:</strong> {record.workshop}</span>
                        {record.invoiceNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                              {record.invoiceNumber}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Parts Replaced */}
                    {record.partsReplaced && record.partsReplaced.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-gray-400 font-medium">Itens trocados:</span>
                        {record.partsReplaced.map((part, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded-md font-medium">
                            {part}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                        "{record.notes}"
                      </p>
                    )}

                    {/* Attachments / Receipts */}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-gray-400 flex items-center space-x-1">
                          <Paperclip className="w-3 h-3" />
                          <span>Comprovantes:</span>
                        </span>
                        {record.attachments.map((att) => (
                          <button
                            key={att.id}
                            onClick={() => onViewAttachment(att.url, att.name)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <span>{att.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Cadastrado em {formatDate(vehicle.createdAt.split('T')[0])}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
