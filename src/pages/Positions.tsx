import { DashboardLayout } from "@/components/DashboardLayout";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { mockPositions, Exchange } from "@/lib/mock-data";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Positions</h1>
      <div className="rounded-lg border border-border bg-card p-4">
        <PositionsTable positions={mockPositions} exchangeFilter={exchangeFilter} />
      </div>
    </div>
  );
}

export default function PositionsPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
