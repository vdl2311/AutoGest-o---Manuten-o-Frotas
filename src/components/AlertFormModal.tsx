import React, { useState } from 'react';
import { X, Bell, Sparkles, Calendar, Gauge, Car } from 'lucide-react';
import { AlertReminder, Vehicle, MaintenanceCategory, AlertTriggerType } from '../types';

interface AlertFormModalProps {
  initialAlert?: AlertReminder | null;
  defaultVehicleId?: string;
  vehicles: Vehicle[];
  onSave: (alertData: Partial<AlertReminder>) => void;
  onClose: () => void;
}

const COMMON_ALERT_TEMPLATES: { title: string; category: MaintenanceCategory; triggerType: AlertTriggerType; months?: number; km?: number }[] = [
  { title: 'Próxima Troca de Óleo e Filtro', category: 'Troca de Óleo', triggerType: 'both', months: 6, km: 10000 },
  { title: 'Revisão Periódica Periódica', category: 'Revisão', triggerType: 'both', months: 12, km: 10000 },
  { title: 'Rodízio e Balanceamento dos Pneus', category: 'Pneus', triggerType: 'km', km: 10000 },
  { title: 'Vencimento do Licenciamento Anual', category: 'Documentação / IPVA', triggerType: 'date', months: 12 },
  { title: 'Renovação da Apólice de Seguro', category: 'Documentação / IPVA', triggerType: 'date', months: 12 },
  { title: 'Inspeção de Pastilhas de Freio', category: 'Freios', triggerType: 'km', km: 15000 },
  { title: 'Substituição do Filtro de Cabine / Ar-cond.', category: 'Ar-condicionado', triggerType: 'both', months: 6, km: 10000 },
  { title: 'Checagem da Bateria e Alternador', category: 'Bateria', triggerType: 'both', months: 12, km: 20000 },
];

const CATEGORIES: MaintenanceCategory[] = [
  'Troca de Óleo',
  'Revisão',
  'Pneus',
  'Freios',
  'Suspensão',
  'Motor',
  'Elétrica',
  'Reparos / Funilaria',
  'Documentação / IPVA',
  'Ar-condicionado',
  'Bateria',
  'Outros',
];

export const AlertFormModal: React.FC<AlertFormModalProps> = ({
  initialAlert,
  defaultVehicleId,
  vehicles,
  onSave,
  onClose,
}) => {
  const isEditing = !!initialAlert;

  const initialVehicleId = initialAlert?.vehicleId || defaultVehicleId || (vehicles[0]?.id || '');
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  const [title, setTitle] = useState(initialAlert?.title || '');
  const [category, setCategory] = useState<MaintenanceCategory>(initialAlert?.category || 'Troca de Óleo');
  const [triggerType, setTriggerType] = useState<AlertTriggerType>(initialAlert?.triggerType || 'both');
  const [targetDate, setTargetDate] = useState(initialAlert?.targetDate || '');
  const [targetKm, setTargetKm] = useState<string>(initialAlert?.targetKm ? String(initialAlert.targetKm) : '');
  const [intervalMonths, setIntervalMonths] = useState<string>(initialAlert?.intervalMonths ? String(initialAlert.intervalMonths) : '');
  const [intervalKm, setIntervalKm] = useState<string>(initialAlert?.intervalKm ? String(initialAlert.intervalKm) : '');
  const [notes, setNotes] = useState(initialAlert?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyTemplate = (tpl: typeof COMMON_ALERT_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setTriggerType(tpl.triggerType);

    const now = new Date();
    if (tpl.months) {
      now.setMonth(now.getMonth() + tpl.months);
      setTargetDate(now.toISOString().split('T')[0]);
      setIntervalMonths(String(tpl.months));
    }

    if (tpl.km && selectedVehicle) {
      setTargetKm(String(selectedVehicle.currentKm + tpl.km));
      setIntervalKm(String(tpl.km));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!vehicleId) newErrors.vehicleId = 'Selecione um veículo';
    if (!title.trim()) newErrors.title = 'Informe o título do alerta';

    if (triggerType === 'date' || triggerType === 'both') {
      if (!targetDate) newErrors.targetDate = 'Informe a data de vencimento';
    }

    if (triggerType === 'km' || triggerType === 'both') {
      if (!targetKm || Number(targetKm) <= 0) newErrors.targetKm = 'Informe a quilometragem limite';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      vehicleId,
      title: title.trim(),
      category,
      triggerType,
      targetDate: (triggerType === 'date' || triggerType === 'both') ? targetDate : undefined,
      targetKm: (triggerType === 'km' || triggerType === 'both') && targetKm ? Number(targetKm) : undefined,
      intervalMonths: intervalMonths ? Number(intervalMonths) : undefined,
      intervalKm: intervalKm ? Number(intervalKm) : undefined,
      notes: notes.trim() || undefined,
      isCompleted: initialAlert?.isCompleted ?? false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Alerta de Manutenção' : 'Criar Novo Alerta / Lembrete'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Suggestions Template Bar */}
          {!isEditing && (
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Modelos Rápidos de Alertas Comuns:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALERT_TEMPLATES.map((tpl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => applyTemplate(tpl)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-gray-700 text-xs font-medium rounded-lg border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    + {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Veículo & Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Veículo *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.vehicleId ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.licensePlate})
                  </option>
                ))}
              </select>
              {errors.vehicleId && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.vehicleId}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Categoria de Serviço *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Título do Alerta / Lembrete *
            </label>
            <input
              type="text"
              placeholder="Ex: Troca de Óleo e Filtro (40.000 km)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.title && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.title}</span>}
          </div>

          {/* Tipo de Gatilho */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Gatilho de Disparo do Alerta
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTriggerType('both')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  triggerType === 'both'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>Data ou KM</span>
                <span className="text-[10px] font-normal opacity-80">(O que vencer antes)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriggerType('date')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  triggerType === 'date'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>Apenas por Data</span>
                <span className="text-[10px] font-normal opacity-80">(Dia fixo)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriggerType('km')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  triggerType === 'km'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>Apenas por KM</span>
                <span className="text-[10px] font-normal opacity-80">(Odômetro)</span>
              </button>
            </div>

            {/* Target Date and Target KM Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(triggerType === 'date' || triggerType === 'both') && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Data Limite de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors.targetDate ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.targetDate && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.targetDate}</span>}
                </div>
              )}

              {(triggerType === 'km' || triggerType === 'both') && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Quilometragem Limite (KM) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 50000"
                    value={targetKm}
                    onChange={(e) => setTargetKm(e.target.value)}
                    className={`w-full text-sm py-2 px-3 font-bold bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors.targetKm ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {selectedVehicle && (
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Odômetro atual do carro: <strong>{selectedVehicle.currentKm.toLocaleString('pt-BR')} km</strong>
                    </span>
                  )}
                  {errors.targetKm && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.targetKm}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Instruções ou Observações do Serviço
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Utilizar óleo sintético especificação 0W20 e trocar também o anel do bujão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer"
            >
              {isEditing ? 'Salvar Alerta' : 'Criar Alerta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
