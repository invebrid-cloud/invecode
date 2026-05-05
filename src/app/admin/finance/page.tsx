
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Landmark, TrendingUp } from "lucide-react";
import Link from "next/link";

const financeCards = [
    {
        name: "Payment Gateways",
        description: "Manage cryptocurrency, PayPal, and bank transfer settings.",
        Icon: Landmark,
        href: "/admin/payment-gateways",
    },
    {
        name: "Investment Services",
        description: "Configure investment plans and offerings for users.",
        Icon: TrendingUp,
        href: "/admin/investment-services",
    }
];

export default function FinancePage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
            <CardTitle>Finance Management</CardTitle>
            <CardDescription>Oversee payment gateways and investment offerings from one central location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {financeCards.map((card) => (
                <Link href={card.href} key={card.name} className="block rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <card.Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{card.name}</p>
                                <p className="text-sm text-muted-foreground">{card.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
