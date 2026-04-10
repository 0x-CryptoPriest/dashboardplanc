import { mockRiskMetrics } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const statusIcon = {
  good: ShieldCheck,
  warning: ShieldAlert,
  danger: ShieldX,
};

const statusColor = {
  good: 'text-profit',
  warning: 'text-warning',
  danger: 'text-loss',
};

export function RiskPanel() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {mockRiskMetrics.map((metric, i) => {
        const Icon = statusIcon[metric.status];
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border/50"
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-3.5 w-3.5 ${statusColor[metric.status]}`} />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <span className={`font-mono text-sm font-medium ${statusColor[metric.status]}`}>
              {metric.value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
