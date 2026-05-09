
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { allTransactions, type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/api";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed':
    case 'Profit':
      return 'success';
    case 'Pending':
      return 'default';
    case 'Running':
      return 'warning';
    case 'Failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB");
  // en-GB gives: DD/MM/YYYY
};

function TransactionTable({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No transactions to display.</p>;
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell className="text-muted-foreground">{typeof tx.details === "object"
                ? tx.details?.methodType || tx.details?.bankName || tx.details?.coin || tx.details?.offerer || "-"
                : tx.details}</TableCell>
              <TableCell className={cn(
                "text-right font-semibold",
                tx.type === 'Deposit' || tx.type === 'Profit' ? 'text-accent' :
                  tx.type === 'Withdrawal' ? 'text-destructive' : ''
              )}>
                {tx.type === 'Deposit' || tx.type === 'Profit' ? '+' : tx.type === 'Withdrawal' ? '-' : ''}{formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                  {tx.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transacs/q`
        );

        if (!res) return;

        const data = await res.json();

        // Normalize amounts (important for DECIMAL)
        const normalized = data.map((tx: any) => ({
          ...tx,
          amount: Number(tx.amount),
        }));

        setTransactions(normalized);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);


  const deposits = transactions.filter(tx => tx.type === 'Deposit');
  const withdrawals = transactions.filter(tx => tx.type === 'Withdrawal');
  const investments = transactions.filter(tx => tx.type === 'Investment' || tx.type === 'Profit');

  if (loading) {
    return <p className="p-8">Loading transactions...</p>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A record of all platform activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <TransactionTable transactions={transactions} />
            </TabsContent>
            <TabsContent value="deposits" className="mt-4">
              <TransactionTable transactions={deposits} />
            </TabsContent>
            <TabsContent value="withdrawals" className="mt-4">
              <TransactionTable transactions={withdrawals} />
            </TabsContent>
            <TabsContent value="investments" className="mt-4">
              <TransactionTable transactions={investments} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
