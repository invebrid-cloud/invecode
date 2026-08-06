"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";
import { useUser } from "@/hooks/use-user";

async function fetchCryptoOptions() {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payoptions`);
  if (!res || !res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.rows || [data];
  const crypto = list.find((opt: any) => opt.type === "crypto");
  if (crypto?.options) {
    return typeof crypto.options === "string" ? JSON.parse(crypto.options) : crypto.options;
  }
  return [];
}

async function fetchUserData() {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
  if (!res || !res.ok) return null;
  return res.json();
}

function WithdrawSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>
      <div className="h-10 w-full bg-muted rounded" />
    </div>
  );
}

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: cryptoOptions = [], isLoading: cryptoLoading } = useQuery({
    queryKey: ["cryptoWithdrawOptions"],
    queryFn: fetchCryptoOptions,
  });

  const { data: userDb, isLoading: userLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserData,
    enabled: !!user,
  });

  useEffect(() => {
    if (cryptoOptions.length > 0 && !selectedCoin) {
      setSelectedCoin(cryptoOptions[0]);
      setSelectedNetwork(cryptoOptions[0].networks?.[0] || null);
    }
  }, [cryptoOptions, selectedCoin]);

  const handleCoinChange = (symbol: string) => {
    const coin = cryptoOptions.find((c: any) => c.symbol === symbol);
    setSelectedCoin(coin);
    setSelectedNetwork(coin?.networks?.[0] || null);
  };

  const handleNetworkChange = (name: string) => {
    const network = selectedCoin?.networks?.find((n: any) => n.name === name);
    setSelectedNetwork(network);
  };

  const handleWithdraw = async () => {
    if (!user || userDb?.status !== "Active") {
      const status = userDb?.status || "Pending";
      toast({
        variant: "destructive",
        title: `Account is ${status}`,
        description: `Your account is ${status} approval. Please contact support.`,
        duration: 1500,
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount < 100) {
      toast({
        variant: "destructive",
        title: "Below Minimum Amount",
        description: "Minimum withdrawal amount is $100.",
        duration: 1500,
      });
      return;
    } else if (numericAmount <= 0 || isNaN(numericAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid amount.",
        duration: 1500,
      });
      return;
    } else if (!walletAddress) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a wallet address.",
        duration: 1500,
      });
      return;
    }

    if (numericAmount > (userDb?.availableBalance || 0)) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You can withdraw up to ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(userDb?.availableBalance || 0)}.`,
        duration: 1500,
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submitWithd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          details: {
            methodType: "crypto",
            selectedCoin: selectedCoin?.name,
            selectedNetwork: selectedNetwork?.name,
            walletAddress,
          },
        }),
      });

      if (!res || !res.ok) throw new Error("Withdrawal submission failed");

      const data = await res.json();

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });

      toast({
        variant: "success",
        title: data.message,
        description: `Your request to withdraw ${amount} USD of ${selectedCoin?.name} has been submitted.`,
        duration: 1800,
      });

      setTimeout(() => {
        router.push("/userDashboard/transactions");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: "Something went wrong.",
        duration: 1500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormLoading = cryptoLoading || userLoading;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Withdraw</CardTitle>
          <CardDescription>Withdraw funds to your external crypto wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFormLoading && cryptoOptions.length === 0 ? (
            <WithdrawSkeleton />
          ) : (
            <div className="space-y-6">
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coin">Select Coin</Label>
                  <Select value={selectedCoin?.symbol} onValueChange={handleCoinChange}>
                    <SelectTrigger id="coin">
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((coin: any) => (
                        <SelectItem key={coin.symbol} value={coin.symbol}>
                          {coin.name} ({coin.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="network">Select Network</Label>
                  <Select value={selectedNetwork?.name} onValueChange={handleNetworkChange}>
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCoin?.networks?.map((network: any) => (
                        <SelectItem key={network.name} value={network.name}>
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <div className="w-full">
                <Button onClick={handleWithdraw} className="w-full" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}