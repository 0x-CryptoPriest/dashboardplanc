import { fetchRiskMetrics, RiskMetric } from "@/lib/planc-api";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [metrics, setMetrics] = useState<RiskMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchRiskMetrics();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "failed to load risk metrics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading risk metrics...</div>;
  }

  if (error) {
    return <div className="text-sm text-loss">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => {
        const Icon = statusIcon[metric.status];
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
