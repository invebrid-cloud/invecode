
"use client";

import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileQuestion, HelpCircle, User, TrendingUp, ShieldCheck, DollarSign, ArrowRightLeft, Landmark, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const allFaqs = [
  // Getting Started
  { category: "Getting Started", q: "What is InvestBridge?", a: "InvestBridge is a platform that simplifies investing by curating top-tier investment opportunities and presenting them in a single, easy-to-use dashboard. We help you discover, compare, and manage your investments without the complexity of traditional platforms." },
  { category: "Getting Started", q: "How do I create an account?", a: "You can create an account by clicking the 'Sign Up' button on our homepage. You'll need to provide your name, email address, and create a password. The process takes less than two minutes." },
  { category: "Getting Started", q: "What do I need to get started?", a: "All you need is a valid email address and to be over 18 years of age. Once your account is created, you can deposit funds to begin investing in our curated offers." },
  
  // Accounts
  { category: "Accounts", q: "How do I deposit funds into my account?", a: "You can deposit funds using cryptocurrency through our secure deposit page. We plan to add support for credit cards and bank transfers soon." },
  { category: "Accounts", q: "How can I update my personal information?", a: "You can update your name and username from your Profile page. For security reasons, your email address cannot be changed after registration." },
  
  // Investment Offers
  { category: "Investment Offers", q: "What kind of investment opportunities can I find?", a: "We offer a diverse range of opportunities, including corporate bonds, cryptocurrency staking, and managed stock portfolios. All opportunities are vetted by our team of financial experts to ensure they meet our high standards for quality and potential returns." },
  { highlighted: true, category: "Investment Offers", q: "How does InvestBridge select investment partners?", a: "Our financial experts conduct rigorous due diligence on all potential partners. We assess their track record, financial stability, regulatory compliance, and the transparency of their offerings. Only firms that meet our stringent criteria are featured on our platform." },
  
  // Security & Privacy
  { category: "Security & Privacy", q: "Is my financial data secure?", a: "Yes, security is our top priority. We use bank-level AES-256 encryption for all data, both at rest and in transit. Our platform utilizes read-only API connections, and we support multi-factor authentication to ensure your account is protected." },
  { category: "Security & Privacy", q: "Do you store my banking or credit card information?", a: "No, we do not store sensitive payment information on our servers. All transactions are handled by our secure, PCI-compliant payment processing partners." },
  
  // Fees & Pricing
  { category: "Fees & Pricing", q: "How does InvestBridge make money?", a: "We partner with top-tier investment firms and may receive a commission when you invest through our platform. Our goal is to provide a transparent service, and our recommendations are based on rigorous vetting, not on commission rates. There are no hidden fees for using our platform." },
  
  // Withdrawals & Access
  { category: "Withdrawals & Access", q: "Can I withdraw my money at any time?", a: "Withdrawal policies depend on the specific investment product you choose. Each product listing on our platform clearly outlines its terms, including any lock-up periods or withdrawal conditions. We believe in full transparency so you can make informed decisions." },
  { category: "Withdrawals & Access", q: "How long do withdrawals take?", a: "Withdrawal processing times vary based on the method and the investment provider. Crypto withdrawals are typically processed within 24 hours, while bank transfers may take 3-5 business days." },
  
  // Compliance & Regulation
  { category: "Compliance & Regulation", q: "Is InvestBridge a regulated entity?", a: "InvestBridge operates as a technology platform that connects users with regulated investment providers. While we are not a direct financial institution, we adhere to strict internal compliance standards and partner only with firms that are regulated in their respective jurisdictions." },
];

const categories = [
  { id: "Getting Started", icon: HelpCircle },
  { id: "Accounts", icon: User },
  { id: "Investment Offers", icon: TrendingUp },
  { id: "Security & Privacy", icon: ShieldCheck },
  { id: "Fees & Pricing", icon: DollarSign },
  { id: "Withdrawals & Access", icon: ArrowRightLeft },
  { id: "Compliance & Regulation", icon: Landmark },
  { id: "Support", icon: MessageSquare },
];

const highlightedFaqs = allFaqs.filter(faq => faq.highlighted);


export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(categories[0].id);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return allFaqs.filter(faq => faq.category === activeTab);
    }
    return allFaqs.filter(faq =>
      (faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
       faq.a.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // If user starts typing, switch to an "all results" view
    if (e.target.value) {
      setActiveTab("All Results");
    } else {
      setActiveTab(categories[0].id);
    }
  }
  
  const handleTabChange = (value: string) => {
    setSearchTerm("");
    setActiveTab(value);
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* 1. Page Header */}
      <section className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Clear answers to common questions about our platform, security, and investments.
        </p>
      </section>

      {/* 2. Highlighted Questions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Popular Questions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {highlightedFaqs.map((faq, index) => (
             <Card key={`highlight-${index}`} className="bg-secondary/50">
               <CardContent className="p-6">
                <p className="font-semibold mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a.substring(0, 100)}...</p>
               </CardContent>
             </Card>
          ))}
        </div>
      </section>

      {/* 3. Search and Tabs */}
      <section className="mb-12">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search questions..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8 h-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col sm:flex-row items-center gap-2 py-2">
                <cat.icon className="h-4 w-4" />
                <span>{cat.id}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <Card className="mt-6">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full" key={activeTab}>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-lg text-left hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-semibold">No questions found</p>
                    <p>Try adjusting your search or selecting another category.</p>
                  </div>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </Tabs>
      </section>
      
      {/* 4. Security & Risk Notice */}
      <section className="mb-12">
        <Alert className="bg-secondary/50">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Investing involves risk. The value of investments can go up as well as down. Please review our full risk disclosures before making any investment decisions.
          </AlertDescription>
        </Alert>
      </section>

      {/* 5. Still Need Help? */}
      <section className="text-center rounded-lg border bg-background p-8">
        <h2 className="text-2xl font-bold mb-2">Can’t find what you’re looking for?</h2>
        <p className="text-muted-foreground mb-6">Our support team is always here to help.</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/publicPages/contact">Contact Support</Link>
          </Button>
          <Button variant="outline" disabled>Visit Help Center</Button>
        </div>
      </section>
    </div>
  );
}
