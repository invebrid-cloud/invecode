"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Activity } from "lucide-react";
import { apiFetch } from "@/hooks/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

async function fetchTransactions() {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trans/me`);
  if (!res) throw new Error("Failed to fetch transactions");
  return res.json();
}

export function ActivitySummaryCard({ isPublic = false }: { isPublic?: boolean }) {
  const { user } = useUser();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["userTransactions"],
    queryFn: fetchTransactions,
    enabled: !!user || isPublic,
  });

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const userPendingDeposits = safeTransactions
    .filter((tx) => tx.type === "Deposit" && tx.status === "Pending")
    .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

  const userPendingWithdrawals = safeTransactions
    .filter((tx) => tx.type === "Withdrawal" && tx.status === "Pending")
    .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

  const userActiveInvestments = safeTransactions.filter(
    (tx) => tx.type === "Investment" && tx.status === "Running"
  ).length;

  return (
    <Card className="shadow-md border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">Activity Summary</CardTitle>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending Deposit</p>
            <p className="text-base sm:text-lg font-bold">
              {isLoading && !transactions.length ? (
                <span className="inline-block w-16 h-5 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(userPendingDeposits)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending Withdrawal</p>
            <p className="text-base sm:text-lg font-bold">
              {isLoading && !transactions.length ? (
                <span className="inline-block w-16 h-5 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(userPendingWithdrawals)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active Investments</p>
            <p className="text-base sm:text-2xl font-bold">
              {isLoading && !transactions.length ? (
                <span className="inline-block w-8 h-5 animate-pulse bg-muted rounded" />
              ) : (
                userActiveInvestments
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}