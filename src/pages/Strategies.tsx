import { DashboardLayout } from "@/components/DashboardLayout";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { PageTransition } from "@/components/PageTransition";
import { mockStrategies, Exchange } from "@/lib/mock-data";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const filtered = exchangeFilter === 'all' ? mockStrategies : mockStrategies.filter(s => s.exchange === exchangeFilter);

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Strategies</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <StrategyCard key={s.id} strategy={s} delay={i * 0.05} />
          ))}
        </div>
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
