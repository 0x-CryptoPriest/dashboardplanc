import { DashboardLayout } from "@/components/DashboardLayout";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { PageTransition } from "@/components/PageTransition";
import { Exchange, fetchPositionsView, Position } from "@/lib/planc-api";
import { useEffect, useState } from "react";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchPositionsView();
        if (isMounted) {
          setPositions(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "failed to load positions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Positions</h1>
        {error ? <div className="text-sm text-loss">{error}</div> : null}
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading positions...</div>
          ) : (
            <PositionsTable positions={positions} exchangeFilter={exchangeFilter} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default function PositionsPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
