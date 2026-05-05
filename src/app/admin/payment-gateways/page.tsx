
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, Landmark, MoreVertical, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const PaypalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="h-8 w-8">
        <path d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4 .7-69.5-23.5-69.5-23.5zM62.6 140.3c-3.3 16.2-3.3 16.2-3.3 16.2-1.2 .2-2.3 .4-3.4 .5L25.3 256h39.8c4.4 0 7.9-3.5 8.1-7.9l3-22.8c1-7.6 8.7-13.3 16.5-13.3h33.4c25.5 0 54-13.4 54-44.3 0-26.1-19.1-39.4-44.9-39.4-21.2 0-33.4 10-33.4 10-1.8 1-2.9 2.4-2.9 4.3l-5.6 40.5z"/>
    </svg>
)

const paymentMethods = [
    {
        name: "Cryptocurrency",
        description: "Manage Bitcoin, Ethereum, and other crypto wallets.",
        Icon: () => <Bitcoin className="h-8 w-8" />,
        href: "/admin/payment-gateways/crypto",
    },
    {
        name: "PayPal",
        description: "Manage your PayPal business account.",
        Icon: PaypalIcon,
        href: "/admin/payment-gateways/paypal",
    },
    {
        name: "Bank Transfer",
        description: "Manage bank accounts for wire transfers.",
        Icon: () => <Landmark className="h-8 w-8" />,
        href: "/admin/payment-gateways/bank-transfer",
    }
];

export default function PaymentGatewaysPage() {
  const { toast } = useToast();

  const handleAddGateway = () => {
    // This is a mock function. In a real app, you'd handle form state
    // and submission to your backend.
    toast({
      title: "Gateway Added",
      description: "The new payment gateway has been successfully added.",
    });
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="md:order-1 order-2">
            <CardTitle>Payment Gateways</CardTitle>
            <CardDescription>Select a payment method to manage its settings.</CardDescription>
          </div>
          <div className="md:order-2 order-1 w-full md:w-auto flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add New Gateway
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Gateway Type</DialogTitle>
                  <DialogDescription>
                    Add a new payment method category to the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gateway-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="gateway-name"
                      placeholder="e.g. Skrill"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddGateway}>Save Gateway</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
                <Link href={method.href} key={method.name} className="block rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <method.Icon />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
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
