import React, { useState, useEffect } from 'react';
import { X, Wrench, Upload, Plus, Trash2, Tag, Car, FileText, Check, Paperclip } from 'lucide-react';
import { MaintenanceRecord, Vehicle, MaintenanceCategory, MaintenanceType, Attachment } from '../types';
import { formatKm } from '../utils/formatters';

interface MaintenanceFormModalProps {
  initialRecord?: MaintenanceRecord | null;
  defaultVehicleId?: string;
  vehicles: Vehicle[];
  onSave: (recordData: Partial<MaintenanceRecord>, updateVehicleKm?: boolean) => void;
  onClose: () => void;
}

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

const TYPES: MaintenanceType[] = [
  'Preventiva',
  'Corretiva',
  'Emergencial',
  'Estética',
  'Documental',
];

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  initialRecord,
  defaultVehicleId,
  vehicles,
  onSave,
  onClose,
}) => {
  const isEditing = !!initialRecord;

  // Selected vehicle state
  const initialVehicleId = initialRecord?.vehicleId || defaultVehicleId || (vehicles[0]?.id || '');
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  const [type, setType] = useState<MaintenanceType>(initialRecord?.type || 'Preventiva');
  const [category, setCategory] = useState<MaintenanceCategory>(initialRecord?.category || 'Troca de Óleo');
  const [date, setDate] = useState(initialRecord?.date || new Date().toISOString().split('T')[0]);
  const [kmAtService, setKmAtService] = useState<number>(initialRecord?.kmAtService ?? (selectedVehicle?.currentKm || 0));
  const [shouldUpdateVehicleKm, setShouldUpdateVehicleKm] = useState(true);
  const [cost, setCost] = useState<number>(initialRecord?.cost ?? 0);
  const [workshop, setWorkshop] = useState(initialRecord?.workshop || '');
  const [description, setDescription] = useState(initialRecord?.description || '');
  const [invoiceNumber, setInvoiceNumber] = useState(initialRecord?.invoiceNumber || '');
  const [notes, setNotes] = useState(initialRecord?.notes || '');
  
  // Parts input
  const [partsReplaced, setPartsReplaced] = useState<string[]>(initialRecord?.partsReplaced || []);
  const [newPartInput, setNewPartInput] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(initialRecord?.attachments || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If user changes vehicle and is not editing, update suggested KM
  const handleVehicleChange = (newVehId: string) => {
    setVehicleId(newVehId);
    if (!isEditing) {
      const v = vehicles.find(item => item.id === newVehId);
      if (v) {
        setKmAtService(v.currentKm);
      }
    }
  };

  const handleAddPart = () => {
    if (newPartInput.trim()) {
      setPartsReplaced([...partsReplaced, newPartInput.trim()]);
      setNewPartInput('');
    }
  };

  const handleRemovePart = (index: number) => {
    setPartsReplaced(partsReplaced.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const newAttachment: Attachment = {
              id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              name: file.name,
              url: reader.result,
              type: file.type || 'image/jpeg',
              date: new Date().toISOString().split('T')[0],
              sizeKb: Math.round(file.size / 1024),
            };
            setAttachments(prev => [...prev, newAttachment]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(attachments.filter(a => a.id !== attId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!vehicleId) newErrors.vehicleId = 'Selecione um veículo';
    if (!description.trim()) newErrors.description = 'Informe a descrição do serviço';
    if (!workshop.trim()) newErrors.workshop = 'Informe a oficina ou fornecedor';
    if (cost < 0) newErrors.cost = 'Valor inválido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      vehicleId,
      type,
      category,
      date,
      kmAtService: Number(kmAtService),
      cost: Number(cost),
      workshop: workshop.trim(),
      description: description.trim(),
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      partsReplaced,
      attachments,
    }, shouldUpdateVehicleKm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Registro de Manutenção' : 'Registrar Nova Manutenção'}
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
          {/* Veículo & Odômetro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Veículo *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.vehicleId ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} - {v.licensePlate} (Atual: {formatKm(v.currentKm)})
                  </option>
                ))}
              </select>
              {errors.vehicleId && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.vehicleId}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Quilometragem no Serviço (KM) *
              </label>
              <input
                type="number"
                min="0"
                value={kmAtService}
                onChange={(e) => setKmAtService(Number(e.target.value))}
                className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
              />
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chk-update-km"
                  checked={shouldUpdateVehicleKm}
                  onChange={(e) => setShouldUpdateVehicleKm(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="chk-update-km" className="text-[11px] text-gray-600 cursor-pointer">
                  Atualizar odômetro do veículo caso este valor seja maior
                </label>
              </div>
            </div>
          </div>

          {/* Categoria, Tipo & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Categoria de Manutenção *
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

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Tipo do Serviço *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Data da Realização *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Valor, Oficina & Nota Fiscal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Valor Total Gasto (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className={`w-full text-sm py-2 px-3 font-bold bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.cost ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.cost && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.cost}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Oficina / Estabelecimento *
              </label>
              <input
                type="text"
                placeholder="Ex: Concessionária Toyota, Auto Center Silva..."
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.workshop ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.workshop && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.workshop}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nº Nota Fiscal / OS / Cupom
              </label>
              <input
                type="text"
                placeholder="Ex: NF-e 049.201 ou OS 1928"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full text-sm py-2 px-3 font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Descrição do Serviço Realizado *
            </label>
            <input
              type="text"
              placeholder="Ex: Troca de óleo do motor 0W20, filtro de óleo e filtro de ar de cabine..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.description ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.description && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.description}</span>}
          </div>

          {/* Peças Substituídas */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Peças / Itens Substituídos
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ex: Jogo de pastilhas dianteiras, Filtro de combustível..."
                value={newPartInput}
                onChange={(e) => setNewPartInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPart();
                  }
                }}
                className="flex-1 text-xs py-1.5 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddPart}
                className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Peça</span>
              </button>
            </div>

            {partsReplaced.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {partsReplaced.map((part, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-800 text-xs rounded-md shadow-2xs font-medium"
                  >
                    <span>{part}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="text-gray-400 hover:text-red-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Observações & Garantia */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Observações Adicionais / Garantia
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Garantia de 6 meses no serviço. Próxima checagem sugerida em 5.000 km..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Anexos de Comprovantes & Notas Fiscais */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Comprovantes & Notas Fiscais (Anexos)</span>
              </label>

              <label className="cursor-pointer px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 shadow-2xs flex items-center space-x-1 transition-colors">
                <Upload className="w-3 h-3 text-blue-600" />
                <span>Anexar Arquivo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Nenhum comprovante anexado. Você pode anexar fotos da nota fiscal, recibo da oficina ou ordem de serviço.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map(att => (
                  <div 
                    key={att.id}
                    className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate font-medium text-gray-800">{att.name}</span>
                      {att.sizeKb && <span className="text-[10px] text-gray-400">({att.sizeKb} KB)</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {isEditing ? 'Salvar Alterações' : 'Confirmar Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
