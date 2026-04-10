import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { PageTransition } from "@/components/PageTransition";
import { mockOrders, Exchange } from "@/lib/mock-data";

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Orders</h1>
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          <OrdersTable orders={mockOrders} exchangeFilter={exchangeFilter} />
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
