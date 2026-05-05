"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { newUsers, newInvestments, totalCapital, totalPayout } from "@/lib/data";
import { BarChart2 } from "lucide-react";
import { apiFetch } from "@/hooks/api";

type Stats = {
  newUsers: number;
  newInvestments: number;
  totalCapital: number;
  totalPayout: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

export function AdminActivitySummaryCard() {
  const [stats, setStats] = useState<Stats>({
    newUsers: 0,
    newInvestments: 0,
    totalCapital: 0,
    totalPayout: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/summary`);
        if (!res) return;

        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Card className="shadow-md border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">Platform Growth</CardTitle>
        <BarChart2 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
                <p className="text-xs sm:text-sm text-muted-foreground">New Users</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(stats.newUsers)}</p>
            </div>
            <div>
                <p className="text-xs sm:text-sm text-muted-foreground">New Investments</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(stats.newInvestments)}</p>
            </div>
            <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Capital</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(stats.totalCapital)}</p>
            </div>
             <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Payout</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(stats.totalPayout)}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
