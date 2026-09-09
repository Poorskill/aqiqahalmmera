import { statusConfig } from '@/lib/statusConfig';

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    border: 'border-stone-300',
  };

  const getIcon = (s: string) => {
    switch (s) {
      case 'waiting_review': return 'hourglass_top';
      case 'quotation_sent': return 'request_quote';
      case 'quotation_approved': return 'check_circle';
      case 'preparing': return 'pets';
      case 'slaughtering': return 'bolt';
      case 'cooking': return 'skillet';
      case 'packaging': return 'inventory_2';
      case 'delivery': return 'local_shipping';
      case 'completed': return 'task_alt';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} shadow-xs`}>
      <span className="material-symbols-outlined text-sm">{getIcon(status)}</span>
      <span>{config.label}</span>
    </span>
  );
}
