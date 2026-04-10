import { useState } from "react";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (range: string) => void;
  options?: string[];
}

const defaultOptions = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

export function TimeRangeSelector({ value, onChange, options = defaultOptions }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-muted/50">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
            value === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
