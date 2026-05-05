
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";
import { useUser } from "@/hooks/use-user";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function WithdrawPage() {
  const router = useRouter();
  const { user, authLoading } = useUser();
  const [userDb, setUserDb] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [cryptoOptions, setCryptoOptions] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoOptions = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payoptions`,);
        if (!res) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        // console.log(data)
        const list = Array.isArray(data) ? data : data.rows || [data];

        const crypto = list.find((opt: any) => opt.type === "crypto");

        if (crypto?.options) {
          const parsedOptions =
            typeof crypto.options === "string"
              ? JSON.parse(crypto.options)
              : crypto.options;

          setCryptoOptions(parsedOptions);

          if (parsedOptions.length > 0) {
            setSelectedCoin(parsedOptions[0]);
            setSelectedNetwork(parsedOptions[0].networks[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch payment methods");
      } finally {
        setLoading(false);
      }
    };
    const fetchUserDb = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,);
        if (!res) {
          setUserLoading(false);
          return;
        }

        const data = await res.json();
        setUserDb(data);
      } catch (error) {
        console.error("Failed to fetch user balance", error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchCryptoOptions();
    fetchUserDb();
  }, []);

  if (userLoading || authLoading) {
    return <p className="p-8 text-center animate-pulse">Loading Withdrawal details...</p>;
  }

  const handleCoinChange = (symbol: string) => {
    const coin = cryptoOptions.find((c) => c.symbol === symbol);
    setSelectedCoin(coin);
    setSelectedNetwork(coin.networks[0]);
  };
  const handleNetworkChange = (name: string) => {
    const network = selectedCoin.networks.find(
      (n: any) => n.name === name
    );
    setSelectedNetwork(network);
  };

  const handleWithdraw = async () => {
    if (!user || userDb?.status !== 'Active') {
      if (userDb.status == "Pending") {
        toast({
          variant: "destructive",
          title: `Account is ${userDb?.status}`,
          description: `Your account is ${userDb?.status} approval. Please contact support.`,
          duration: 1500,
        });
        return;
      } else {
        toast({
          variant: "destructive",
          title: `Account is ${userDb?.status}`,
          description: `Your account is ${userDb?.status}. Please contact support.`,
          duration: 1500,
        });
        return;;
      }
    }

    if (parseFloat(amount) < 100) {
      toast({
        variant: "destructive",
        title: "Below Minimum Amount",
        description: "Minimum withdrawal amount is $100.",
        duration: 1500,
      });
      return;
    } else if (parseFloat(amount) <= 0 || !parseFloat(amount)) {
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
    if (parseFloat(amount) > userDb?.availableBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You can withdraw up to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(userDb?.availableBalance)}.`,
        duration: 1500,
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submitWithd`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            details: { 
            methodType: "crypto",  
            selectedCoin: selectedCoin.name, 
            selectedNetwork: selectedNetwork.name,
            walletAddress,
            }
          }),
        }
      );
      if (!res || !res.ok) {
        throw new Error("No response from server");
      }
      const data = await res.json();
      toast({
        variant: "success",
        title: data.message,
        description: `Your request to withdraw ${amount} USD of ${selectedCoin} has been submitted and will be credited to your external address shortly.`,
        duration: 1800,
      });
      setTimeout(() => {
        router.push("/transactions");
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

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Withdraw</CardTitle>
          <CardDescription>Withdraw funds to your external crypto wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input id="amount" type="number" placeholder="Enter amount to withdraw" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coin">Select Coin</Label>
                <Select value={selectedCoin?.symbol} onValueChange={handleCoinChange} >
                  <SelectTrigger id="coin">
                    <SelectValue placeholder="Select coin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoOptions.map((coin) => (
                      <SelectItem key={coin.symbol} value={coin.symbol}>
                        {coin.name} ({coin.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="network">Select Network</Label>
                <Select value={selectedNetwork?.name} onValueChange={handleNetworkChange} >
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCoin?.networks.map((network: any) => (
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
              <Input id="address" placeholder="Enter your wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            </div>

            <div className="w-full">
              <Button onClick={handleWithdraw} className="w-full" disabled={submitting}>
                {submitting ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
