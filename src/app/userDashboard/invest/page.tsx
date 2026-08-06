"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Wallet, ShieldCheck, ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/hooks/api";

interface InvestmentPlan {
  id: string;
  offerer: string;
  type: string;
  roi: string;
  roiText: string;
  minAmt: string;
  maxAmt: string;
  duration: number;
  riskLevel: "Low" | "Medium" | "High";
  features: string[];
  status: "Active" | "Paused";
}

const getRiskStars = (risk: "Low" | "Medium" | "High") => {
  switch (risk) {
    case "Low":
      return 5;
    case "Medium":
      return 3;
    case "High":
      return 1;
    default:
      return 0;
  }
};

async function fetchInvestmentPlans(): Promise<InvestmentPlan[]> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invplan`);
  if (!res || !res.ok) throw new Error("Failed to fetch investment plans");
  const data = await res.json();
  return data.filter((plan: InvestmentPlan) => plan.status === "Active");
}

function InvestSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50 animate-pulse space-y-4 p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-28 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
          <div className="h-20 bg-muted rounded-xl" />
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
          <div className="h-10 bg-muted rounded" />
        </Card>
      ))}
    </div>
  );
}

export default function InvestPage() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["investmentPlans"],
    queryFn: fetchInvestmentPlans,
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center space-y-2">
        <Badge variant="outline" className="px-3 py-1 text-primary border-primary/30 bg-primary/5">
          Available Plans
        </Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Investment Opportunities</h2>
        <p className="text-muted-foreground max-w-lg">
          Maximize your wealth with our curated selection of high-yield investment strategies.
        </p>
      </div>

      {isLoading && plans.length === 0 ? (
        <InvestSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-500" />

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold capitalize">{plan.offerer}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{plan.type}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      plan.riskLevel === "Low"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : plan.riskLevel === "Medium"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {plan.riskLevel} Risk <br />
                    <div className="flex justify-center mt-1 ml-1">
                      {Array.from({ length: getRiskStars(plan.riskLevel) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-secondary/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-primary tracking-tight">{plan.roiText}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Fixed Return</p>
                  </div>
                  <div className="bg-background p-2 rounded-full shadow-inner">
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-muted-foreground gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">Minimum</span>
                    </div>
                    <p className="text-sm font-bold">${Number(plan.minAmt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-muted-foreground gap-1.5">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">Duration</span>
                    </div>
                    <p className="text-sm font-bold">{plan.duration} Days</p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  {plan.features?.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary/60" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full h-11 shadow-md hover:shadow-primary/25 transition-all">
                  <Link href={`/userDashboard/invest/${plan.id}`}>Invest Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}