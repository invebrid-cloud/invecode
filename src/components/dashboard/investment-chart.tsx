"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import { format, parseISO, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { useUser } from "@/hooks/use-user";

type Transaction = {
  date: string;
  amount: number | string;
  type: "Deposit" | "Profit" | "Withdrawal" | "Investment";
  status: "Completed" | "Running" | "Pending" | "Failed" | "Rejected" | string;
  createdAt: string;
  details?: {
    endsAt?: string;
    expectedProfit?: number;
    totalPayout?: number;
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <div className="flex flex-col gap-1">
          <p className="text-[0.70rem] uppercase text-muted-foreground font-medium">
            {data.fullDate}
          </p>
          <p className="text-sm font-bold" style={{ color: data.pointColor }}>
            {data.type} {data.status ? `(${data.status})` : ""}
          </p>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-mono">${Number(data.amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm border-t pt-1 mt-1">
            <span className="text-muted-foreground">New Balance:</span>
            <span className="font-mono font-bold">${data.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

async function fetchTransactions(): Promise<Transaction[]> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trans/me`);
  if (!res?.ok) return [];
  return res.json();
}

export function InvestmentChart() {
  const { user } = useUser();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["userTransactions"],
    queryFn: fetchTransactions,
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const processedTxs = transactions.flatMap((tx) => {
      const statusLower = (tx.status || "").toLowerCase();
      const events = [];

      // Determine dot color based on status and transaction type
      let color = "#9fa9b9";
      if (statusLower === "failed" || statusLower === "rejected") {
        color = "#6b7280"; // Muted gray for failed/rejected
      } else if (statusLower === "pending") {
        color = "#f97316"; // Orange for pending
      } else if (tx.type === "Deposit") {
        color = "#3b82f6"; // Blue for deposits
      } else if (tx.type === "Withdrawal") {
        color = "#ef4444"; // Red for withdrawals
      }

      if (tx.type === "Investment") {
        const startColor =
          statusLower === "failed" || statusLower === "rejected"
            ? "#6b7280"
            : statusLower === "pending"
            ? "#f97316"
            : "#eab308"; // Yellow for running/active investment

        events.push({
          ...tx,
          displayDate: parseISO(tx.createdAt || tx.date),
          displayType: "Investment Started",
          displayColor: startColor,
        });

        // Only create a payout event if investment completed successfully
        if (statusLower === "completed" && tx.details?.endsAt) {
          events.push({
            ...tx,
            displayDate: parseISO(tx.details.endsAt),
            displayType: "Investment Paid",
            displayColor: "#22c55e", // Green for paid out investments
            amount: tx.details.totalPayout || tx.amount,
          });
        }
      } else {
        events.push({
          ...tx,
          displayDate: parseISO(tx.date || tx.createdAt),
          displayType: tx.type,
          displayColor: color,
        });
      }

      return events;
    });

    const sortedEvents = processedTxs.sort(
      (a, b) => a.displayDate.getTime() - b.displayDate.getTime()
    );

    let data = [];
    let runningBalance = 0;

    // Add baseline zero points before the first event
    if (sortedEvents.length > 0) {
      for (let i = 2; i > 0; i--) {
        data.push({
          date: format(subDays(sortedEvents[0].displayDate, i), "MMM d"),
          balance: 0,
          pointColor: "#9fa9b9",
          type: "Starting Point",
          amount: 0,
        });
      }
    }

    sortedEvents.forEach((event) => {
      const amt = Number(event.amount);
      const statusLower = (event.status || "").toLowerCase();

      // ONLY adjust running balance for active, non-pending, non-failed transactions
      const isValidTransaction =
        statusLower !== "pending" &&
        statusLower !== "failed" &&
        statusLower !== "rejected";

      if (isValidTransaction) {
        if (event.displayType === "Deposit" || event.displayType === "Investment Paid") {
          runningBalance += amt;
        } else if (
          event.displayType === "Withdrawal" ||
          event.displayType === "Investment Started"
        ) {
          runningBalance -= amt;
        }
      }

      data.push({
        date: format(event.displayDate, "MMM d"),
        fullDate: format(event.displayDate, "PPP"),
        balance: runningBalance,
        amount: amt,
        type: event.displayType,
        status: event.status,
        pointColor: event.displayColor,
      });
    });

    return data;
  }, [transactions]);

  return (
    <Card className="shadow-md border-none bg-card">
      <CardHeader>
        <CardTitle>Account Activity</CardTitle>
        <CardDescription>Visualizing deposits, investments, and payouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {isLoading && !transactions.length ? (
            <div className="h-full w-full animate-pulse bg-muted/40 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Loading chart data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  width={60}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#888", strokeWidth: 1, strokeDasharray: "4 4" }}
                  trigger="hover"
                  shared={true}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#9fa9b9"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const fill = payload?.pointColor || "#9fa9b9";
                    return (
                      <circle
                        key={`dot-${payload?.fullDate}-${cx}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={fill}
                        stroke="white"
                        strokeWidth={2}
                        style={{ cursor: "pointer" }}
                      />
                    );
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const fill = payload?.pointColor || "#9fa9b9";
                    return (
                      <circle
                        key={`activedot-${payload?.fullDate}-${cx}`}
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={fill}
                        stroke="white"
                        strokeWidth={2}
                        style={{
                          cursor: "pointer",
                          filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.2))",
                        }}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}