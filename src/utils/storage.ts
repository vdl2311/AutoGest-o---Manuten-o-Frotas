import { Vehicle, MaintenanceRecord, AlertReminder } from '../types';
import { INITIAL_VEHICLES, INITIAL_MAINTENANCES, INITIAL_ALERTS } from '../data/initialData';

const VEHICLES_KEY = 'autogestao_vehicles_v1';
const MAINTENANCES_KEY = 'autogestao_maintenances_v1';
const ALERTS_KEY = 'autogestao_alerts_v1';

export function getStoredVehicles(): Vehicle[] {
  try {
    const data = localStorage.getItem(VEHICLES_KEY);
    if (!data) {
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler veículos do localStorage:', error);
    return INITIAL_VEHICLES;
  }
}

export function saveStoredVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Erro ao salvar veículos no localStorage:', error);
  }
}

export function getStoredMaintenances(): MaintenanceRecord[] {
  try {
    const data = localStorage.getItem(MAINTENANCES_KEY);
    if (!data) {
      localStorage.setItem(MAINTENANCES_KEY, JSON.stringify(INITIAL_MAINTENANCES));
      return INITIAL_MAINTENANCES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler manutenções do localStorage:', error);
    return INITIAL_MAINTENANCES;
  }
}

export function saveStoredMaintenances(maintenances: MaintenanceRecord[]): void {
  try {
    localStorage.setItem(MAINTENANCES_KEY, JSON.stringify(maintenances));
  } catch (error) {
    console.error('Erro ao salvar manutenções no localStorage:', error);
  }
}

export function getStoredAlerts(): AlertReminder[] {
  try {
    const data = localStorage.getItem(ALERTS_KEY);
    if (!data) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler alertas do localStorage:', error);
    return INITIAL_ALERTS;
  }
}

export function saveStoredAlerts(alerts: AlertReminder[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Erro ao salvar alertas no localStorage:', error);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
  localStorage.setItem(MAINTENANCES_KEY, JSON.stringify(INITIAL_MAINTENANCES));
  localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_ALERTS));
}

export const saveVehicles = saveStoredVehicles;
export const saveMaintenances = saveStoredMaintenances;
export const saveAlerts = saveStoredAlerts;
export const resetToInitialData = resetAllDataToDefault;

export function exportAllDataAsJson(): string {
  const exportObject = {
    appName: 'AutoGestão - Frotas & Manutenção',
    version: '1.0',
    exportDate: new Date().toISOString(),
    vehicles: getStoredVehicles(),
    maintenances: getStoredMaintenances(),
    alerts: getStoredAlerts(),
  };
  return JSON.stringify(exportObject, null, 2);
}

export function importDataFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.vehicles)) {
      saveStoredVehicles(parsed.vehicles);
    }
    if (Array.isArray(parsed.maintenances)) {
      saveStoredMaintenances(parsed.maintenances);
    }
    if (Array.isArray(parsed.alerts)) {
      saveStoredAlerts(parsed.alerts);
    }
    return true;
  } catch (error) {
    console.error('Falha ao importar JSON:', error);
    return false;
  }
}
