
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import {
    LayoutDashboard,
    Settings,
    PanelLeft,
    User,
    Headset,
    Bell,
    Hourglass,
    Wallet,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useNotifications } from "@/hooks/admn-use-notifications";

const desktopNavItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/pending-transactions", label: "Pending Transactions" },
    { href: "/admin/finance", label: "Finance" },
    { href: "/admin/mail", label: "Mail" },
    { href: "/admin/site-maintenance", label: "General Settings" },
];

const mobileMenuItems = [
    { href: "/admin/pending-transactions", icon: Hourglass, label: "Pending" },
    { href: "/admin/finance", icon: Wallet, label: "Finance" },
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/mail", icon: Mail, label: "Mail" },
    { href: "/admin/site-maintenance", icon: Settings, label: "Settings" },
];

function AdminHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
    const pathname = usePathname();
    const user = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    // const [hasUnread, setHasUnread] = useState(true);
    const { notifications } = useNotifications();
    const [loading, setLoading] = useState(true);
    useEffect(() => setMounted(true), []);

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

    const checkActivePath = (href: string) => {
        if (!mounted) return false;

        if (href === "/admin/finance") {
            return pathname.startsWith("/admin/finance") ||
                pathname.startsWith("/admin/payment-gateways") ||
                pathname.startsWith("/admin/investment-services");
        }

        return pathname.startsWith(href);
    }

    const safeTransactions = Array.isArray(notifications) ? notifications : [];
    const hasUnreadNotifications = safeTransactions.filter(n => !n.read).length;

    return (
        <header className="fixed top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
                <PanelLeft className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Admin Panel</h1>
            </Link>

            {isAuthenticated && (
                <nav className="hidden md:flex items-center gap-2 ml-10">
                    {desktopNavItems.map(item => {
                        const isActive = checkActivePath(item.href);
                        return (
                            <Link key={item.label} href={item.href} className={cn(
                                "text-sm font-medium transition-colors px-4 py-2 rounded-full",
                                isActive ? "bg-accent text-accent-foreground shadow-[0_0_10px_hsl(var(--accent))]" : "text-muted-foreground hover:text-primary"
                            )}>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            )}

            <div className="flex items-center gap-2 ml-auto">
                {isAuthenticated && (
                    <>
                        <Button asChild variant="ghost" size="icon" className="">
                            <Link href="/admin/support">
                                <Headset className="h-5 w-5" />
                                <span className="sr-only">Support Chat</span>
                            </Link>
                        </Button>
                        <div className="relative">
                            <Button asChild variant="ghost" size="icon" className="">
                                <Link href="/admin/notifications">
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
                                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>
        </header>
    );
}


function AdminMobileBottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const checkActivePath = (href: string) => {
        if (!mounted) return false;

        if (href === "/admin/finance") {
            return pathname.startsWith("/admin/finance") ||
                pathname.startsWith("/admin/payment-gateways") ||
                pathname.startsWith("/admin/investment-services");
        }

        if (href === "/admin/dashboard") return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                {mobileMenuItems.map((item) => {
                    const isActive = checkActivePath(item.href);

                    return (
                        <Link
                            href={item.href}
                            key={item.label}
                            className={cn(
                                "flex flex-col items-center justify-center group"
                            )}
                        >
                            <div
                                className={cn(
                                    "relative flex flex-col items-center justify-center transition-all duration-300 w-20 h-20 p-2",
                                    isActive
                                        ? "-translate-y-8 bg-accent text-accent-foreground rounded-full shadow-[0_-8px_20px_-5px_hsl(var(--accent)/0.5)]"
                                        : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-6 w-6 mb-1" />
                                <span className="text-xs text-center px-1">
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        const userStr = localStorage.getItem("user");
        // let userRole: string | null = null;
        if (!authStatus || !userStr) {
            router.replace("/login");
            setIsAuthenticated(false);
            return;
        }
        try {
            const user = JSON.parse(userStr);

            if (user.role !== "admins") {
                router.replace("/dashboard");
                setIsAuthenticated(false);
                return;
            }

            setIsAuthenticated(true);
        } catch (e) {
            console.error("Could not parse user from LS");
            router.replace("/login");
            setIsAuthenticated(false);
        }

    }, []);

    if (!isMounted || isAuthenticated === undefined) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background">
                <header className="fixed top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <PanelLeft className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-semibold">Admin Panel</h1>
                    </Link>
                </header>
                <main className="flex-1 pt-16 pb-24 md:pb-0">
                    {/* Optional: Add a loading spinner */}
                </main>
                <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <AdminHeader isAuthenticated={isAuthenticated} />
            <main className="flex-1 pt-16 pb-24 md:pb-0">
                {children}
            </main>
            {isAuthenticated && <AdminMobileBottomNav />}
        </div>
    );
}
