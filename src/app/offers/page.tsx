
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { investmentPlans as allInvestmentPlans, type InvestmentPlan } from "@/lib/data";
import Link from "next/link";
import { Testimonials } from "@/components/landing/testimonials";
import { Separator } from "@/components/ui/separator";

export default function OffersPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>(allInvestmentPlans);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="text-center pt-8">
        <h2 className="text-3xl font-bold tracking-tight">Investment Opportunities</h2>
        <p className="text-muted-foreground mt-2">Choose an offer that suits your financial goals.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardHeader className="bg-secondary/30 rounded-t-lg">
              <CardTitle className="text-xl text-primary">{plan.offerer}</CardTitle>
              <CardDescription className="font-semibold">{plan.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-6">
                <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-accent">{plan.roi}</p>
                    <p className="text-sm text-muted-foreground">Return on Investment</p>
                </div>
                <div className="text-center mb-6">
                    <p className="text-muted-foreground">Investment Amount</p>
                    <p className="text-lg font-bold">{plan.range}</p>
                </div>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/invest/${plan.id}`}>Invest Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Separator className="my-10" />

      <Testimonials />

      <Separator className="my-10" />

      <section className="text-center pt-8 pb-16">
            <h2 className="text-3xl font-bold tracking-tight">Have questions?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Our team is ready to provide the answers you need.</p>
            <div className="mt-8">
                <Link href="/contact" className="text-primary text-lg font-medium hover:underline flex items-center justify-center gap-2">
                    Contact Our Team <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
      </section>

    </div>
  );
}
