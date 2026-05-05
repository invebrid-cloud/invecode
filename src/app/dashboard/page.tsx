
"use client";
import { useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { InvestmentChart } from "@/components/dashboard/investment-chart";
import { BalanceSummaryCard } from "@/components/dashboard/balance-summary-card";
import { ActivitySummaryCard } from "@/components/dashboard/activity-summary-card";
import { useUser } from "@/hooks/use-user";

export default function DashboardPage() {
  const { user, authLoading } = useUser();
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  if (authLoading || !user) {
    return (
      <div className="flex-1 space-y-8 p-4 md:p-8 mb-16 md:mb-0">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 mb-16 md:mb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <BalanceSummaryCard showAddMoneyButton={true} />
        <ActivitySummaryCard />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <InvestmentChart />
      </div>
    </div>
  );
}
