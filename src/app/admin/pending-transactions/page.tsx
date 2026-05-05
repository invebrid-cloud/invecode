"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingTransactionTable } from "@/components/admin/pending-transaction-table";
import { apiFetch } from "@/hooks/api";

type Transaction = {
  id: string;
  userId: string,
  date: string;
  amount: number;
  type: 'Deposit' | 'Profit' | 'Withdrawal' | 'Investment';
  status: string;
  details?: any;
};

export default function PendingTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transacs/q`
        );
        if (!res) return;

        const data = await res.json();

        const normalized = data.map((tx: any) => ({
          ...tx,
          amount: Number(tx.amount),
        }));

        setTransactions(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // FILTERS
  const allPending = transactions.filter(tx => tx.status === "Pending" || tx.status === "Running");
  const deposits = allPending.filter(tx => tx.type === "Deposit");
  const withdrawals = allPending.filter(tx => tx.type === "Withdrawal");
  const investments = allPending.filter(tx => tx.type === "Investment");

  const handleRemoveTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>
            Review and approve pending deposits, withdrawals, and investments.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all">
                All ({allPending.length})
              </TabsTrigger>

              <TabsTrigger value="deposits">
                Deposits ({deposits.length})
              </TabsTrigger>

              <TabsTrigger value="withdrawals">
                Withdrawals ({withdrawals.length})
              </TabsTrigger>

              <TabsTrigger value="investments">
                Investments ({investments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <PendingTransactionTable transactions={allPending} onRemove={handleRemoveTransaction} />
            </TabsContent>

            <TabsContent value="deposits" className="mt-4">
              <PendingTransactionTable transactions={deposits} onRemove={handleRemoveTransaction}/>
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-4">
              <PendingTransactionTable transactions={withdrawals} onRemove={handleRemoveTransaction} />
            </TabsContent>

            <TabsContent value="investments" className="mt-4">
              <PendingTransactionTable transactions={investments} onRemove={handleRemoveTransaction}/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}