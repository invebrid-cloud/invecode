'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from "@/hooks/use-user";
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from "@/hooks/use-notifications";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { refreshNotifications } = useNotifications();
  const { setUser } = useUser();

  useEffect(() => {
    // ping server 
    const pingServer = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ping`, {
          method: "GET",
          cache: "no-cache",
        });
        console.log("Ping sent to backend");
      } catch (error) {
        console.warn("Ping failed", error);
      }
    }

    pingServer();
  }, []);

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
        description: "Please enter your password.",
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
        return;
      }

      toast({
        variant: "success",
        title: 'Success',
        description: 'Login successful!',
        duration: 1500,
      });

      setRedirecting(true);

      setTimeout(async () => {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
        setUser(data.user);
        await refreshNotifications();
        if (data.user.role === "admins") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/userDashboard");
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
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="pr-10"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" className="w-full" disabled={loading || redirecting}>
              {loading ? "Verifying..." : redirecting ? "Redirecting..." : "Sign in"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/authPages/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}