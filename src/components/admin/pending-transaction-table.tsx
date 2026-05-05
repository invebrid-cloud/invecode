"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";

type Transaction = {
  id: string;
  userId: string;
  date: string;
  amount: number;
  type: 'Deposit' | 'Profit' | 'Withdrawal' | 'Investment';
  status: string;
  details?: any;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'default';
    case 'Running': return 'warning';
    case 'Failed': return 'destructive';
    default: return 'outline';
  }
};

export function PendingTransactionTable({ transactions, onRemove, }: { transactions: Transaction[]; onRemove: (id: string) => void; }) {
  // const [localTransactions, setLocalTransactions] = useState(transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRowClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const isActionDisabled = (tx: Transaction | null) => {
    if (!tx) return true;
    if (tx.type !== "Investment") return false;
    const endsAtStr = tx.details?.endsAt;
    if (!endsAtStr) return true;
    return new Date() < new Date(endsAtStr);
  };

  const handleAction = async (action: 'confirm' | 'reject') => {
    if (!selectedTransaction) return;

    try {
      setSubmitting(true);
      const tempStatus = action === 'confirm' ? 'Confirming…' : 'Rejecting…';
      setSelectedTransaction({ ...selectedTransaction, status: tempStatus });

     const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trans/${selectedTransaction.id}/${selectedTransaction.userId}/${action}`,
        { method: "POST" }
      );

      if (!res || !res.ok) {
        throw new Error("Failed to authorize transaction");
      }

      const data = await res.json();

      toast({
        variant: "success",
        title: data.message,
        description: `Transaction ID ${selectedTransaction.id} processed.`,
        duration: 1500,
      });

      // Remove the transaction from the master list
      // setLocalTransactions(prev => prev.filter(tx => tx.id !== selectedTransaction.id));
      onRemove(selectedTransaction.id);
      setIsModalOpen(false);
      setSelectedTransaction(null);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Transaction could not be processed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!transactions.length) {
    return <p className="text-center text-muted-foreground mt-8">No transactions to display.</p>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer">
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {typeof tx.details === "object"
                    ? tx.details?.methodType || tx.details?.bankName || tx.details?.coin || tx.details?.offerer || "-"
                    : tx.details}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    tx.type === 'Deposit' && 'text-accent',
                    tx.type === 'Withdrawal' && 'text-destructive'
                  )}
                >
                  {tx.type === 'Deposit' ? '+' : tx.type === 'Withdrawal' ? '-' : ''}
                  {formatCurrency(tx.amount)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Review the transaction and confirm or reject it.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="py-4 space-y-4">
              <div className="flex justify-between"><span>ID:</span><span className="font-mono">{selectedTransaction.id}</span></div>
              <div className="flex justify-between"><span>User_ID:</span><span className="font-mono">{selectedTransaction.userId}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{selectedTransaction.date}</span></div>
              <div className="flex justify-between"><span>Type:</span><span>{selectedTransaction.type}</span></div>
              <div className="flex justify-between"><span>Amount:</span><span className="font-bold">{formatCurrency(selectedTransaction.amount)}</span></div>
              <div className="flex justify-between"><span>Status:</span>
                <Badge variant={getStatusVariant(selectedTransaction.status)} className="capitalize">
                  {selectedTransaction.status}
                </Badge>
              </div>
              {isActionDisabled(selectedTransaction) && selectedTransaction.type === "Investment" && (
                <p className="text-sm text-yellow-600">
                  This investment is still running. Actions will be available after {new Date(selectedTransaction.details.endsAt).toLocaleDateString()}.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive"
              onClick={() => handleAction('reject')}
              disabled={isActionDisabled(selectedTransaction) || submitting}>
              {submitting && selectedTransaction?.status.startsWith('Reject') ? 'Rejecting…' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleAction('confirm')}
              disabled={isActionDisabled(selectedTransaction) || submitting}>
              {submitting && selectedTransaction?.status.startsWith('Confirm') ? 'Confirming…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}