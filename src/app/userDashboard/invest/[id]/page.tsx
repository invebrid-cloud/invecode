"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function InvestmentDetailSkeleton() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 animate-pulse">
            <div className="mb-6">
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader className="space-y-3">
                        <div className="h-8 w-40 bg-muted rounded" />
                        <div className="h-5 w-24 bg-muted rounded" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded" />
                            <div className="h-8 w-20 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-16 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-muted rounded" />
                            <div className="h-6 w-36 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-muted rounded" />
                            <div className="h-6 w-24 bg-muted rounded" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="space-y-2">
                        <div className="h-6 w-44 bg-muted rounded" />
                        <div className="h-4 w-56 bg-muted rounded" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border bg-muted/40 space-y-2">
                            <div className="h-4 w-28 bg-muted rounded" />
                            <div className="h-8 w-32 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-36 bg-muted rounded" />
                            <div className="h-12 w-full bg-muted rounded" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="h-12 w-full bg-muted rounded" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

async function fetchPlan(id: string): Promise<InvestmentPlan | null> {
    try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invplan/${id}`);
        if (!res || !res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch investment plan", error);
        return null;
    }
}

async function fetchUserDb(): Promise<any> {
    try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
        if (!res || !res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch user balance", error);
        return null;
    }
}

export default function InvestmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const id = params?.id as string;
    const { user, authLoading } = useUser();

    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { data: plan, isLoading: isPlanLoading } = useQuery<InvestmentPlan | null>({
        queryKey: ["investmentPlan", id],
        queryFn: () => fetchPlan(id),
        enabled: !!id && !!user && !authLoading,
        staleTime: 1000 * 60 * 5,
    });

    const { data: userDb, isLoading: isUserLoading } = useQuery<any>({
        queryKey: ["userProfile"],
        queryFn: fetchUserDb,
        enabled: !!user && !authLoading,
        staleTime: 1000 * 60 * 5,
    });

    const loading = authLoading || isPlanLoading || isUserLoading;

    if (loading) {
        return <InvestmentDetailSkeleton />;
    }

    if (!plan) {
        return notFound();
    }

    const investmentAmount = parseFloat(amount);
    const min = Number(plan.minAmt);
    const max = Number(plan.maxAmt);
    const roiPercent = parseFloat(plan.roi.replace("%", ""));

    const isAmountValid =
        !isNaN(investmentAmount) &&
        investmentAmount >= min &&
        investmentAmount <= max;

    const profit = isAmountValid ? (investmentAmount * roiPercent) / 100 : 0;
    const totalPayout = isAmountValid ? investmentAmount + profit : 0;

    const handleConfirmInvestment = async () => {
        if (!user || userDb?.status !== 'Active') {
            const status = userDb?.status || "Inactive";
            toast({
                variant: "destructive",
                title: `Account is ${status}`,
                description: status === "Pending"
                    ? `Your account is ${status} approval. Please contact support.`
                    : `Your account is ${status}. Please contact support.`,
                duration: 1500,
            });
            return;
        }

        if (isNaN(investmentAmount) || investmentAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid investment amount.",
                duration: 1500,
            });
            return;
        }

        if (investmentAmount < min || investmentAmount > max) {
            toast({
                variant: "destructive",
                title: "Amount Out of Range",
                description: `Investment must be between ${formatCurrency(min)} and ${formatCurrency(max)}.`,
                duration: 1500,
            });
            return;
        }

        if (investmentAmount > (userDb?.availableBalance ?? 0)) {
            toast({
                variant: "destructive",
                title: "Insufficient Funds",
                description: `Your available balance is ${formatCurrency(userDb?.availableBalance ?? 0)}.`,
                duration: 1500,
            });
            setTimeout(() => {
                router.push("/deposit");
            }, 1800);
            return;
        }

        try {
            setSubmitting(true);
            const res = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/submitInve`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: investmentAmount,
                        details: {
                            planId: plan.id,
                            offerer: plan.offerer,
                            roi: plan.roi,
                            durationDays: plan.duration,
                            expectedProfit: profit,
                            totalPayout: totalPayout,
                            startedAt: new Date(),
                            endsAt: new Date(
                                Date.now() + plan.duration * 24 * 60 * 60 * 1000
                            ),
                        },
                    }),
                }
            );

            if (!res || !res.ok) {
                throw new Error("No response from server");
            }

            const data = await res.json();

            // Invalidate user cache to ensure fresh availableBalance next fetch
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });

            toast({
                variant: "success",
                title: data.message,
                description: "Your investment has been created and will be completed on duration end date.",
                duration: 1800,
            });

            setTimeout(() => {
                router.push("/userDashboard/transactions");
            }, 1900);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Investment Failed",
                description: "Something went wrong.",
                duration: 1500,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/userDashboard/invest">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Offers
                    </Link>
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary capitalize">{plan.offerer}</CardTitle>
                        <CardDescription className="text-lg font-semibold">{plan.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Return on Investment</p>
                            <p className="text-2xl font-bold text-accent">{plan.roi}</p>
                        </div>
                        <div>
                            <p
                                className={`text-sm font-semibold ${
                                    plan.riskLevel === "Low"
                                        ? "text-green-500"
                                        : plan.riskLevel === "Medium"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                }`}
                            >
                                Risk: {plan.riskLevel}
                            </p>

                            <div className="flex mt-1">
                                {Array.from({ length: getRiskStars(plan.riskLevel) }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Investment Range</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(Number(plan.minAmt))} - {formatCurrency(Number(plan.maxAmt))}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="text-lg font-bold">{plan.duration} Days</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Place Your Investment</CardTitle>
                        <CardDescription>Enter the amount you wish to invest.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border bg-secondary/30">
                            <p className="text-sm text-muted-foreground">Available Balance</p>
                            <p className="text-2xl font-bold">{formatCurrency(userDb?.availableBalance ?? 0)}</p>
                        </div>
                        <div>
                            <Label htmlFor="amount" className="text-base">Investment Amount (USD)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 text-lg mt-2"
                            />
                            {amount && (
                                <div className="mt-3 text-sm">
                                    {!isAmountValid ? (
                                        <p className="text-red-500">
                                            Amount must be between {formatCurrency(min)} and {formatCurrency(max)}.
                                        </p>
                                    ) : (
                                        <div className="p-3 border border-green-200 space-y-1">
                                            <p className="font-medium">Payout Profit</p>
                                            <p>
                                                Profit:{" "}
                                                <span className="font-semibold text-green-300">
                                                    {formatCurrency(profit)}
                                                </span>
                                            </p>
                                            <p>
                                                Total Payout:{" "}
                                                <span className="font-bold text-green-300">
                                                    {formatCurrency(totalPayout)}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full">
                            <Button
                                onClick={handleConfirmInvestment}
                                className="w-full h-12 text-lg"
                                disabled={submitting}
                            >
                                {submitting ? "Processing..." : "Confirm Investment"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}