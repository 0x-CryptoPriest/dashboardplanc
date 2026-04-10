import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changePercent?: number;
  icon: LucideIcon;
  delay?: number;
}

export function MetricCard({ title, value, change, changePercent, icon: Icon, delay = 0 }: MetricCardProps) {
  const isPositive = changePercent !== undefined ? changePercent >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-lg border border-border bg-card p-4 hover:border-glow transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="font-mono text-xl font-bold text-foreground">{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-mono font-medium ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
          {changePercent !== undefined && (
            <span className={`text-xs font-mono ${isPositive ? 'text-profit' : 'text-loss'}`}>
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
