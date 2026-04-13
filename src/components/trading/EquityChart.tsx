import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Brush } from "recharts";
import { EquityPoint } from "@/lib/planc-api";
import { TimeRangeSelector } from "@/components/trading/TimeRangeSelector";

interface EquityChartProps {
  data?: EquityPoint[];
}

export function EquityChart({ data: externalData }: EquityChartProps) {
  const fullData = useMemo(() => externalData ?? [], [externalData]);
  const [timeRange, setTimeRange] = useState("ALL");

  const data = useMemo(() => {
    const rangeMap: Record<string, number> = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
    };
    if (timeRange === "ALL") return fullData;
    const days = rangeMap[timeRange] ?? fullData.length;
    return fullData.slice(-Math.min(days, fullData.length));
  }, [fullData, timeRange]);

  if (fullData.length === 0) {
    return <div className="text-sm text-muted-foreground">No equity data available.</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "JetBrains Mono",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === "equity" ? "Portfolio" : "Benchmark",
              ]}
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              fill="url(#benchGrad)"
              name="benchmark"
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#equityGrad)"
              name="equity"
            />
            {data.length > 30 && (
              <Brush
                dataKey="date"
                height={20}
                stroke="hsl(var(--border))"
                fill="hsl(var(--card))"
                tickFormatter={(value) => value.slice(5)}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
