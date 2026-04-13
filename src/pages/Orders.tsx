import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { PageTransition } from "@/components/PageTransition";
import { Exchange, fetchOrdersView, Order } from "@/lib/planc-api";
import { useEffect, useState } from "react";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchOrdersView();
        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "failed to load orders");
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
        <h1 className="text-lg font-bold text-foreground">Orders</h1>
        {error ? <div className="text-sm text-loss">{error}</div> : null}
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading orders...</div>
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
