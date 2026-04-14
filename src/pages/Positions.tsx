import { DashboardLayout } from "@/components/DashboardLayout";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { PageTransition } from "@/components/PageTransition";
import { SkeletonTable } from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";
import { Exchange, fetchPositionsView, Position } from "@/lib/planc-api";
import { useEffect, useState } from "react";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPositionsView();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) {
        return;
      }
      await loadPositions();
    };

    void load();
    const timer = window.setInterval(() => {
      if (isMounted) {
        void loadPositions().catch(() => null);
      }
    }, 20_000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Positions</h1>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadPositions()}>
              Retry
            </Button>
          </div>
        ) : null}
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          {isLoading ? (
            <SkeletonTable rows={8} />
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
