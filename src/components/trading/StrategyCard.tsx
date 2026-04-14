import { Strategy } from "@/lib/planc-api";
import { StatusBadge } from "./StatusBadge";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Target, BarChart3, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StrategyCardProps {
  strategy: Strategy;
  delay?: number;
  isSubmitting?: boolean;
  onStart?: (strategy: Strategy) => void;
  onStop?: (strategy: Strategy) => void;
}

export function StrategyCard({
  strategy,
  delay = 0,
  isSubmitting = false,
  onStart,
  onStop,
}: StrategyCardProps) {
  const showControls = Boolean(onStart) && Boolean(onStop);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-lg border border-border bg-card p-4 hover:border-glow transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{strategy.name}</h3>
        <StatusBadge status={strategy.status} />
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <span className="capitalize">{strategy.exchange}</span>
        <span>·</span>
        <span>{strategy.instruments.join(', ')}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Today PnL</div>
            <div className={`font-mono text-sm font-medium ${strategy.pnlToday >= 0 ? 'text-profit' : 'text-loss'}`}>
              {strategy.pnlToday >= 0 ? '+' : ''}${strategy.pnlToday.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Total PnL</div>
            <div className={`font-mono text-sm font-medium ${strategy.pnlTotal >= 0 ? 'text-profit' : 'text-loss'}`}>
              +${strategy.pnlTotal.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Sharpe</div>
            <div className="font-mono text-sm text-foreground">{strategy.sharpeRatio}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className="font-mono text-sm text-foreground">{(strategy.winRate * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Last: <span className="text-foreground">{strategy.lastSignal}</span></span>
          <span className="text-muted-foreground">{strategy.lastSignalTime}</span>
        </div>
      </div>

      {showControls ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            disabled={isSubmitting || strategy.status === "RUNNING"}
            onClick={() => onStart?.(strategy)}
          >
            <Play className="h-3.5 w-3.5" />
            Start
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-loss hover:text-loss"
            disabled={isSubmitting || strategy.status !== "RUNNING"}
            onClick={() => onStop?.(strategy)}
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
