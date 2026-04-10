import { MonthlyReturn } from "@/lib/mock-data";

interface MonthlyHeatmapProps {
  data: MonthlyReturn[];
  compact?: boolean;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColor = (val: number) => {
  if (val > 10) return 'bg-profit/80 text-primary-foreground';
  if (val > 5) return 'bg-profit/50 text-foreground';
  if (val > 0) return 'bg-profit/20 text-foreground';
  if (val > -3) return 'bg-loss/20 text-foreground';
  if (val > -5) return 'bg-loss/50 text-foreground';
  return 'bg-loss/80 text-primary-foreground';
};

export function MonthlyHeatmap({ data, compact = false }: MonthlyHeatmapProps) {
  const years = [...new Set(data.map(d => d.year))];
  const pad = compact ? 'p-0.5' : 'p-1';
  const cellPad = compact ? 'px-1 py-1' : 'px-2 py-1.5';

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-xs ${compact ? '' : 'min-w-[600px]'}`}>
        <thead>
          <tr>
            <th className={`text-left text-muted-foreground ${pad}`}>Year</th>
            {months.map(m => <th key={m} className={`text-center text-muted-foreground ${pad}`}>{m}</th>)}
            <th className={`text-center text-muted-foreground ${pad} font-bold`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const yearData = data.filter(d => d.year === year);
            const total = yearData.reduce((s, d) => s + d.return, 0);
            return (
              <tr key={year}>
                <td className={`text-muted-foreground font-mono ${pad} font-bold`}>{year}</td>
                {months.map((_, mi) => {
                  const d = yearData.find(r => r.month === mi + 1);
                  return (
                    <td key={mi} className="p-0.5">
                      {d ? (
                        <div className={`${getColor(d.return)} rounded ${cellPad} text-center font-mono`}>
                          {d.return > 0 ? '+' : ''}{d.return.toFixed(1)}%
                        </div>
                      ) : <div className={`bg-muted/30 rounded ${cellPad} text-center text-muted-foreground`}>—</div>}
                    </td>
                  );
                })}
                <td className="p-0.5">
                  <div className={`${getColor(total)} rounded ${cellPad} text-center font-mono font-bold`}>
                    {total > 0 ? '+' : ''}{total.toFixed(1)}%
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
