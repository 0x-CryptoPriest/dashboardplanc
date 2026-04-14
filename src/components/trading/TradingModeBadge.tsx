import { RuntimeTradingMode } from "@/lib/planc-api";

type TradingModeBadgeProps = {
  mode: RuntimeTradingMode;
};

const MODE_STYLE: Record<
  RuntimeTradingMode,
  {
    label: string;
    className: string;
  }
> = {
  paper: {
    label: "● PAPER",
    className: "border-amber-500/35 bg-amber-500/10 text-amber-400",
  },
  live: {
    label: "● LIVE",
    className: "border-red-500/35 bg-red-500/10 text-red-400 animate-pulse",
  },
  disconnected: {
    label: "○ DISCONNECTED",
    className: "border-muted bg-muted/25 text-muted-foreground",
  },
};

export function TradingModeBadge({ mode }: TradingModeBadgeProps) {
  const config = MODE_STYLE[mode];
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-[11px] font-mono tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
