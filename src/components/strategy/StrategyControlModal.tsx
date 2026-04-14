import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Strategy } from "@/lib/planc-api";
import { AlertTriangle, Play, Square } from "lucide-react";

type StrategyControlAction = "start" | "stop";

type StrategyControlModalProps = {
  open: boolean;
  strategy: Strategy | null;
  action: StrategyControlAction;
  positionCount: number;
  unrealizedPnl: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function actionLabel(action: StrategyControlAction): string {
  return action === "start" ? "启动" : "停止";
}

export function StrategyControlModal({
  open,
  strategy,
  action,
  positionCount,
  unrealizedPnl,
  isSubmitting,
  onConfirm,
  onCancel,
}: StrategyControlModalProps) {
  const strategyName = strategy?.name ?? "Unknown Strategy";
  const confirmLabel = isSubmitting ? "处理中..." : `确认${actionLabel(action)}`;
  const dangerTone = action === "stop";
  const PnLClass = unrealizedPnl >= 0 ? "text-profit" : "text-loss";
  const warningText =
    action === "stop"
      ? "停止策略不会自动平仓，当前持仓将保持不变，请确认风险后执行。"
      : "启动策略后将恢复信号与下单流程，请确认风控参数已配置正确。";

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onCancel())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认{actionLabel(action)}策略</DialogTitle>
          <DialogDescription>
            请确认是否对策略 <span className="font-semibold text-foreground">{strategyName}</span>{" "}
            执行{actionLabel(action)}操作。
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">当前状态</span>
            <span className="font-mono text-foreground">{strategy?.status ?? "UNKNOWN"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">持仓数量</span>
            <span className="font-mono text-foreground">{positionCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">未实现 PnL</span>
            <span className={`font-mono ${PnLClass}`}>
              {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{warningText}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting || strategy === null}
            className={dangerTone ? "bg-loss hover:bg-loss/90 text-white" : ""}
          >
            {action === "start" ? <Play className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
