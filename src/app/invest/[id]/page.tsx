
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { investmentPlans } from "@/lib/data";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function InvestmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { id } = params;
    const { user, authLoading } = useUser();
    const [userDb, setUserDb] = useState<any>(null);

    const [plan, setPlan] = useState<InvestmentPlan | null>(null);
    const [planLoading, setPlanLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/invplan/${id}`
                );

                if (!res) {
                    setPlanLoading(false);
                    return;
                }

                const data = await res.json();
                setPlan(data);
            } catch (error) {
                console.error("Failed to fetch investment plan", error);
            } finally {
                setPlanLoading(false);
            }
        };

        const fetchUserDb = async () => {
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,);
                if (!res) {
                    setUserLoading(false);
                    return;
                }

                const data = await res.json();
                setUserDb(data);
            } catch (error) {
                console.error("Failed to fetch user balance", error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserDb();

        if (id) {
            fetchPlan();
        }
    }, [id]);



    if (planLoading || userLoading || authLoading) {
        return <p className="p-8 text-center animate-pulse">Loading plan details...</p>;
    }

    if (!plan) {
        return notFound();
    }
    const investmentAmount = parseFloat(amount);

    const min = Number(plan.minAmt);
    const max = Number(plan.maxAmt);

    // Extract numeric ROI (e.g. "12%" → 12)
    const roiPercent = parseFloat(plan.roi.replace("%", ""));

    const isAmountValid =
        !isNaN(investmentAmount) &&
        investmentAmount >= min &&
        investmentAmount <= max;

    const profit = isAmountValid
        ? (investmentAmount * roiPercent) / 100
        : 0;

    const totalPayout = isAmountValid
        ? investmentAmount + profit
        : 0;


    const handleConfirmInvestment = async () => {
        if (!user || userDb.status !== 'Active') {
            if (userDb.status == "Pending") {
                toast({
                    variant: "destructive",
                    title: `Account is ${userDb?.status}`,
                    description: `Your account is ${userDb?.status} approval. Please contact support.`,
                    duration: 1500,
                });
                return;
            } else {
                toast({
                    variant: "destructive",
                    title: `Account is ${userDb?.status}`,
                    description: `Your account is ${userDb?.status}. Please contact support.`,
                    duration: 1500,
                });
                return;;
            }

        }

        const investmentAmount = parseFloat(amount);
        if (isNaN(investmentAmount) || investmentAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid investment amount.",
                duration: 1500,
            });
            return;
        }
        if (investmentAmount < Number(plan.minAmt) || investmentAmount > Number(plan.maxAmt)) {
            toast({
                variant: "destructive",
                title: "Amount Out of Range",
                description: `Investment must be between ${formatCurrency(Number(plan.minAmt))} and ${formatCurrency(Number(plan.maxAmt))}.`,
                duration: 1500,
            });
            return;
        }
        if (investmentAmount > userDb?.availableBalance) {
            toast({
                variant: "destructive",
                title: "Insufficient Funds",
                description: `Your available balance is ${formatCurrency(userDb?.availableBalance)}.`,
                duration: 1500,
            });
            setTimeout(async () => {
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
                        }
                    }),
                }
            );

            if (!res || !res.ok) {
                throw new Error("No response from server");
            }
            const data = await res.json();

            toast({
                variant: "success",
                title: data.message,
                description: "Your investment has been created and will be completed on duration end date.",
                duration: 1800,
            });

            setTimeout(() => {
                router.push("/transactions");
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
                    <Link href="/invest">
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
                        <div >
                            <p
                                className={`text-sm font-semibold ${plan.riskLevel === "Low"
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
                            <p className="text-muted-foreground">
                                Duration
                            </p>
                            <p className="text-lg font-bold">
                                {plan.duration} Days
                            </p>
                        </div>
                        {/* <div>
                            <p className="text-sm text-muted-foreground mb-2">Features</p>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-accent" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div> */}
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
                                            <p className="font-medium">
                                                Payout Profit </p>
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
                                className="w-full h-12 text-lg" disabled={submitting}
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
