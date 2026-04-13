import { Order, Exchange } from "@/lib/planc-api";
import { StatusBadge } from "./StatusBadge";

interface OrdersTableProps {
  orders: Order[];
  exchangeFilter: Exchange | 'all';
}

export function OrdersTable({ orders, exchangeFilter }: OrdersTableProps) {
  const filtered = exchangeFilter === 'all' ? orders : orders.filter(o => o.exchange === exchangeFilter);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Time', 'Symbol', 'Side', 'Type', 'Price', 'Qty', 'Filled', 'Status', 'Exchange', 'Strategy'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
              <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{o.time}</td>
              <td className="px-3 py-2.5 font-mono font-medium text-foreground">{o.symbol}</td>
              <td className={`px-3 py-2.5 font-mono font-medium ${o.side === 'BUY' ? 'text-profit' : 'text-loss'}`}>{o.side}</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">{o.type}</td>
              <td className="px-3 py-2.5 font-mono">${o.price.toLocaleString()}</td>
              <td className="px-3 py-2.5 font-mono">{o.quantity.toLocaleString()}</td>
              <td className="px-3 py-2.5 font-mono">{o.filled.toLocaleString()}</td>
              <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">{o.exchange}</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">{o.strategy}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">No orders</div>
      )}
    </div>
  );
}
