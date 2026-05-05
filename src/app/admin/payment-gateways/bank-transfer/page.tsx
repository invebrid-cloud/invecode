
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BankTransferPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
       <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/admin/payment-gateways">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payment Gateways
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Accounts</CardTitle>
          <CardDescription>Manage bank accounts for manual deposits and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Bank transfer account management will be available here.</p>
            <p className="text-sm">This section is under construction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
