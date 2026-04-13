import { Exchange } from "@/lib/planc-api";

interface ExchangeSelectorProps {
  selected: Exchange | 'all';
  onChange: (exchange: Exchange | 'all') => void;
}

const exchanges: { value: Exchange | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'binance', label: 'Binance' },
  { value: 'hyperliquid', label: 'Hyperliquid' },
];

export function ExchangeSelector({ selected, onChange }: ExchangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
      {exchanges.map((ex) => (
        <button
          key={ex.value}
          onClick={() => onChange(ex.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
            selected === ex.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
