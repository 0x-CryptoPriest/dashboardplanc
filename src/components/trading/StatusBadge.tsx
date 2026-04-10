interface StatusBadgeProps {
  status: 'RUNNING' | 'STOPPED' | 'ERROR' | 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED' | 'LONG' | 'SHORT';
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  RUNNING: { bg: 'bg-profit/10', text: 'text-profit', dot: 'bg-profit' },
  STOPPED: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  ERROR: { bg: 'bg-loss/10', text: 'text-loss', dot: 'bg-loss' },
  OPEN: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  PARTIAL: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  FILLED: { bg: 'bg-profit/10', text: 'text-profit', dot: 'bg-profit' },
  CANCELLED: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  LONG: { bg: 'bg-profit/10', text: 'text-profit', dot: 'bg-profit' },
  SHORT: { bg: 'bg-loss/10', text: 'text-loss', dot: 'bg-loss' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.STOPPED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${status === 'RUNNING' ? 'animate-pulse-glow' : ''}`} />
      {status}
    </span>
  );
}
