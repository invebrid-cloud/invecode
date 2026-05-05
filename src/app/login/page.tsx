
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from 'react';
// import { users } from '@/lib/data';
import { useUser } from "@/hooks/use-user";
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from "@/hooks/use-notifications";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { refreshNotifications } = useNotifications();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your email.",
        duration: 2000,
      });
      return;
    }
    if (!password) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your passwords.",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: ' Failed',
          description: `Invalid details: ${data.message}`,
          duration: 2000,
        });
        // alert(data.message);
        return;
      }

      toast({
        variant: "success",
        title: 'Success',
        description: 'Login successful!',
        duration: 1500,
      });
      // localStorage.setItem('isAuthenticated', 'true');
      // localStorage.setItem('user', JSON.stringify(user));

      setRedirecting(true);

      setTimeout(async () => {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
        setUser(data.user);
        // console.log(data.user.role);
        await refreshNotifications();
        if (data.user.role === "admins") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      }, 1800);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and investor code to access your account.
          </CardDescription>
        </CardHeader>
        <form action="" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" className="w-full" disabled={loading || redirecting}>
              {loading ? "verifying..." : redirecting ? "Redirecting..." : "Sign in"}</Button>
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
