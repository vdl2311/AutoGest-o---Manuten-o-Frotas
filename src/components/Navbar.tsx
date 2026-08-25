import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Wrench, 
  DollarSign, 
  Bell, 
  FileText, 
  Settings, 
  Plus, 
  Menu, 
  X,
  Gauge,
  ShieldCheck
} from 'lucide-react';
import { AppTab, AlertReminder, Vehicle } from '../types';
import { calculateAlertStatus } from '../utils/formatters';

export type NavTab = AppTab;

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  urgentAlertsCount?: number;
  alerts?: AlertReminder[];
  vehicles?: Vehicle[];
  onOpenNewMaintenance: () => void;
  onOpenNewVehicle: () => void;
  onOpenNewAlert?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  urgentAlertsCount = 0,
  alerts = [],
  vehicles = [],
  onOpenNewMaintenance,
  onOpenNewVehicle,
  onOpenNewAlert,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute urgent alerts count if not passed directly
  const computedUrgentCount = urgentAlertsCount > 0 
    ? urgentAlertsCount 
    : alerts.filter(alert => {
        if (alert.isCompleted) return false;
        const vehicle = vehicles.find(v => v.id === alert.vehicleId);
        const status = calculateAlertStatus(alert, vehicle);
        return status.status === 'overdue' || status.status === 'warning';
      }).length;

  return (
    <header className="sticky top-0 z-30 bg-white text-gray-800 border-b border-gray-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div 
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  AutoGestão
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                  Frotas & Manutenção
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('vehicles')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'vehicles'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Veículos</span>
              {vehicles.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  currentTab === 'vehicles' ? 'bg-blue-200/70 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {vehicles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('maintenances')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'maintenances'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Manutenções</span>
            </button>

            <button
              onClick={() => onSelectTab('financial')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'financial'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Gastos & BI</span>
            </button>

            <button
              onClick={() => onSelectTab('alerts')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                currentTab === 'alerts'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Agenda & Alertas</span>
              {computedUrgentCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                  {computedUrgentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatórios</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-quick-new-maintenance"
              onClick={onOpenNewMaintenance}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Manutenção</span>
              <span className="sm:hidden">Serviço</span>
            </button>

            <button
              id="btn-quick-new-vehicle"
              onClick={onOpenNewVehicle}
              className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Veículo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-1 shadow-sm">
          <button
            onClick={() => { onSelectTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => { onSelectTab('vehicles'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'vehicles' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Car className="w-5 h-5" />
              <span>Veículos</span>
            </div>
            {vehicles.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {vehicles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { onSelectTab('maintenances'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'maintenances' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Wrench className="w-5 h-5" />
              <span>Manutenções</span>
            </div>
          </button>

          <button
            onClick={() => { onSelectTab('financial'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'financial' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5" />
              <span>Gastos & Financeiro</span>
            </div>
          </button>

          <button
            onClick={() => { onSelectTab('alerts'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'alerts' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5" />
              <span>Agenda & Alertas</span>
            </div>
            {computedUrgentCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {computedUrgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { onSelectTab('reports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'reports' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5" />
              <span>Relatórios</span>
            </div>
          </button>

          <div className="pt-2 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => { onOpenNewVehicle(); setMobileMenuOpen(false); }}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Veículo</span>
            </button>
            {onOpenNewAlert && (
              <button
                onClick={() => { onOpenNewAlert(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Novo Alerta</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
