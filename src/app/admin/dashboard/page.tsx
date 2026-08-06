
import { PlatformGrowthChart } from "@/components/admin/platform-growth-chart";
import { InvestmentsOverview } from "@/components/admin/investments-overview";
import { BalanceSummaryCard } from "@/components/dashboard/balance-summary-card";
import { ActivitySummaryCard } from "@/components/admin/admins-activity-summary-card";
import { AdminActivitySummaryCard } from "@/components/admin/admin-activity-summary-card";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 mb-16 md:mb-0">
      <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2">An overview of platform activity.</p>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <BalanceSummaryCard showAddMoneyButton={false} transactionHistoryHref="/admin/transactions" isPublic />
        <ActivitySummaryCard isPublic />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <AdminActivitySummaryCard />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <PlatformGrowthChart />
      </div>
      <div>
        <InvestmentsOverview />
      </div>
    </div>
  );
}
