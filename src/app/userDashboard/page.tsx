"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/use-notifications";
import { InvestmentChart } from "@/components/dashboard/investment-chart";
import { BalanceSummaryCard } from "@/components/dashboard/balance-summary-card";
import { ActivitySummaryCard } from "@/components/dashboard/activity-summary-card";
import { useUser } from "@/hooks/use-user";
import { apiFetch } from "@/hooks/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 mb-16 md:mb-0 animate-pulse">
      {/* Top row cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-8 w-48 bg-muted rounded" />
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-3">
            <div className="h-10 w-full bg-muted rounded-md" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </CardContent>
        </Card>

        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 space-y-2">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-8 w-40 bg-muted rounded" />
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-4/5 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>

      {/* Chart section skeleton */}
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
          <div className="h-64 md:h-80 w-full bg-muted/60 rounded-lg" />
        </Card>
      </div>
    </div>
  );
}

async function fetchDashboardUserData() {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch dashboard user data", error);
    return null;
  }
}

export default function DashboardPage() {
  const { user, authLoading } = useUser();
  const { refreshNotifications } = useNotifications();

  // Cache user/dashboard profile state across navigations
  const { isLoading: isDashboardLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchDashboardUserData,
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes
  });

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  if (authLoading || isDashboardLoading || !user) {
    return <DashboardSkeleton />;
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