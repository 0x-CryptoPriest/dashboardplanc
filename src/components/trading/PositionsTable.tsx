import { Position, Exchange } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

interface PositionsTableProps {
  positions: Position[];
  exchangeFilter: Exchange | 'all';
}

export function PositionsTable({ positions, exchangeFilter }: PositionsTableProps) {
  const filtered = exchangeFilter === 'all' ? positions : positions.filter(p => p.exchange === exchangeFilter);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Symbol', 'Side', 'Size', 'Entry', 'Mark', 'PnL', 'PnL %', 'Lev', 'Exchange', 'Strategy'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
              <td className="px-3 py-2.5 font-mono font-medium text-foreground">{p.symbol}</td>
              <td className="px-3 py-2.5"><StatusBadge status={p.side} /></td>
              <td className="px-3 py-2.5 font-mono">{p.size}</td>
              <td className="px-3 py-2.5 font-mono">${p.entryPrice.toLocaleString()}</td>
              <td className="px-3 py-2.5 font-mono">${p.markPrice.toLocaleString()}</td>
              <td className={`px-3 py-2.5 font-mono font-medium ${p.unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {p.unrealizedPnl >= 0 ? '+' : ''}${p.unrealizedPnl.toLocaleString()}
              </td>
              <td className={`px-3 py-2.5 font-mono ${p.unrealizedPnlPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                {p.unrealizedPnlPercent >= 0 ? '+' : ''}{p.unrealizedPnlPercent.toFixed(2)}%
              </td>
              <td className="px-3 py-2.5 font-mono">{p.leverage}x</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">{p.exchange}</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.strategy}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">No positions</div>
      )}
    </div>
  );
}
