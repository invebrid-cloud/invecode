
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, ComposedChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { platformGrowthData } from "@/lib/data";

const chartConfig = {
  totalCapital: {
    label: "Total Capital",
    color: "hsl(var(--chart-1))",
  },
  totalPayout: {
    label: "Total Payout",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}


export function PlatformGrowthChart() {
  return (
    <Card className="shadow-md border-border">
      <CardHeader>
        <CardTitle>Platform Growth</CardTitle>
        <CardDescription>Total capital and payouts over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart
            accessibilityLayer
            data={platformGrowthData}
            margin={{
              left: 0,
              right: 20,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value as number)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" formatter={(value, name, item) => {
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="font-semibold">{item.payload.month}</div>
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: "hsl(var(--chart-1))"}} />
                            <span className="text-muted-foreground">Total Capital:</span>
                            <span className="font-medium text-foreground">{formatCurrency(item.payload.totalCapital)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: "hsl(var(--chart-2))"}} />
                            <span className="text-muted-foreground">Total Payout:</span>
                            <span className="font-medium text-foreground">{formatCurrency(item.payload.totalPayout)}</span>
                        </div>
                    </div>
                )
              }} />}
            />
            <Legend />
            <Line
              dataKey="totalCapital"
              type="monotone"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="totalPayout"
              type="monotone"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={true}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
