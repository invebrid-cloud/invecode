"use client";

import { Header } from "@/components/header";
import { Landmark, TrendingUp, Home, Banknote, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Footer } from "./footer";

const mobileMenuItems = [
    { href: "/userDashboard/deposit", icon: Landmark, label: "Deposit" },
    { href: "/userDashboard/invest", icon: TrendingUp, label: "Invest" },
    { href: "/userDashboard", icon: Home, label: "Dashboard" },
    { href: "/userDashboard/withdraw", icon: Banknote, label: "Withdraw" },
    { href: "/userDashboard/profile", icon: User, label: "Profile" },
];

const publicPages = ['/', '/publicPages/about', '/publicPages/contact', '/publicPages/faq', '/publicPages/offers', '/publicPages/legal', '/publicPages/careers', '/publicPages/#how-it-works', ];
const authPages = ['/authPages/login', '/authPages/signup'];

function AppShellContent({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isPublicPage = publicPages.some(page => pathname === page || (page.includes('/#') && pathname === '/'));
    const isAuthPage = authPages.includes(pathname);
    const isAdminPage = pathname.startsWith('/admin');

    useEffect(() => {
        setIsMounted(true);
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        let userEmail: string | null = null;
        
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                userEmail = JSON.parse(userStr).email;
            }
        } catch (e) {
            console.error("Failed to parse user from local storage");
        }
        
        const isAdmin = userEmail?.toLowerCase() === 'admin@gmail.com';
        setIsAuthenticated(authStatus);
        
        if (isAdminPage) return;

        if (authStatus) {
            if (isAuthPage || isPublicPage) {
                if (isAdmin) {
                    router.replace('/admin/dashboard');
                } else {
                    router.replace('/userDashboard');
                }
            }
        } else {
            if (!isPublicPage && !isAuthPage) {
                router.replace('/authPages/login');
            }
        }
    }, [pathname, router, isAuthPage, isPublicPage, isAdminPage]);

    if (isAdminPage) {
        return <>{children}</>;
    }

    const isRedirecting = isMounted && isAuthenticated && (isPublicPage || isAuthPage);
    const headerIsAuthenticated = isPublicPage ? false : (isMounted && isAuthenticated);
    const shouldShowFooter = isPublicPage && isMounted && !isAuthenticated;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <div className="flex-1">
                {/* When unmounted or redirecting, header shows logo/name only */}
                <Header 
                  isAuthenticated={headerIsAuthenticated} 
                  isLoading={!isMounted || isRedirecting} 
                />
                <main className={cn("pt-16", isAuthenticated && !isPublicPage ? "pb-24 md:pb-0" : "pb-0")}>
                    {isRedirecting ? null : children}
                </main>
            </div>
            {isMounted && isAuthenticated && (
                <MobileBottomNav className={cn({ 'hidden': isPublicPage || isAuthPage })} />
            )}
            {shouldShowFooter && <Footer />}
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return <AppShellContent>{children}</AppShellContent>;
}

function MobileBottomNav({ className }: { className?: string }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const checkActivePath = (href: string) => {
        if (!mounted) return false;
        if (href === "/userDashboard") return pathname === href;
        return pathname.startsWith(href);
    }

    return (
        <div className={cn("fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden", className)}>
            <div className="grid h-full grid-cols-5 mx-auto font-medium">
                {mobileMenuItems.map((item) => {
                    const isActive = checkActivePath(item.href);

                    return (
                        <Link
                            href={item.href}
                            key={item.label}
                            className={cn("flex flex-col items-center justify-center group")}
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
    )
}
