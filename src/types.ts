export type VehicleCategory = 
  | 'Passeio / Sedan'
  | 'SUV'
  | 'Picape'
  | 'Hatch'
  | 'Moto'
  | 'Van'
  | 'Caminhão'
  | 'Elétrico / Híbrido'
  | 'Outro';

export type FuelType = 
  | 'Flex (Gasolina/Etanol)'
  | 'Gasolina'
  | 'Etanol'
  | 'Diesel'
  | 'Elétrico'
  | 'Híbrido'
  | 'GNV';

export type VehicleStatus = 'Ativo' | 'Em Manutenção' | 'Inativo';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  yearManufacture: number;
  yearModel: number;
  licensePlate: string;
  color: string;
  category: VehicleCategory;
  fuelType: FuelType;
  status: VehicleStatus;
  initialKm: number;
  currentKm: number;
  purchasePrice: number;
  purchaseDate: string; // YYYY-MM-DD
  imageUrl: string;
  notes?: string;
  chassi?: string;
  renavam?: string;
  insuranceExpiry?: string;
  licensingExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceCategory =
  | 'Troca de Óleo'
  | 'Revisão'
  | 'Pneus'
  | 'Freios'
  | 'Suspensão'
  | 'Motor'
  | 'Elétrica'
  | 'Reparos / Funilaria'
  | 'Documentação / IPVA'
  | 'Ar-condicionado'
  | 'Bateria'
  | 'Outros';

export type MaintenanceType =
  | 'Preventiva'
  | 'Corretiva'
  | 'Estética'
  | 'Documental'
  | 'Emergencial';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // image/jpeg, application/pdf, etc.
  date: string;
  sizeKb?: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  date: string; // YYYY-MM-DD
  kmAtService: number;
  cost: number;
  workshop: string;
  description: string;
  notes?: string;
  partsReplaced?: string[];
  invoiceNumber?: string;
  attachments?: Attachment[];
  createdAt: string;
}

export type AlertTriggerType = 'date' | 'km' | 'both';

export interface AlertReminder {
  id: string;
  vehicleId: string;
  title: string;
  category: MaintenanceCategory;
  triggerType: AlertTriggerType;
  targetDate?: string; // YYYY-MM-DD
  targetKm?: number;
  intervalMonths?: number;
  intervalKm?: number;
  notes?: string;
  isCompleted: boolean;
  completedDate?: string;
  completedKm?: number;
  createdAt: string;
}

export type AlertStatus = 'overdue' | 'warning' | 'ok' | 'completed';

export interface AlertStatusResult {
  status: AlertStatus;
  label: string;
  daysRemaining?: number;
  kmRemaining?: number;
  details: string;
}

export type AppTab = 
  | 'dashboard' 
  | 'vehicles' 
  | 'maintenances' 
  | 'financial' 
  | 'alerts' 
  | 'reports' 
  | 'settings';

export interface FilterOptions {
  vehicleId?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}
