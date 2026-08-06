"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/api";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  Calendar,
  Layers,
  CreditCard,
} from "lucide-react";

interface Transaction {
  id: string | number;
  date: string;
  type: string;
  details: any;
  amount: number;
  status: string;
  createdAt?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Completed":
    case "Profit":
      return "success";
    case "Pending":
      return "default";
    case "Running":
      return "warning";
    case "Failed":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
    case "Profit":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "Pending":
    case "Running":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "Failed":
      return <XCircle className="h-4 w-4 text-rose-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-400" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Deposit":
      return <ArrowDownLeft className="h-5 w-5 text-emerald-500" />;
    case "Withdrawal":
      return <ArrowUpRight className="h-5 w-5 text-rose-500" />;
    case "Investment":
    case "Profit":
      return <TrendingUp className="h-5 w-5 text-amber-500" />;
    default:
      return <CreditCard className="h-5 w-5 text-primary" />;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const formatFullDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

async function fetchTransactions(): Promise<Transaction[]> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trans/me`);
  if (!res || !res.ok) return [];
  const data = await res.json();
  return data.map((tx: any) => ({
    ...tx,
    amount: Number(tx.amount),
  }));
}

function TransactionsSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Modern Horizontal (X-Axis) Modal Component with Status-Aware Progress Bar */
function calculateProgress(
  status: string,
  startDateStr?: string,
  endDateStr?: string
): { percentage: number; label: string; isCompleted: boolean } {
  const isCompletedStatus = status?.toLowerCase() === "completed";

  if (isCompletedStatus) {
    return { percentage: 100, label: "100%", isCompleted: true };
  }

  if (!startDateStr || !endDateStr) {
    return { percentage: 0, label: "0%", isCompleted: false };
  }

  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const now = Date.now();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return { percentage: 0, label: "0%", isCompleted: false };
  }

  if (now >= end) {
    return { percentage: 100, label: "100%", isCompleted: true };
  }

  if (now <= start) {
    return { percentage: 0, label: "0%", isCompleted: false };
  }

  const totalDuration = end - start;
  const elapsed = now - start;
  const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return { percentage, label: `${percentage}%`, isCompleted: false };
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!transaction) return null;

  const isPositive =
    transaction.type === "Deposit" || transaction.type === "Profit";

  const detailsObj =
    typeof transaction.details === "object" && transaction.details
      ? transaction.details
      : {};

  // Compute investment progress if applicable
  const isInvestment = transaction.type === "Investment";
  const investmentProgress = isInvestment
    ? calculateProgress(
      transaction.status,
      detailsObj.startedAt,
      detailsObj.endsAt || detailsObj.endDate
    )
    : null;

  const renderCustomDetails = () => {
    switch (transaction.type) {
      case "Investment":
        return [
          { label: "ROI", value: detailsObj.roi ? `${detailsObj.roi}%` : null },
          { label: "Duration", value: detailsObj.duration },
          { label: "Started At", value: detailsObj.startedAt ? formatDate(detailsObj.startedAt) : null },
          { label: "End Date", value: detailsObj.endsAt ? formatDate(detailsObj.endsAt) : detailsObj.endDate ? formatDate(detailsObj.endDate) : null },
          { label: "Offerer", value: detailsObj.offerer },
          { label: "Total Payout", value: detailsObj.totalPayout ? formatCurrency(Number(detailsObj.totalPayout)) : null },
        ];

      case "Deposit": {
        const method = detailsObj.methodType || detailsObj.method;
        const isBank = method?.toLowerCase().includes("bank");
        return [
          { label: "Method", value: method },
          { label: "Coin/Bank", value: isBank ? "Bank Transfer" : detailsObj.coin },
          { label: "Tx ID", value: detailsObj.txId || detailsObj.transactionId || detailsObj.hash },
        ];
      }

      case "Withdrawal":
        return [
          { label: "Method", value: detailsObj.methodType },
          { label: "Coin", value: detailsObj.selectedCoin },
          { label: "Address", value: detailsObj.walletAddress },
        ];

      default:
        return typeof transaction.details === "string"
          ? [{ label: "Description", value: transaction.details }]
          : Object.entries(detailsObj).map(([k, v]) => ({
            label: k.replace(/([A-Z])/g, " $1"),
            value: String(v),
          }));
    }
  };

  const filteredDetails = renderCustomDetails().filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== ""
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden border-none shadow-xl rounded-2xl [&>button]:right-3 [&>button]:top-3 [&>button]:z-20 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:p-1.5 [&>button]:rounded-full">
        {/* Horizontal Container */}
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] min-h-[200px]">
          {/* Left Panel: Summary & Amount */}
          <div className="bg-muted/40 p-5 flex flex-col justify-between items-center text-center border-b sm:border-b-0 sm:border-r border-border relative">
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-background border shadow-xs mb-2">
                {getTypeIcon(transaction.type)}
              </div>
              <DialogTitle className="text-base font-semibold tracking-tight">
                {transaction.type}
              </DialogTitle>

              <div className="mt-2 text-center">
                <span
                  className={cn(
                    "text-xl font-extrabold tracking-tight font-mono block",
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-900 dark:text-slate-100"
                  )}
                >
                  {isPositive
                    ? "+"
                    : transaction.type === "Withdrawal"
                      ? "-"
                      : ""}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background border text-xs font-medium">
              {getStatusIcon(transaction.status)}
              <span className="capitalize">{transaction.status}</span>
            </div>
          </div>

          {/* Right Panel: Transaction Details */}
          <div className="p-5 flex flex-col justify-between space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2 pr-8 sm:pr-6">
              <span className="text-muted-foreground">Transaction Ref</span>
              <span className="font-mono font-semibold">
                #{String(transaction.id).slice(-8)}
              </span>
            </div>

            {/* 2-Column Metadata Header Grid */}
            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date & Time
                </span>
                <p className="font-medium text-foreground">
                  {formatFullDateTime(
                    transaction.date || transaction.createdAt || ""
                  )}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Category
                </span>
                <p className="font-medium text-foreground">{transaction.type}</p>
              </div>
            </div>

            {/* Investment Progress Bar (Status Conditioned) */}
            {isInvestment && investmentProgress && (
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    Investment Progress
                  </span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      investmentProgress.isCompleted
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-indigo-600 dark:text-indigo-400"
                    )}
                  >
                    {investmentProgress.label}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 w-full rounded-full overflow-hidden",
                    investmentProgress.isCompleted
                      ? "bg-teal-100 dark:bg-teal-950/50"
                      : "bg-indigo-100/70 dark:bg-indigo-950/50"
                  )}
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-300 ease-in-out rounded-full",
                      investmentProgress.isCompleted
                        ? "bg-teal-500 dark:bg-teal-400"
                        : "bg-indigo-500 dark:bg-indigo-400"
                    )}
                    style={{ width: `${investmentProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Responsive Details Box */}
            <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Details
              </span>
              {filteredDetails.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {filteredDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center gap-2 border-b sm:border-b-0 pb-1 sm:pb-0 border-border/50"
                    >
                      <span className="text-muted-foreground capitalize text-[11px] shrink-0">
                        {item.label}:
                      </span>
                      <span
                        className="font-mono font-medium text-foreground truncate max-w-[150px] sm:max-w-[120px]"
                        title={String(item.value)}
                      >
                        {String(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-[11px]">
                  No specific details available.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TransactionTable({
  transactions,
  onSelectTransaction,
}: {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground mt-8">
        No transactions to display.
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(tx.type)}
                  <span>{tx.type}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground  truncate">
                {typeof tx.details === "object"
                  ? tx.details?.methodType ||
                  tx.details?.bankName ||
                  tx.details?.coin ||
                  tx.details?.offerer ||
                  "-"
                  : tx.details}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold font-mono",
                  tx.type === "Deposit" || tx.type === "Profit"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : tx.type === "Withdrawal"
                      ? "text-rose-600 dark:text-rose-400"
                      : ""
                )}
              >
                {tx.type === "Deposit" || tx.type === "Profit"
                  ? "+"
                  : tx.type === "Withdrawal"
                    ? "-"
                    : ""}
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={getStatusVariant(tx.status)}
                  className="capitalize shadow-none"
                >
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

export default function TransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["userTransactions"],
    queryFn: fetchTransactions,
  });

  const deposits = transactions.filter((tx) => tx.type === "Deposit");
  const withdrawals = transactions.filter((tx) => tx.type === "Withdrawal");
  const investments = transactions.filter(
    (tx) => tx.type === "Investment" || tx.type === "Profit"
  );

  const { totalIn, totalOut } = useMemo(() => {
    let moneyIn = 0;
    let moneyOut = 0;

    transactions.forEach((tx) => {
      const statusLower = (tx.status || "").toLowerCase();

      if (statusLower === "completed") {
        if (tx.type === "Deposit") {
          moneyIn += Number(tx.amount);
        } else if (tx.type === "Investment") {
          const payoutAmount = tx.details?.expectedProfit;
          moneyIn += Number(payoutAmount);
        } else if (tx.type === "Withdrawal") {
          moneyOut += Number(tx.amount);
        }
      }
    });

    return { totalIn: moneyIn, totalOut: moneyOut };
  }, [transactions]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            A record of your recent account activity.
          </CardDescription>

          {/* Summary Display */}
          <div className="flex gap-4 pt-2 text-[11px] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">In:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIn)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l pl-4 border-border">
              <span className="text-muted-foreground">Out:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalOut)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="investments">Investments & Profits</TabsTrigger>
            </TabsList>

            {isLoading && transactions.length === 0 ? (
              <div className="mt-4">
                <TransactionsSkeleton />
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-4">
                  <TransactionTable
                    transactions={transactions}
                    onSelectTransaction={setSelectedTx}
                  />
                </TabsContent>
                <TabsContent value="deposits" className="mt-4">
                  <TransactionTable
                    transactions={deposits}
                    onSelectTransaction={setSelectedTx}
                  />
                </TabsContent>
                <TabsContent value="withdrawals" className="mt-4">
                  <TransactionTable
                    transactions={withdrawals}
                    onSelectTransaction={setSelectedTx}
                  />
                </TabsContent>
                <TabsContent value="investments" className="mt-4">
                  <TransactionTable
                    transactions={investments}
                    onSelectTransaction={setSelectedTx}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modern Modal Component */}
      <TransactionDetailsModal
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}