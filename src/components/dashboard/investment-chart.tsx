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
import { useMemo, useEffect, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { apiFetch } from "@/hooks/api";

type Transaction = {
  date: string;
  amount: number | string;
  type: "Deposit" | "Profit" | "Withdrawal" | "Investment";
  status: "Completed" | "Running" | string;
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

export function InvestmentChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    // 1. Normalize dates and types
    const processedTxs = transactions.flatMap((tx) => {
      const events = [];

      if (tx.type === "Investment") {
        // If Running or Completed: Show the initial investment date
        events.push({
          ...tx,
          displayDate: parseISO(tx.createdAt),
          displayType: "Investment Started",
          displayColor: "#eab308", // Yellow
        });

        // If Completed: Show the payout as a separate "Profit" point
        if (tx.status === "Completed" && tx.details?.endsAt) {
          events.push({
            ...tx,
            displayDate: parseISO(tx.details.endsAt),
            displayType: "Investment Paid",
            displayColor: "#22c55e", // Green
            amount: tx.details.totalPayout || tx.amount // Use payout amount
          });
        }
      } else {
        // Standard Deposits/Withdrawals
        events.push({
          ...tx,
          displayDate: parseISO(tx.date),
          displayType: tx.type,
          displayColor: tx.type === "Deposit" ? "#3b82f6" : "#ef4444",
        });
      }
      return events;
    });

    // 2. Sort all events chronologically
    const sortedEvents = processedTxs.sort(
      (a, b) => a.displayDate.getTime() - b.displayDate.getTime()
    );

    let data = [];
    let runningBalance = 0;

    // Initial Padding
    if (sortedEvents.length > 0) {
      for (let i = 2; i > 0; i--) {
        data.push({
          date: format(subDays(sortedEvents[0].displayDate, i), "MMM d"),
          balance: 0,
          pointColor: "#94a3b8",
          type: "Starting Point",
          amount: 0
        });
      }
    }

    // 3. Build Balance Line
    sortedEvents.forEach((event) => {
      const amt = Number(event.amount);

      if (event.displayType === "Deposit" || event.displayType === "Investment Paid") {
        runningBalance += amt;
      } else if (event.displayType === "Withdrawal" || event.displayType === "Investment Started") {
        runningBalance -= amt;
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trans/me`);
        if (res?.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchTransactions();
  }, []);

  return (
    <Card className="shadow-md border-none bg-card">
      <CardHeader>
        <CardTitle>Account Activity</CardTitle>
        <CardDescription>Visualizing deposits, investments, and payouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                width={60}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '4 4' }}
                trigger="hover" // You can change this to "click" if preferred
                shared={true}
              />

              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  // if (!payload.pointColor) return null;
                  const fill = payload?.pointColor || "transparent";
                  return (
                    <circle
                      key={`dot-${payload?.fullDate}-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={fill}
                      stroke="white"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  stroke: "white",
                  style: { cursor: 'pointer', filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.2))' }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}