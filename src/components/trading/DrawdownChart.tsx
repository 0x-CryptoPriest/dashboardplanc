import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DrawdownPoint } from "@/lib/planc-api";

interface DrawdownChartProps {
  data?: DrawdownPoint[];
}

export function DrawdownChart({ data = [] }: DrawdownChartProps) {
  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">No drawdown data available.</div>;
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={0} />
              <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={["auto", 0]}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
            formatter={(value: number) => [`${value}%`, "Drawdown"]}
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="hsl(var(--loss))"
            strokeWidth={2}
            fill="url(#ddGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
