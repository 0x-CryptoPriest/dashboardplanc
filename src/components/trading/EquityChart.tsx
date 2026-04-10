import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { generateEquityCurve } from "@/lib/mock-data";

export function EquityChart() {
  const data = useMemo(() => generateEquityCurve(), []);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(215, 15%, 50%)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="hsl(215, 15%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(220, 25%, 8%)',
              border: '1px solid hsl(220, 20%, 14%)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
            }}
            labelStyle={{ color: 'hsl(215, 15%, 50%)' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="hsl(215, 15%, 50%)"
            strokeWidth={1}
            fill="url(#benchGrad)"
            name="Benchmark"
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="hsl(190, 95%, 50%)"
            strokeWidth={2}
            fill="url(#equityGrad)"
            name="Portfolio"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
