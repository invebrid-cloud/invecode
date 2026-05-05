
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { Edit3, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";

type User = {
  name: string;
  username: string;
  email: string;
  country: string;
  availableBalance: number;
  totalBalance: number;
  status: string;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function ProfilePage() {
  const router = useRouter();
  const { user, authLoading } = useUser();
  const [userDb, setUserDb] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include", // IMPORTANT
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    toast({
      variant: "success",
      title: 'Success',
      description: 'Log Out successful!',
      duration: 1000,
    });
    setTimeout(() => {
      localStorage.clear();
      router.replace("/login");
    }, 1200);
  };
 
  if (loading || authLoading) {
    // Optional: Render a loading state or redirect
    return <div className="p-4 md:p-8">Loading profile...</div>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile/edit">
                <Edit3 className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback>{userDb?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{userDb?.name}</h2>
              <p className="text-muted-foreground">{userDb?.username}</p>
              <p className="text-sm text-muted-foreground">{userDb?.email}</p>
              <p className="text-sm text-muted-foreground">{userDb?.country}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Balance Summary</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                <div className="p-4 rounded-lg border bg-secondary/30">
                  <p className="text-xs sm:text-sm text-muted-foreground">Available Balance</p>
                  <p className="font-bold text-base sm:text-xl lg:text-2xl">{formatCurrency(userDb?.availableBalance ?? 0)}</p>
                </div>
                <div className="p-4 rounded-lg border bg-secondary/30">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
                  <p className="font-bold text-base sm:text-xl lg:text-2xl">{formatCurrency(userDb?.totalBalance ?? 0)}</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/transactions">View Transaction History</Link>
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">App Settings</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="face-id" className="flex flex-col space-y-1">
                  <span>Enable Face ID</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Use facial recognition for quick and secure logins.
                  </span>
                </Label>
                <Switch id="face-id" disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex flex-col space-y-1">
                  <span>Push Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive alerts for transactions and market changes.
                  </span>
                </Label>
                <Switch id="notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa" className="flex flex-col space-y-1">
                  <span>Enable 2FA</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Secure your account with two-factor authentication.
                  </span>
                </Label>
                <Switch id="2fa" disabled/>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
