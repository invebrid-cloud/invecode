"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Edit, ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";

type Gateway = {
  id: string;
  coin: string;
  network: string;
  address: string;
  status: string;
  Icon: any;
};

export default function CryptoGatewayPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newCoin, setNewCoin] = useState("");
  const [newNetwork, setNewNetwork] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch crypto wallets
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/crypto`);
        if (!res || !res.ok) {
          throw new Error("Failed to authorize transaction");
        }

        const data = await res.json();
        // console.log(data);
        if (!data[0]) return;

        let parsedOptions;

        try {
          parsedOptions = typeof data[0].options === "string"
            ? JSON.parse(data[0].options)
            : data[0].options; // already parsed
        } catch (err) {
          console.error("Failed to parse options:", data[0].options, err);
          parsedOptions = [];
        }
        const flattened = parsedOptions.flatMap((coin: any) =>
          coin.networks.map((network: any) => ({
            id: `${coin.symbol}-${network.name}`,
            coin: coin.name,
            network: network.name,
            address: network.address,
            status: data[0].status,
            Icon: () => <span>{coin.symbol}</span>, // simple icon placeholder
          }))
        );

        setGateways(flattened);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGateways();
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  const handleEdit = (g: Gateway) => {
    setEditingId(g.id);
    setEditingAddress(g.address);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingAddress("");
  };

  const handleSave = async (id: string) => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/crypto`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, address: editingAddress }),
      });

      if (!res) return;

      const data = await res.json();

      setGateways((prev) =>
        prev.map((g) => (g.id === id ? { ...g, address: editingAddress } : g))
      );

      toast({
        variant: "success",
        title: "Updated",
        description: "Wallet updated",
        duration: 1500,
      });
      handleCancel();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update" });
    }
  };

  const handleAddNewGateway = async () => {
    if (!newCoin || !newNetwork || !newAddress) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Fill all fields",
        duration: 1500,
      });
      return;
    }

    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/crypto`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: newCoin, network: newNetwork, address: newAddress }),
      });

      if (!res) return;

      const data = await res.json();

      setGateways((prev) => [
        ...prev,
        {
          id: `${newCoin}-${newNetwork}`, // unique id
          coin: newCoin,
          network: newNetwork,
          address: newAddress,
          status: "Active",
          Icon: () => <span>{newCoin}</span>,
        },
      ]);

      toast({
        variant: "success",
        title: "Wallet Added",
        description: `${newCoin} wallet added`,
        duration: 1500,
      });
      setNewCoin(""); setNewNetwork(""); setNewAddress(""); setIsAddDialogOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to add wallet" });
    }
  };

  const handleRemove = async (id: string, address: string) => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/crypto`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, address }), // now both id and address exist
      });

      if (!res) return;

      const data = await res.json();

      setGateways((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Removed", description: `Wallet ${address} deleted` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete wallet" });
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (gateways.length === 0) {
    return <p className="text-center mt-10">No  crypto wallets found.</p>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/payment-gateways"><ArrowLeft className="mr-2" />Back</Link>
      </Button>

      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Crypto Wallets</CardTitle>
            <CardDescription>Manage crypto addresses</CardDescription>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2" />Add Wallet</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Wallet</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <Input placeholder="Coin" value={newCoin} onChange={e => setNewCoin(e.target.value)} />
                <Input placeholder="Network" value={newNetwork} onChange={e => setNewNetwork(e.target.value)} />
                <Input placeholder="Address" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
              </div>

              <DialogFooter>
                <Button onClick={handleAddNewGateway}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {gateways.map(g => (
            <div key={g.id} className="flex justify-between border p-4 rounded-lg">
              <div className="flex gap-3 flex-1">
                <g.Icon />
                <div className="flex-1">
                  <p className="font-semibold">{g.coin} ({g.network})</p>
                  {editingId === g.id ? (
                    <Input ref={inputRef} value={editingAddress} onChange={e => setEditingAddress(e.target.value)} />
                  ) : (
                    <p className="text-sm break-all">{g.address}</p>
                  )}
                  <Badge className="m-2">{g.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {editingId === g.id ? (
                  <>
                    <Button className="m-2" size="icon" onClick={() => handleSave(g.id)}><Save /></Button>
                    <Button size="icon" onClick={handleCancel}><X /></Button>
                  </>
                ) : (
                  <>
                    <Button className="m-2" size="icon" onClick={() => handleEdit(g)}><Edit /></Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="m-2" size="icon" variant="destructive"><Trash2 /></Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Wallet?</AlertDialogTitle>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemove(g.id, g.address)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}