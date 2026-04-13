import { DashboardLayout } from "@/components/DashboardLayout";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { PageTransition } from "@/components/PageTransition";
import { Exchange, fetchStrategiesView, Strategy } from "@/lib/planc-api";
import { useEffect, useState } from "react";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchStrategiesView();
        if (isMounted) {
          setStrategies(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "failed to load strategies");
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

  const filtered = exchangeFilter === 'all' ? strategies : strategies.filter((strategy) => strategy.exchange === exchangeFilter);

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Strategies</h1>
        {error ? <div className="text-sm text-loss">{error}</div> : null}
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading strategies...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((strategy, index) => (
              <StrategyCard key={strategy.id} strategy={strategy} delay={index * 0.05} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function StrategiesPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
