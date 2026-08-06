"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";

type CryptoNetwork = {
  name: string;
  address: string;
};

type CryptoCoin = {
  symbol: string;
  name: string;
  networks: CryptoNetwork[];
};

type BankDetails = {
  country: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swift?: string;
  routingNumber?: string;
};

type PayOption = {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Coming Soon" | "Restricted";
  options: CryptoCoin[] | BankDetails[];
};

// Extracted fetcher function for TanStack Query
async function fetchPayOptions(): Promise<PayOption[]> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payoptions`);
  if (!res || !res.ok) throw new Error("Failed to fetch payment options");

  const data: PayOption[] = await res.json();

  const formattedData = data.map((method) => ({
    ...method,
    options:
      typeof method.options === "string"
        ? JSON.parse(method.options)
        : method.options,
  }));

  const order = ["crypto", "card", "bankTransfer", "payPal"];
  return formattedData.sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
  );
}

export default function DepositPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PayOption | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null);
  const [txId, setTxId] = useState("");
  const [imageProof, setImageProof] = useState<File | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Cached payment methods request
  const { data: paymentMethods = [], isLoading: loading } = useQuery({
    queryKey: ["paymentOptions"],
    queryFn: fetchPayOptions,
  });

  // Auto-select first active payment method when options load
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      const firstActive = paymentMethods.find((m) => m.status === "Active");

      if (firstActive) {
        setSelectedMethod(firstActive);

        if (firstActive.type === "crypto") {
          const firstCoin = firstActive.options as CryptoCoin[];
          if (firstCoin.length > 0) {
            setSelectedCoin(firstCoin[0]);
            setSelectedNetwork(firstCoin[0].networks[0]);
          }
        }

        if (firstActive.type === "bankTransfer") {
          const banks = firstActive.options as BankDetails[];
          if (banks.length > 0) {
            const firstCountry = banks[0].country;
            setSelectedCountry(firstCountry);
            const firstBank = banks.find((b) => b.country === firstCountry);
            setSelectedBank(firstBank || null);
          }
        }
      }
    }
  }, [paymentMethods, selectedMethod]);

  const walletAddress = selectedNetwork?.address;

  const copyToClipboard = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Copied to clipboard!",
      description: "The wallet address has been copied.",
      duration: 1000,
    });
  };

  const handleProceed = () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount >= 100) {
      setStep(2);
    } else if (numericAmount < 100) {
      toast({
        variant: "destructive",
        title: "Below Minimum Amount",
        description: "Minimum deposit amount is $100.",
        duration: 1500,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit.",
        duration: 1500,
      });
    }
  };

  const handleConfirm = async () => {
    if (!txId && !imageProof) {
      toast({
        variant: "destructive",
        title: "Transaction ID Required",
        description: "Please provide a Transaction ID or an image of your transaction.",
        duration: 1500,
      });
      return;
    }
    if (!selectedMethod) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("methodId", selectedMethod.id);
      formData.append("methodType", selectedMethod.type);
      formData.append("txId", txId || "");

      if (selectedMethod.type === "crypto") {
        formData.append("coin", selectedCoin?.symbol || "");
        formData.append("network", selectedNetwork?.name || "");
      }

      if (selectedMethod.type === "bankTransfer") {
        formData.append("country", selectedCountry || "");
        formData.append("bankName", selectedBank?.bankName || "");
      }

      if (imageProof) {
        formData.append("proof", imageProof);
      }

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/userSubmit/deposits`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res || !res.ok) {
        throw new Error("Failed to submit deposit");
      }

      const data = await res.json();

      // Invalidate dashboard caches so numbers update automatically
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      toast({
        variant: "success",
        title: data.message,
        description: "Your deposit is being processed and will be credited shortly.",
        duration: 1500,
      });

      setTimeout(() => {
        router.replace("/userDashboard/transactions");
      }, 1800);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        duration: 1500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
          <CardDescription>Follow the steps to add funds to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={selectedMethod?.type}
                  onValueChange={(value) => {
                    const method = paymentMethods.find((m) => m.type === value);
                    if (!method || method.status !== "Active") return;

                    setSelectedMethod(method);
                    setSelectedCoin(null);
                    setSelectedNetwork(null);
                    setSelectedCountry(null);
                    setSelectedBank(null);

                    if (method.type === "crypto") {
                      const coins = method.options as CryptoCoin[];
                      if (coins.length) {
                        setSelectedCoin(coins[0]);
                        setSelectedNetwork(coins[0].networks?.[0] || null);
                      }
                    }

                    if (method.type === "bankTransfer") {
                      const banks = method.options as BankDetails[];
                      if (banks.length > 0) {
                        const firstCountry = banks[0].country;
                        setSelectedCountry(firstCountry);
                        const firstBank = banks.find((b) => b.country === firstCountry);
                        setSelectedBank(firstBank || null);
                      }
                    }
                  }}
                  className="mt-2"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={method.type}
                        id={method.type}
                        disabled={method.status !== "Active"}
                      />
                      <Label htmlFor={method.type}>
                        {method.name}
                        {method.status !== "Active" && (
                          <Badge variant="secondary" className="ml-2">
                            {method.status}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedMethod?.type === "crypto" && selectedMethod.status === "Active" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Coin</Label>
                      <Select
                        value={selectedCoin?.symbol}
                        onValueChange={(symbol) => {
                          const coins = selectedMethod.options as CryptoCoin[];
                          const coin = coins.find((c) => c.symbol === symbol) || null;
                          setSelectedCoin(coin);
                          setSelectedNetwork(coin?.networks[0] || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select coin" />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedMethod.options as CryptoCoin[]).map((coin) => (
                            <SelectItem key={coin.symbol} value={coin.symbol}>
                              {coin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="network">Select Network</Label>
                      <Select
                        value={selectedNetwork?.name}
                        onValueChange={(networkName) => {
                          const network =
                            selectedCoin?.networks.find((n) => n.name === networkName) || null;
                          setSelectedNetwork(network);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCoin?.networks.map((network) => (
                            <SelectItem key={network.name} value={network.name}>
                              {network.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {walletAddress && (
                    <div className="p-4 border rounded-lg bg-secondary/50 space-y-4 text-center">
                      <p className="text-sm text-muted-foreground">Send your funds to the address below.</p>
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
                        <p className="text-sm font-mono break-all">{walletAddress}</p>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedMethod?.type === "bankTransfer" && selectedMethod.status === "Active" && (
                <>
                  {(() => {
                    const banks = selectedMethod.options as BankDetails[];
                    const countries = Array.from(new Set(banks.map((b) => b.country)));
                    const filteredBanks = selectedCountry
                      ? banks.filter((b) => b.country === selectedCountry)
                      : [];

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Select Country</Label>
                            <Select
                              value={selectedCountry || ""}
                              onValueChange={(country) => {
                                setSelectedCountry(country);
                                const banksInCountry = banks.filter((b) => b.country === country);
                                setSelectedBank(banksInCountry[0] || null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Select Bank</Label>
                            <Select
                              value={selectedBank?.bankName || ""}
                              onValueChange={(bankName) => {
                                const bank = filteredBanks.find((b) => b.bankName === bankName) || null;
                                setSelectedBank(bank);
                              }}
                              disabled={!selectedCountry}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredBanks.map((bank) => (
                                  <SelectItem key={bank.bankName} value={bank.bankName}>
                                    {bank.bankName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {selectedBank && (
                          <div className="p-4 border rounded-lg bg-secondary/50 space-y-2 mt-4">
                            <p><strong>Bank Name:</strong> {selectedBank.bankName}</p>
                            <p><strong>Account Name:</strong> {selectedBank.accountName}</p>
                            <p><strong>Account Number:</strong> {selectedBank.accountNumber}</p>
                            {selectedBank.swift && <p><strong>SWIFT:</strong> {selectedBank.swift}</p>}
                            {selectedBank.routingNumber && <p><strong>Routing:</strong> {selectedBank.routingNumber}</p>}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}

              <Button onClick={handleProceed} className="w-full">Proceed to Confirmation</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <h3 className="font-semibold text-lg">Confirm Your Transaction</h3>
              <p className="text-sm text-muted-foreground">Provide either a transaction id(hash) or upload the transaction image</p>
              <div>
                <Label htmlFor="txid">Transaction ID (TX ID)</Label>
                <Input
                  id="txid"
                  placeholder="Enter your transaction ID"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof">Upload Image of Transaction</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="proof-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      {imageProof ? (
                        <p className="text-sm text-foreground">{imageProof.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      )}
                    </div>
                    <input
                      id="proof-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setImageProof(e.target.files ? e.target.files[0] : null)}
                    />
                  </label>
                </div>
              </div>

              <Button onClick={handleConfirm} disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Deposit"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}