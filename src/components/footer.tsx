import { BarChart3, Twitter, Linkedin, Facebook } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Footer({ className }: { className?: string }) {
    const productLinks = [
        { name: "Offers", href: "/offers" },
        { name: "How It Works", href: "/#how-it-works" },
        { name: "Security", href: "/#security" },
    ];
    const companyLinks = [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" }
    ];
    const legalLinks = [
        { name: "Privacy Policy", href: "/legal#privacy-policy" },
        { name: "Terms of Service", href: "/legal#terms-of-service" },
        { name: "Risk Disclosure", href: "/legal#risk-disclosure" },
        { name: "Cookie Policy", href: "/legal#cookie-policy" }
    ];
    const resourceLinks = [
        { name: "FAQs", href: "/faq" },
        { name: "Help Center", href: "#" },
    ];


    return (
        <footer className={cn("border-t bg-background w-full px-4 sm:px-6", className)}>
            <div className="container mx-auto py-12 md:py-16">
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Brand & Description */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-2 mb-4">
                            {/* <BarChart3 className="h-7 w-7 text-primary" /> */}
                            <Image src="/img.png" alt="" className="h-6 w-6" width={500} height={500}/>
                            <h2 className="text-xl font-bold">InvestBridge</h2>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                           A secure platform to manage investments from multiple providers in one place.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {productLinks.map(link => (
                                    <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {companyLinks.map(link => (
                                     <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-4">Resources</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {resourceLinks.map(link => (
                                     <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {legalLinks.map(link => (
                                     <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} InvestBridge Inc. All rights reserved.</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">Investing involves risk. Past performance does not guarantee future results.</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                        <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
