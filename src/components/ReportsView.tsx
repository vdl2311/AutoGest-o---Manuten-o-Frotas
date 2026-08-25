import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Car, 
  DollarSign, 
  Wrench, 
  Calendar, 
  ShieldCheck, 
  Layers,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, AlertReminder } from '../types';
import { formatCurrency, formatKm, formatDate, calculateAlertStatus } from '../utils/formatters';

interface ReportsViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceRecord[];
  alerts: AlertReminder[];
}

type ReportType = 'fleet_overview' | 'vehicle_statement' | 'financial_summary' | 'alerts_schedule';

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  maintenances,
  alerts,
}) => {
  const [reportType, setReportType] = useState<ReportType>('fleet_overview');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtered maintenance list for reporting
  const filteredMaintenances = useMemo(() => {
    const now = new Date();

    return maintenances.filter(m => {
      if (selectedVehicleId !== 'all' && m.vehicleId !== selectedVehicleId) return false;

      if (periodFilter === '30days') {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 30);
        if (new Date(m.date + 'T00:00:00') < dateLimit) return false;
      } else if (periodFilter === '90days') {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 90);
        if (new Date(m.date + 'T00:00:00') < dateLimit) return false;
      } else if (periodFilter === 'thisYear') {
        if (!m.date.startsWith(String(now.getFullYear()))) return false;
      } else if (periodFilter === 'custom') {
        if (customStartDate && m.date < customStartDate) return false;
        if (customEndDate && m.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenances, selectedVehicleId, periodFilter, customStartDate, customEndDate]);

  // Total metrics for report
  const reportTotals = useMemo(() => {
    const totalSpent = filteredMaintenances.reduce((s, m) => s + m.cost, 0);
    const count = filteredMaintenances.length;
    const avg = count > 0 ? totalSpent / count : 0;
    return { totalSpent, count, avg };
  }, [filteredMaintenances]);

  const selectedVehicleObj = vehicles.find(v => v.id === selectedVehicleId);

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'fleet_overview') {
      headers = ['Marca', 'Modelo', 'Placa', 'Ano Fab/Mod', 'Cor', 'Categoria', 'Status', 'Odometro (KM)', 'Total Gasto (R$)', 'Servicos Realizados'];
      rows = vehicles.map(v => {
        const vMaint = maintenances.filter(m => m.vehicleId === v.id);
        const total = vMaint.reduce((s, m) => s + m.cost, 0);
        return [
          v.brand,
          v.model,
          v.licensePlate,
          `${v.yearManufacture}/${v.yearModel}`,
          v.color,
          v.category,
          v.status,
          String(v.currentKm),
          total.toFixed(2),
          String(vMaint.length),
        ];
      });
    } else {
      headers = ['Data', 'Veiculo', 'Placa', 'Categoria', 'Tipo', 'KM no Servico', 'Valor (R$)', 'Oficina', 'Descricao', 'Nota Fiscal', 'Pecas'];
      rows = filteredMaintenances.map(m => {
        const v = vehicles.find(item => item.id === m.vehicleId);
        return [
          m.date,
          v ? `${v.brand} ${v.model}` : '',
          v ? v.licensePlate : '',
          m.category,
          m.type,
          String(m.kmAtService),
          m.cost.toFixed(2),
          `"${m.workshop}"`,
          `"${m.description}"`,
          m.invoiceNumber || '',
          m.partsReplaced ? `"${m.partsReplaced.join(', ')}"` : '',
        ];
      });
    }

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_manutencoes_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls (Hidden on Print) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Central de Relatórios & Exportação
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gere relatórios executivos formatados para impressão em PDF ou planilhas CSV.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs border border-gray-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Configuration Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Configurações do Relatório</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tipo de Relatório */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Modelo do Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option value="fleet_overview">1. Visão Geral Consolidada da Frota</option>
                <option value="vehicle_statement">2. Extrato e Ficha Detalhada por Veículo</option>
                <option value="financial_summary">3. Demonstrativo Financeiro por Categoria</option>
                <option value="alerts_schedule">4. Cronograma de Alertas e Manutenções Futuras</option>
              </select>
            </div>

            {/* Veículo */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Veículo Alvo
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Todos os Veículos da Frota</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Período das Manutenções
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Todo o Histórico</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="90days">Últimos 90 dias</option>
                <option value="thisYear">Ano Atual ({new Date().getFullYear()})</option>
                <option value="custom">Personalizado...</option>
              </select>
            </div>
          </div>

          {periodFilter === 'custom' && (
            <div className="flex items-center space-x-3 pt-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data Início:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="py-1.5 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data Fim:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="py-1.5 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE / EXECUTIVE REPORT DOCUMENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto print-container space-y-6 text-gray-900">
        {/* Document Header with Logo and Metadata */}
        <div className="border-b border-gray-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase text-gray-900">AutoGestão Frotas</h2>
              <p className="text-xs text-gray-500 font-medium">Sistema Integrado de Gestão & Manutenções Veiculares</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-gray-600 space-y-0.5">
            <div><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Filtro:</strong> {selectedVehicleObj ? `${selectedVehicleObj.brand} ${selectedVehicleObj.model}` : 'Frota Geral'}</div>
            <div><strong>Documento:</strong> REL-{reportType.toUpperCase()}-{Date.now().toString().slice(-4)}</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
            {reportType === 'fleet_overview' && 'Relatório Geral da Frota de Veículos'}
            {reportType === 'vehicle_statement' && 'Extrato Detalhado de Manutenções por Veículo'}
            {reportType === 'financial_summary' && 'Demonstrativo de Custos e Despesas Operacionais'}
            {reportType === 'alerts_schedule' && 'Cronograma de Alertas e Previsão de Manutenções'}
          </h3>
        </div>

        {/* Report Executive Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 font-medium uppercase text-[11px] block">Total Veículos:</span>
            <span className="text-base font-bold text-gray-900">{vehicles.length} unidades</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium uppercase text-[11px] block">Serviços Listados:</span>
            <span className="text-base font-bold text-gray-900">{reportTotals.count} registros</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium uppercase text-[11px] block">Investimento Total:</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(reportTotals.totalSpent)}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium uppercase text-[11px] block">Custo Médio / Serviço:</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(reportTotals.avg)}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: FLEET OVERVIEW */}
        {/* ===================================================================== */}
        {reportType === 'fleet_overview' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Quadro Resumo dos Veículos Cadastrados
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                  <tr>
                    <th className="py-2.5 px-3">Veículo</th>
                    <th className="py-2.5 px-2">Placa</th>
                    <th className="py-2.5 px-2">Ano</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2">Odômetro</th>
                    <th className="py-2.5 px-2">Nº Serviços</th>
                    <th className="py-2.5 px-3 text-right">Total Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map(v => {
                    const vMaint = maintenances.filter(m => m.vehicleId === v.id);
                    const spent = vMaint.reduce((s, m) => s + m.cost, 0);
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-bold text-gray-900">
                          {v.brand} {v.model}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold">{v.licensePlate}</td>
                        <td className="py-2 px-2">{v.yearManufacture}/{v.yearModel}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            v.status === 'Ativo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            v.status === 'Em Manutenção' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">{formatKm(v.currentKm)}</td>
                        <td className="py-2 px-2">{vMaint.length}</td>
                        <td className="py-2 px-3 text-right font-bold text-gray-900">
                          {formatCurrency(spent)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2 & 3: ITEMISED MAINTENANCE STATEMENT / FINANCIAL */}
        {/* ===================================================================== */}
        {(reportType === 'vehicle_statement' || reportType === 'financial_summary') && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Extrato Analítico de Serviços e Despesas
            </h4>

            {filteredMaintenances.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-xl text-center">
                Nenhum registro de manutenção para os filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                    <tr>
                      <th className="py-2 px-2">Data</th>
                      <th className="py-2 px-2">Veículo / Placa</th>
                      <th className="py-2 px-2">Categoria</th>
                      <th className="py-2 px-2">Tipo</th>
                      <th className="py-2 px-2">KM</th>
                      <th className="py-2 px-3">Oficina / Descrição</th>
                      <th className="py-2 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMaintenances.map(m => {
                      const v = vehicles.find(item => item.id === m.vehicleId);
                      return (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="py-2 px-2 whitespace-nowrap">{formatDate(m.date)}</td>
                          <td className="py-2 px-2">
                            <span className="font-bold text-gray-900 block">{v ? v.model : 'Veículo'}</span>
                            <span className="text-[10px] font-mono text-gray-500">{v ? v.licensePlate : ''}</span>
                          </td>
                          <td className="py-2 px-2 font-semibold text-gray-800">{m.category}</td>
                          <td className="py-2 px-2 text-gray-600">{m.type}</td>
                          <td className="py-2 px-2 font-mono text-[11px]">{formatKm(m.kmAtService)}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-gray-800 block">{m.workshop}</span>
                            <span className="text-[11px] text-gray-600 block">{m.description}</span>
                            {m.partsReplaced && m.partsReplaced.length > 0 && (
                              <span className="text-[10px] text-gray-400 block italic">
                                Peças: {m.partsReplaced.join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-gray-900 whitespace-nowrap">
                            {formatCurrency(m.cost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={6} className="py-2.5 px-3 text-right uppercase text-xs text-gray-700">
                        Total Geral das Manutenções:
                      </td>
                      <td className="py-2.5 px-2 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(reportTotals.totalSpent)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 4: ALERTS SCHEDULE */}
        {/* ===================================================================== */}
        {reportType === 'alerts_schedule' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Cronograma de Alertas e Vencimentos Programados
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                  <tr>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-3">Título / Serviço</th>
                    <th className="py-2 px-2">Veículo</th>
                    <th className="py-2 px-2">Gatilho</th>
                    <th className="py-2 px-2">Data Limite</th>
                    <th className="py-2 px-2">KM Limite</th>
                    <th className="py-2 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alerts.map(a => {
                    const v = vehicles.find(item => item.id === a.vehicleId);
                    const statusResult = calculateAlertStatus(a, v);
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            a.isCompleted ? 'bg-gray-100 text-gray-600' :
                            statusResult.status === 'overdue' ? 'bg-red-50 text-red-800 border border-red-200' :
                            statusResult.status === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {statusResult.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-900">{a.title}</td>
                        <td className="py-2 px-2">
                          <span>{v ? `${v.brand} ${v.model}` : 'Veículo'}</span>
                          <span className="text-[10px] font-mono text-gray-500 block">[{v?.licensePlate}]</span>
                        </td>
                        <td className="py-2 px-2 font-medium text-gray-600">
                          {a.triggerType === 'both' ? 'Data e KM' : a.triggerType === 'date' ? 'Por Data' : 'Por KM'}
                        </td>
                        <td className="py-2 px-2">{a.targetDate ? formatDate(a.targetDate) : '-'}</td>
                        <td className="py-2 px-2">{a.targetKm ? formatKm(a.targetKm) : '-'}</td>
                        <td className="py-2 px-3 text-[11px] text-gray-600">{a.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures & Auditor Block for Official Printouts */}
        <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-8 text-center text-xs text-gray-600">
          <div>
            <div className="w-48 border-b border-gray-300 mx-auto mb-1.5"></div>
            <span className="font-bold text-gray-800 block">Gestor da Frota / Responsável</span>
            <span className="text-[10px] text-gray-400">Assinatura e carimbo</span>
          </div>
          <div>
            <div className="w-48 border-b border-gray-300 mx-auto mb-1.5"></div>
            <span className="font-bold text-gray-800 block">Diretoria Financeira / Controladoria</span>
            <span className="text-[10px] text-gray-400">Aprovação de custos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
