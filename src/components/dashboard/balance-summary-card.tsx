
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Wallet, ChevronDown } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { apiFetch } from "@/hooks/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function BalanceSummaryCard({ showAddMoneyButton = true, transactionHistoryHref = "/transactions", isPublic = false }: { showAddMoneyButton?: boolean, transactionHistoryHref?: string, isPublic?: boolean }) {
  const [isVisible, setIsVisible] = useState(true);
  const [userDb, setUserDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useUser();
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    const fetchUserDb = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,);
        if (!res) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUserDb(data);
      } catch (error) {
        console.error("Failed to fetch user balance", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDb();
  }, []);

  const displayAvailableBalance = userDb?.availableBalance ?? 0;
  const displayTotalBalance = userDb?.totalBalance ?? 0;

  return (
    <Card className="shadow-md border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">Balance Summary</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-start justify-between mt-4 gap-4">
          <Collapsible>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <Button variant="ghost" size="icon" onClick={toggleVisibility} className="h-6 w-6">
                  {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="sr-only">{isVisible ? 'Hide balances' : 'Show balances'}</span>
                </Button>
              </div>
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <p className="text-xl sm:text-2xl font-bold">{isVisible ? formatCurrency(displayAvailableBalance) : '****.**'}</p>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-4">
              <div className="pl-1">
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-base sm:text-lg font-semibold">{isVisible ? formatCurrency(displayTotalBalance) : '****.**'}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
              <Link href={transactionHistoryHref}>Transaction History</Link>
            </Button>
            {showAddMoneyButton && (
              <Button asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <Link href="/deposit">Add Money</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
