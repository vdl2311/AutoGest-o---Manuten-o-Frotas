import React, { useState } from 'react';
import { X, Car, Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { Vehicle, VehicleCategory, FuelType, VehicleStatus } from '../types';
import { PRESET_VEHICLE_PHOTOS } from '../utils/formatters';

interface VehicleFormModalProps {
  initialVehicle?: Vehicle | null;
  onSave: (vehicleData: Partial<Vehicle>) => void;
  onClose: () => void;
}

const COMMON_BRANDS = [
  'Toyota', 'Volkswagen', 'Fiat', 'Chevrolet', 'Jeep', 
  'Honda', 'Hyundai', 'Ford', 'Renault', 'Nissan', 
  'BMW', 'Mercedes-Benz', 'Audi', 'BYD', 'Volvo', 'Caoa Chery'
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  initialVehicle,
  onSave,
  onClose,
}) => {
  const isEditing = !!initialVehicle;

  const [brand, setBrand] = useState(initialVehicle?.brand || '');
  const [model, setModel] = useState(initialVehicle?.model || '');
  const [yearManufacture, setYearManufacture] = useState(initialVehicle?.yearManufacture || new Date().getFullYear());
  const [yearModel, setYearModel] = useState(initialVehicle?.yearModel || new Date().getFullYear());
  const [licensePlate, setLicensePlate] = useState(initialVehicle?.licensePlate || '');
  const [color, setColor] = useState(initialVehicle?.color || '');
  const [category, setCategory] = useState<VehicleCategory>(initialVehicle?.category || 'Passeio / Sedan');
  const [fuelType, setFuelType] = useState<FuelType>(initialVehicle?.fuelType || 'Flex (Gasolina/Etanol)');
  const [status, setStatus] = useState<VehicleStatus>(initialVehicle?.status || 'Ativo');
  const [initialKm, setInitialKm] = useState(initialVehicle?.initialKm ?? 0);
  const [currentKm, setCurrentKm] = useState(initialVehicle?.currentKm ?? 0);
  const [purchasePrice, setPurchasePrice] = useState(initialVehicle?.purchasePrice ?? 0);
  const [purchaseDate, setPurchaseDate] = useState(initialVehicle?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState(initialVehicle?.imageUrl || PRESET_VEHICLE_PHOTOS[0].url);
  const [chassi, setChassi] = useState(initialVehicle?.chassi || '');
  const [renavam, setRenavam] = useState(initialVehicle?.renavam || '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(initialVehicle?.insuranceExpiry || '');
  const [licensingExpiry, setLicensingExpiry] = useState(initialVehicle?.licensingExpiry || '');
  const [notes, setNotes] = useState(initialVehicle?.notes || '');

  const [showPresets, setShowPresets] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!brand.trim()) newErrors.brand = 'Informe a marca';
    if (!model.trim()) newErrors.model = 'Informe o modelo';
    if (!licensePlate.trim()) newErrors.licensePlate = 'Informe a placa';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      brand: brand.trim(),
      model: model.trim(),
      yearManufacture: Number(yearManufacture),
      yearModel: Number(yearModel),
      licensePlate: licensePlate.toUpperCase().trim(),
      color: color.trim() || 'Prata',
      category,
      fuelType,
      status,
      initialKm: Number(initialKm),
      currentKm: Number(currentKm),
      purchasePrice: Number(purchasePrice),
      purchaseDate,
      imageUrl: imageUrl.trim() || PRESET_VEHICLE_PHOTOS[0].url,
      chassi: chassi.toUpperCase().trim(),
      renavam: renavam.trim(),
      insuranceExpiry: insuranceExpiry || undefined,
      licensingExpiry: licensingExpiry || undefined,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photo Selector / Preview */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Foto do Veículo
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-36 h-24 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0 shadow-inner">
                <img
                  src={imageUrl || PRESET_VEHICLE_PHOTOS[0].url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 shadow-xs flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showPresets ? 'Ocultar Sugestões' : 'Escolher Foto Sugerida'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Ou cole o link direto da imagem (URL)..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Presets Gallery */}
            {showPresets && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-600 block mb-2">
                  Selecione uma foto automotiva padrão:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_VEHICLE_PHOTOS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowPresets(false);
                      }}
                      className={`group relative rounded-lg overflow-hidden border text-left text-[11px] cursor-pointer ${
                        imageUrl === preset.url ? 'ring-2 ring-blue-600 border-transparent' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-1 bg-white truncate font-medium text-gray-700">
                        {preset.label}
                      </div>
                      {imageUrl === preset.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Identificação */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Identificação & Modelo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marca */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  list="brands-list"
                  placeholder="Ex: Toyota, Jeep, Fiat..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.brand ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                <datalist id="brands-list">
                  {COMMON_BRANDS.map(b => <option key={b} value={b} />)}
                </datalist>
                {errors.brand && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.brand}</span>}
              </div>

              {/* Modelo */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Modelo / Versão *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Corolla XEi 2.0 Flex Aut."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.model ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.model && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.model}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Ano Fab */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Ano Fab.
                </label>
                <input
                  type="number"
                  min="1970"
                  max="2035"
                  value={yearManufacture}
                  onChange={(e) => setYearManufacture(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Ano Mod */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Ano Modelo
                </label>
                <input
                  type="number"
                  min="1970"
                  max="2035"
                  value={yearModel}
                  onChange={(e) => setYearModel(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Placa */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  placeholder="BRA2E19"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className={`w-full text-sm py-2 px-3 font-mono uppercase bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.licensePlate ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.licensePlate && <span className="text-[11px] text-red-500 mt-0.5 block">{errors.licensePlate}</span>}
              </div>

              {/* Cor */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prata, Branco"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Categoria, Combustível & Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Classificação & Operação
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Categoria do Veículo
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Passeio / Sedan">Passeio / Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Picape">Picape</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Moto">Moto</option>
                  <option value="Van">Van</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Elétrico / Híbrido">Elétrico / Híbrido</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Tipo de Combustível
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Flex (Gasolina/Etanol)">Flex (Gasolina/Etanol)</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Etanol">Etanol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="GNV">GNV</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Status Operacional
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Ativo">Ativo (Em circulação)</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Inativo">Inativo / Desativado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  KM Inicial (Compra)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialKm}
                  onChange={(e) => setInitialKm(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  KM Atual (Odômetro)
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Preço de Compra (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Data de Compra
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Documentação & Prazos */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Documentos & Vencimentos (Opcional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Número do Chassi
                </label>
                <input
                  type="text"
                  placeholder="Ex: 9BRBL42E4P0129384"
                  value={chassi}
                  onChange={(e) => setChassi(e.target.value.toUpperCase())}
                  className="w-full text-sm py-2 px-3 font-mono uppercase bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Número do Renavam
                </label>
                <input
                  type="text"
                  placeholder="Ex: 01293847561"
                  value={renavam}
                  onChange={(e) => setRenavam(e.target.value)}
                  className="w-full text-sm py-2 px-3 font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Vencimento do Licenciamento / IPVA
                </label>
                <input
                  type="date"
                  value={licensingExpiry}
                  onChange={(e) => setLicensingExpiry(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Vencimento do Seguro Auto
                </label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Observações Adicionais
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais, garantias, acessórios instalados, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
