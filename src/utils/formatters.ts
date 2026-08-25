import { AlertReminder, AlertStatusResult, Vehicle, MaintenanceCategory, MaintenanceType } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatKm(value: number): string {
  return `${new Intl.NumberFormat('pt-BR').format(value)} km`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function calculateAlertStatus(alert: AlertReminder, vehicle?: Vehicle): AlertStatusResult {
  if (alert.isCompleted) {
    return {
      status: 'completed',
      label: 'Concluído',
      details: alert.completedDate ? `Realizado em ${formatDate(alert.completedDate)}` : 'Serviço finalizado',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isDateOverdue = false;
  let isDateWarning = false;
  let daysRemaining: number | undefined = undefined;
  let dateText = '';

  if (alert.targetDate) {
    const target = new Date(alert.targetDate + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      isDateOverdue = true;
      dateText = `Atrasado há ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'dia' : 'dias'}`;
    } else if (daysRemaining === 0) {
      isDateWarning = true;
      dateText = 'Vence hoje!';
    } else if (daysRemaining <= 15) {
      isDateWarning = true;
      dateText = `Vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`;
    } else {
      dateText = `Vence em ${daysRemaining} dias (${formatDate(alert.targetDate)})`;
    }
  }

  let isKmOverdue = false;
  let isKmWarning = false;
  let kmRemaining: number | undefined = undefined;
  let kmText = '';

  if (alert.targetKm && vehicle) {
    kmRemaining = alert.targetKm - vehicle.currentKm;
    if (kmRemaining <= 0) {
      isKmOverdue = true;
      kmText = `Ultrapassou ${Math.abs(kmRemaining).toLocaleString('pt-BR')} km`;
    } else if (kmRemaining <= 1000) {
      isKmWarning = true;
      kmText = `Faltam apenas ${kmRemaining.toLocaleString('pt-BR')} km`;
    } else {
      kmText = `Faltam ${kmRemaining.toLocaleString('pt-BR')} km (em ${formatKm(alert.targetKm)})`;
    }
  }

  // Combined logic based on triggerType
  if (alert.triggerType === 'date') {
    if (isDateOverdue) {
      return { status: 'overdue', label: 'Vencido', daysRemaining, details: dateText };
    }
    if (isDateWarning) {
      return { status: 'warning', label: 'Próximo', daysRemaining, details: dateText };
    }
    return { status: 'ok', label: 'Em Dia', daysRemaining, details: dateText || 'Programado' };
  }

  if (alert.triggerType === 'km') {
    if (isKmOverdue) {
      return { status: 'overdue', label: 'Vencido por KM', kmRemaining, details: kmText };
    }
    if (isKmWarning) {
      return { status: 'warning', label: 'Próximo da KM', kmRemaining, details: kmText };
    }
    return { status: 'ok', label: 'Em Dia', kmRemaining, details: kmText || 'Programado' };
  }

  // Both
  if (isDateOverdue || isKmOverdue) {
    const reasons = [isDateOverdue ? dateText : null, isKmOverdue ? kmText : null].filter(Boolean);
    return {
      status: 'overdue',
      label: 'Vencido',
      daysRemaining,
      kmRemaining,
      details: reasons.join(' • '),
    };
  }

  if (isDateWarning || isKmWarning) {
    const reasons = [isDateWarning ? dateText : null, isKmWarning ? kmText : null].filter(Boolean);
    return {
      status: 'warning',
      label: 'Atenção / Próximo',
      daysRemaining,
      kmRemaining,
      details: reasons.join(' • '),
    };
  }

  return {
    status: 'ok',
    label: 'Em Dia',
    daysRemaining,
    kmRemaining,
    details: [dateText, kmText].filter(Boolean).join(' • ') || 'Agendado',
  };
}

export function getCategoryBadgeClass(category: MaintenanceCategory): string {
  switch (category) {
    case 'Troca de Óleo':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Revisão':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Pneus':
      return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    case 'Freios':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Suspensão':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Motor':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Elétrica':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Reparos / Funilaria':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Documentação / IPVA':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Ar-condicionado':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'Bateria':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function getTypeBadgeClass(type: MaintenanceType): string {
  switch (type) {
    case 'Preventiva':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Corretiva':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Emergencial':
      return 'bg-red-50 text-red-800 border-red-300';
    case 'Estética':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Documental':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export const PRESET_VEHICLE_PHOTOS: { label: string; url: string; category: string }[] = [
  {
    label: 'Sedan Executivo / Prata',
    category: 'Passeio / Sedan',
    url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sedan Premium / Preto',
    category: 'Passeio / Sedan',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'SUV Moderno / Branco',
    category: 'SUV',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'SUV Compacto / Cinza',
    category: 'SUV',
    url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Picape Cabine Dupla / Vermelha',
    category: 'Picape',
    url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Picape Trabalho / Branca',
    category: 'Picape',
    url: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hatchback Urbano / Azul',
    category: 'Hatch',
    url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hatchback Moderno / Cinza',
    category: 'Hatch',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Furgão / Van de Carga',
    category: 'Van',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Motocicleta Urbana / Preta',
    category: 'Moto',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Carro Elétrico / Futurista',
    category: 'Elétrico / Híbrido',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
  },
];
