

'use client';

import Link from "next/link";
import { Bell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUser } from "@/hooks/use-user";
import { useNotifications } from "@/hooks/use-notifications";

const desktopNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/deposit", label: "Deposit" },
  { href: "/invest", label: "Invest" },
  { href: "/withdraw", label: "Withdraw" },
]

const unauthenticatedNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/offers", label: "Product Offers" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQs" },
]

function DesktopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const checkActivePath = (href: string) => {
    if (!mounted) return false;
    if (href === "/dashboard") return pathname === href;
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  }

  const navItems = isAuthenticated ? desktopNavItems : unauthenticatedNavItems;

  return (
    <nav className="hidden md:flex items-center gap-2 ml-10">
      {navItems.map(item => {
        const isActive = checkActivePath(item.href);
        const variantClass = isAuthenticated
          ? (isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")
          : (isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground");
        return (
          <Link key={item.label} href={item.href} className={cn(
            "text-sm font-medium transition-colors px-4 py-2 rounded-full",
            variantClass
          )}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
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

  useEffect(() => {
    // ping server 
    const pingServer = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ping`, {
          method: "GET",
          cache: "no-cache",
        });
        // Optional: Log if needed
        console.log("Ping sent to backend");
      } catch (error) {
        // Fail silently, no need to alert the user
        console.warn("Ping failed", error);
      }
    }

    pingServer();
    //   const fetchNotifications = async () => {
    //     try {
    //       const token = localStorage.getItem("token");

    //       const res = await fetch(
    //         `${process.env.NEXT_PUBLIC_API_URL}/api/trans/notify/me`,
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       );

    //       const data = await res.json();
    //       setNotifications(data.notifications);
    //     } catch (error) {
    //       console.error("Failed to fetch transactions", error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   fetchNotifications();
  }, []);

  const safeTransactions = Array.isArray(notifications) ? notifications : [];
  const hasUnreadNotifications = safeTransactions.filter(n => !n.read).length;
  if (!isMounted) {
    return (
      <header className="fixed top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* <BarChart3 className="h-6 w-6 text-primary" /> */}
          <Image src="/img.png" alt="" className="h-6 w-6" width={500} height={500} />
          <h1 className="text-xl font-semibold">InvestBridge</h1>
        </Link>
      </header>
    );
  }

  const navItems = isAuthenticated ? desktopNavItems : unauthenticatedNavItems;

  return (
    <Collapsible
      asChild
      open={isMobileMenuOpen}
      onOpenChange={setIsMobileMenuOpen}
    >
      <div className="fixed top-0 w-full z-40">
        <header className="relative z-10 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 mr-auto">
            {/* className="h-6 w-6 text-primary" /> */}
            <Image src="/img.png" alt="" className="h-6 w-6" width={500} height={500} />
            <h1 className="text-xl font-semibold">InvestBridge</h1>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <DesktopNav isAuthenticated={isAuthenticated} />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <Button asChild variant="ghost" size="icon">
                    <Link href="/notifications">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                    </Link>
                  </Button>
                  {hasUnreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                      {hasUnreadNotifications > 99 ? "99+" : hasUnreadNotifications}
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/transactions">Transactions</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="hidden md:inline-flex">
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="md:hidden">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="md:hidden">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
            {!isAuthenticated && (
              <CollapsibleTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </header>
        {!isAuthenticated && (
          <CollapsibleContent className="md:hidden bg-background/95 backdrop-blur-sm border-b">
            <nav className="grid gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
