'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// A partial list of countries for the dropdown. Can be expanded.
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "India", "Brazil", "South Africa", "Nigeria", "Mexico"
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSignUp = async () => {

    if (!name) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your name.",
        duration: 2000,
      });
      return;
    }
    if (!username) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your username.",
        duration: 2000,
      });
      return;
    }
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your email.",
        duration: 2000,
      });
      return;
    }
    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter your passwords.",
        duration: 2000,
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Incorrect Password match",
        description: "Enter the correct passwords to match.",
        duration: 2000,
      });
      return;
    }
    if (!country) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please select your country.",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          country,
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
        description: 'Account created successfully!',
        duration: 1500,
      });

      setRedirecting(true);
      setTimeout(() => {
        router.replace("/authPages/login");
      }, 1800);

    } catch (err) {
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={setCountry} value={country}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    className="pr-10"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" className="w-full" disabled={loading || redirecting}>
              {loading ? "Creating..." : redirecting ? "Redirecting..." : "Create account"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/authPages/login" className="underline text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}