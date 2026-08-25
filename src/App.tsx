import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { MaintenancesView } from './components/MaintenancesView';
import { FinancialView } from './components/FinancialView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { MaintenanceFormModal } from './components/MaintenanceFormModal';
import { AlertFormModal } from './components/AlertFormModal';
import { AttachmentModal } from './components/AttachmentModal';

import { Vehicle, MaintenanceRecord, AlertReminder } from './types';
import { 
  getStoredVehicles, 
  saveVehicles, 
  getStoredMaintenances, 
  saveMaintenances, 
  getStoredAlerts, 
  saveAlerts,
  resetToInitialData
} from './utils/storage';
import { calculateAlertStatus } from './utils/formatters';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // Main Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStoredVehicles());
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>(() => getStoredMaintenances());
  const [alerts, setAlerts] = useState<AlertReminder[]>(() => getStoredAlerts());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modal States
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);
  
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [defaultVehicleIdForMaint, setDefaultVehicleIdForMaint] = useState<string | undefined>();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertReminder | null>(null);
  const [defaultVehicleIdForAlert, setDefaultVehicleIdForAlert] = useState<string | undefined>();

  const [attachmentData, setAttachmentData] = useState<{ url: string; name: string } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to local storage
  useEffect(() => {
    saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveMaintenances(maintenances);
  }, [maintenances]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  // Urgent alerts count for badges
  const urgentAlertsCount = useMemo(() => {
    return alerts.filter(a => {
      if (a.isCompleted) return false;
      const v = vehicles.find(veh => veh.id === a.vehicleId);
      const status = calculateAlertStatus(a, v);
      return status.status === 'overdue' || status.status === 'warning';
    }).length;
  }, [alerts, vehicles]);

  // Selected vehicle for details modal
  const selectedVehicleForDetail = useMemo(() => {
    if (!detailVehicleId) return null;
    return vehicles.find(v => v.id === detailVehicleId) || null;
  }, [detailVehicleId, vehicles]);

  // ==========================================
  // VEHICLE HANDLERS
  // ==========================================
  const handleOpenNewVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (vehicleData: Partial<Vehicle>) => {
    const nowIso = new Date().toISOString();
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...vehicleData, updatedAt: nowIso } as Vehicle : v));
      showToast(`Veículo ${vehicleData.brand} ${vehicleData.model} atualizado com sucesso!`, 'success');
    } else {
      const newVehicle: Vehicle = {
        id: 'veh-' + Date.now(),
        brand: vehicleData.brand || '',
        model: vehicleData.model || '',
        yearManufacture: vehicleData.yearManufacture || new Date().getFullYear(),
        yearModel: vehicleData.yearModel || new Date().getFullYear(),
        licensePlate: (vehicleData.licensePlate || '').toUpperCase(),
        color: vehicleData.color || '',
        category: (vehicleData.category || 'Passeio / Sedan'),
        initialKm: Number(vehicleData.initialKm) || 0,
        currentKm: Number(vehicleData.currentKm) || Number(vehicleData.initialKm) || 0,
        purchasePrice: Number(vehicleData.purchasePrice) || 0,
        purchaseDate: vehicleData.purchaseDate || new Date().toISOString().split('T')[0],
        imageUrl: vehicleData.imageUrl || '',
        notes: vehicleData.notes,
        chassi: vehicleData.chassi,
        renavam: vehicleData.renavam,
        insuranceExpiry: vehicleData.insuranceExpiry,
        licensingExpiry: vehicleData.licensingExpiry,
        status: vehicleData.status || 'Ativo',
        fuelType: vehicleData.fuelType || 'Flex (Gasolina/Etanol)',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setVehicles(prev => [newVehicle, ...prev]);
      showToast(`Veículo ${newVehicle.brand} ${newVehicle.model} cadastrado com sucesso!`, 'success');
    }
    setIsVehicleModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    setVehicles(prev => prev.filter(item => item.id !== vehicleId));
    // Clean up related maintenances and alerts
    setMaintenances(prev => prev.filter(m => m.vehicleId !== vehicleId));
    setAlerts(prev => prev.filter(a => a.vehicleId !== vehicleId));
    
    if (detailVehicleId === vehicleId) {
      setDetailVehicleId(null);
    }
    showToast(`Veículo ${v ? `${v.brand} ${v.model}` : ''} removido com sucesso.`, 'info');
  };

  const handleUpdateVehicleKm = (vehicleId: string, newKm: number) => {
    const nowIso = new Date().toISOString();
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, currentKm: newKm, updatedAt: nowIso } : v));
    showToast(`Quilometragem atualizada para ${newKm.toLocaleString('pt-BR')} km.`, 'success');
  };

  // ==========================================
  // MAINTENANCE HANDLERS
  // ==========================================
  const handleOpenNewMaintenance = (vehicleId?: string) => {
    setEditingMaintenance(null);
    setDefaultVehicleIdForMaint(vehicleId);
    setIsMaintenanceModalOpen(true);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setEditingMaintenance(record);
    setDefaultVehicleIdForMaint(record.vehicleId);
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenance = (recordData: Partial<MaintenanceRecord>, updateVehicleKm: boolean = true) => {
    const nowIso = new Date().toISOString();
    if (editingMaintenance) {
      setMaintenances(prev => prev.map(m => m.id === editingMaintenance.id ? { ...m, ...recordData } as MaintenanceRecord : m));
      showToast(`Manutenção atualizada com sucesso!`, 'success');
    } else {
      const newRecord: MaintenanceRecord = {
        id: 'maint-' + Date.now(),
        vehicleId: recordData.vehicleId || '',
        type: recordData.type || 'Preventiva',
        category: recordData.category || 'Troca de Óleo',
        date: recordData.date || new Date().toISOString().split('T')[0],
        kmAtService: Number(recordData.kmAtService) || 0,
        cost: Number(recordData.cost) || 0,
        workshop: recordData.workshop || '',
        description: recordData.description || '',
        invoiceNumber: recordData.invoiceNumber,
        notes: recordData.notes,
        partsReplaced: recordData.partsReplaced || [],
        attachments: recordData.attachments || [],
        createdAt: nowIso,
      };
      setMaintenances(prev => [newRecord, ...prev]);
      showToast(`Manutenção registrada com sucesso!`, 'success');

      // Update vehicle KM if higher
      if (updateVehicleKm && newRecord.vehicleId) {
        const vehicle = vehicles.find(v => v.id === newRecord.vehicleId);
        if (vehicle && newRecord.kmAtService > vehicle.currentKm) {
          setVehicles(prev => prev.map(v => v.id === newRecord.vehicleId ? { ...v, currentKm: newRecord.kmAtService, updatedAt: nowIso } : v));
        }
      }
    }

    setIsMaintenanceModalOpen(false);
    setEditingMaintenance(null);
  };

  const handleDeleteMaintenance = (recordId: string) => {
    setMaintenances(prev => prev.filter(m => m.id !== recordId));
    showToast(`Registro de manutenção excluído.`, 'info');
  };

  // ==========================================
  // ALERT / REMINDER HANDLERS
  // ==========================================
  const handleOpenNewAlert = (vehicleId?: string) => {
    setEditingAlert(null);
    setDefaultVehicleIdForAlert(vehicleId);
    setIsAlertModalOpen(true);
  };

  const handleEditAlert = (alert: AlertReminder) => {
    setEditingAlert(alert);
    setDefaultVehicleIdForAlert(alert.vehicleId);
    setIsAlertModalOpen(true);
  };

  const handleSaveAlert = (alertData: Partial<AlertReminder>) => {
    const nowIso = new Date().toISOString();
    if (editingAlert) {
      setAlerts(prev => prev.map(a => a.id === editingAlert.id ? { ...a, ...alertData } as AlertReminder : a));
      showToast(`Alerta atualizado com sucesso!`, 'success');
    } else {
      const newAlert: AlertReminder = {
        id: 'alert-' + Date.now(),
        vehicleId: alertData.vehicleId || '',
        title: alertData.title || '',
        category: alertData.category || 'Troca de Óleo',
        triggerType: alertData.triggerType || 'both',
        targetDate: alertData.targetDate,
        targetKm: alertData.targetKm ? Number(alertData.targetKm) : undefined,
        intervalMonths: alertData.intervalMonths ? Number(alertData.intervalMonths) : undefined,
        intervalKm: alertData.intervalKm ? Number(alertData.intervalKm) : undefined,
        notes: alertData.notes,
        isCompleted: false,
        createdAt: nowIso,
      };
      setAlerts(prev => [newAlert, ...prev]);
      showToast(`Novo alerta de manutenção criado!`, 'success');
    }

    setIsAlertModalOpen(false);
    setEditingAlert(null);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast(`Alerta excluído.`, 'info');
  };

  const handleToggleCompleteAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const nextState = !a.isCompleted;
        showToast(nextState ? `Alerta marcado como concluído!` : `Alerta reaberto.`, 'info');
        return { ...a, isCompleted: nextState };
      }
      return a;
    }));
  };

  // Direct conversion of an alert into a new maintenance record
  const handleConvertAlertToMaintenance = (alert: AlertReminder) => {
    const vehicle = vehicles.find(v => v.id === alert.vehicleId);
    setEditingMaintenance({
      id: '',
      vehicleId: alert.vehicleId,
      type: 'Preventiva',
      category: alert.category,
      date: new Date().toISOString().split('T')[0],
      kmAtService: alert.targetKm || (vehicle?.currentKm || 0),
      cost: 0,
      workshop: '',
      description: alert.title,
      notes: alert.notes ? `Referente ao alerta: ${alert.notes}` : undefined,
      partsReplaced: [],
      attachments: [],
    });
    setDefaultVehicleIdForMaint(alert.vehicleId);
    setIsMaintenanceModalOpen(true);
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (confirm('Tem certeza que deseja restaurar os dados de demonstração iniciais? Seus dados atuais serão substituídos.')) {
      resetToInitialData();
      setVehicles(getStoredVehicles());
      setMaintenances(getStoredMaintenances());
      setAlerts(getStoredAlerts());
      showToast('Dados de demonstração restaurados com sucesso!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans antialiased text-gray-900 selection:bg-blue-500 selection:text-white">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-md border flex items-center space-x-3 text-xs font-semibold ${
            toast.type === 'success' ? 'bg-emerald-800 text-white border-emerald-700' :
            toast.type === 'info' ? 'bg-blue-800 text-white border-blue-700' :
            'bg-red-800 text-white border-red-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-300" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-300" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 pl-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        urgentAlertsCount={urgentAlertsCount}
        onOpenNewVehicle={handleOpenNewVehicle}
        onOpenNewMaintenance={() => handleOpenNewMaintenance()}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            vehicles={vehicles}
            maintenances={maintenances}
            alerts={alerts}
            onSelectVehicle={(vehId) => setDetailVehicleId(vehId)}
            onOpenNewVehicle={handleOpenNewVehicle}
            onOpenNewMaintenance={() => handleOpenNewMaintenance()}
            onOpenNewAlert={() => handleOpenNewAlert()}
            onNavigateTab={setCurrentTab}
            onToggleCompleteAlert={handleToggleCompleteAlert}
            onConvertAlertToMaintenance={handleConvertAlertToMaintenance}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
            maintenances={maintenances}
            alerts={alerts}
            onOpenNewVehicle={handleOpenNewVehicle}
            onSelectVehicle={(vehId) => setDetailVehicleId(vehId)}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onOpenNewMaintenance={(vehId) => handleOpenNewMaintenance(vehId)}
          />
        )}

        {currentTab === 'maintenances' && (
          <MaintenancesView
            maintenances={maintenances}
            vehicles={vehicles}
            onOpenNewMaintenance={() => handleOpenNewMaintenance()}
            onEditMaintenance={handleEditMaintenance}
            onDeleteMaintenance={handleDeleteMaintenance}
            onSelectVehicle={(vehId) => setDetailVehicleId(vehId)}
            onViewAttachment={(url, name) => setAttachmentData({ url, name })}
          />
        )}

        {currentTab === 'financial' && (
          <FinancialView
            vehicles={vehicles}
            maintenances={maintenances}
            onSelectVehicle={(vehId) => setDetailVehicleId(vehId)}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            vehicles={vehicles}
            onOpenNewAlert={() => handleOpenNewAlert()}
            onEditAlert={handleEditAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleCompleteAlert={handleToggleCompleteAlert}
            onConvertAlertToMaintenance={handleConvertAlertToMaintenance}
            onSelectVehicle={(vehId) => setDetailVehicleId(vehId)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            vehicles={vehicles}
            maintenances={maintenances}
            alerts={alerts}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-gray-200 bg-white py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-800">AutoGestão</span>
            <span>•</span>
            <span>Controle Completo de Veículos & Despesas de Manutenção</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetData}
              className="text-gray-400 hover:text-blue-600 transition-colors font-medium"
            >
              Restaurar Dados de Teste
            </button>
            <span>•</span>
            <span>{vehicles.length} Veículos na Frota</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Vehicle Detail Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          maintenances={maintenances}
          alerts={alerts}
          onClose={() => setDetailVehicleId(null)}
          onEditVehicle={handleEditVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onOpenNewMaintenance={(vehId) => handleOpenNewMaintenance(vehId)}
          onOpenNewAlert={(vehId) => handleOpenNewAlert(vehId)}
          onUpdateCurrentKm={handleUpdateVehicleKm}
          onDeleteMaintenance={handleDeleteMaintenance}
          onEditMaintenance={handleEditMaintenance}
          onViewAttachment={(url, name) => setAttachmentData({ url, name })}
        />
      )}

      {/* 2. Vehicle Form Modal (Add / Edit) */}
      {isVehicleModalOpen && (
        <VehicleFormModal
          initialVehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onClose={() => {
            setIsVehicleModalOpen(false);
            setEditingVehicle(null);
          }}
        />
      )}

      {/* 3. Maintenance Form Modal (Add / Edit) */}
      {isMaintenanceModalOpen && (
        <MaintenanceFormModal
          initialRecord={editingMaintenance}
          defaultVehicleId={defaultVehicleIdForMaint}
          vehicles={vehicles}
          onSave={handleSaveMaintenance}
          onClose={() => {
            setIsMaintenanceModalOpen(false);
            setEditingMaintenance(null);
          }}
        />
      )}

      {/* 4. Alert Form Modal (Add / Edit) */}
      {isAlertModalOpen && (
        <AlertFormModal
          initialAlert={editingAlert}
          defaultVehicleId={defaultVehicleIdForAlert}
          vehicles={vehicles}
          onSave={handleSaveAlert}
          onClose={() => {
            setIsAlertModalOpen(false);
            setEditingAlert(null);
          }}
        />
      )}

      {/* 5. Attachment Preview Lightbox */}
      {attachmentData && (
        <AttachmentModal
          url={attachmentData.url}
          name={attachmentData.name}
          onClose={() => setAttachmentData(null)}
        />
      )}
    </div>
  );
}
