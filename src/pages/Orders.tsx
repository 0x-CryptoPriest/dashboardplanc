import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { PageTransition } from "@/components/PageTransition";
import { SkeletonTable } from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";
import { Exchange, fetchOrdersView, Order } from "@/lib/planc-api";
import { useEffect, useState } from "react";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersView();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load orders");
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
      await loadOrders();
    };

    void load();
    const timer = window.setInterval(() => {
      if (isMounted) {
        void loadOrders().catch(() => null);
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
        <h1 className="text-lg font-bold text-foreground">Orders</h1>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadOrders()}>
              Retry
            </Button>
          </div>
        ) : null}
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          {isLoading ? (
            <SkeletonTable rows={8} />
          ) : (
            <OrdersTable orders={orders} exchangeFilter={exchangeFilter} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default function OrdersPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
