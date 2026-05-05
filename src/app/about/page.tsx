import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, Combine, Eye, FileWarning, ShieldCheck, Target, UserCheck, TrendingUp, Lock, Search, LineChart } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const problems = [
    {
        icon: <FileWarning className="h-8 w-8 text-primary" />,
        title: "Opaque Platforms",
        description: "Many investment platforms are complex and hide fees, making it difficult to know what you're really paying for.",
    },
    {
        icon: <Combine className="h-8 w-8 text-primary" />,
        title: "Fragmented Portfolios",
        description: "Managing investments across multiple services leads to a scattered view of your financial health.",
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Manual Tracking",
        description: "Investors are forced to rely on spreadsheets and manual updates to track performance and allocation.",
    }
];

const principles = [
    {
        icon: <Eye className="h-7 w-7 text-primary" />,
        title: "Transparency",
        description: "We believe in clear, upfront communication about how our platform works and how we make money.",
    },
    {
        icon: <ShieldCheck className="h-7 w-7 text-primary" />,
        title: "Security-First",
        description: "Protecting your data and privacy is the foundation of every decision we make.",
    },
    {
        icon: <UserCheck className="h-7 w-7 text-primary" />,
        title: "User Control",
        description: "We provide the tools and information you need to make informed decisions and stay in control.",
    },
    {
        icon: <TrendingUp className="h-7 w-7 text-primary" />,
        title: "Long-Term Focus",
        description: "Our goal is to foster sustainable growth and build lasting trust with our users.",
    }
]

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        
        {/* 1. Header / Intro */}
        <section className="text-center pt-16 md:pt-24 mb-24">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">We're building a smarter way to invest.</h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">InvestBridge was founded to bring clarity, confidence, and control to the modern investor.</p>
        </section>

        {/* 2. Company Overview / Mission */}
        <section className="mb-24 text-center">
            <div className="flex flex-col items-center gap-6">
                <Target className="h-20 w-20 text-primary/20" />
                <div className="space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
                    <p className="text-muted-foreground text-lg">
                        To empower individuals to achieve their financial goals by providing a single, transparent platform to discover, manage, and grow their investments with confidence. We serve anyone who seeks to build wealth but is tired of the complexity and fragmentation of the current financial landscape.
                    </p>
                </div>
            </div>
        </section>

        {/* 3. The Problem We Solve */}
        <section className="mb-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">The Challenge with Modern Investing</h2>
                <p className="mt-4 text-lg text-muted-foreground">The tools have changed, but the core problems haven't.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {problems.map((problem) => (
                    <Card key={problem.title} className="bg-secondary/50 border-none">
                        <CardHeader className="items-center">
                            {problem.icon}
                        </CardHeader>
                        <CardContent className="text-center">
                            <h3 className="font-semibold text-lg">{problem.title}</h3>
                            <p className="text-muted-foreground mt-2 text-sm">{problem.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* 4. Our Approach */}
         <section className="mb-24">
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-3xl tracking-tight">Our Approach: A Curated, Independent Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground text-lg">
                    <p>
                        We don't offer investments ourselves. Instead, we act as your independent guide. Our team of financial experts rigorously vets and curates a marketplace of top-tier investment services from established providers. This allows us to be completely objective, focusing only on presenting opportunities that meet our stringent criteria for performance, security, and transparency.
                    </p>
                    <p>
                        You invest directly with the provider through our streamlined platform, and we provide the tools to monitor everything in one unified dashboard. It's the best of both worlds: access to expert-vetted opportunities without being locked into a single ecosystem.
                    </p>
                </CardContent>
            </Card>
        </section>

        {/* 8. Values & Principles */}
        <section className="mb-12">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Our Guiding Principles</h2>
                <p className="mt-4 text-lg text-muted-foreground">The values that drive our decisions.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {principles.map((principle) => (
                    <div key={principle.title} className="text-center flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                            {principle.icon}
                        </div>
                        <h3 className="font-semibold text-lg">{principle.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{principle.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="text-center pt-16 pb-16 border-t">
            <h2 className="text-3xl font-bold tracking-tight">Have questions?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Our team is ready to provide the answers you need.</p>
            <div className="mt-8">
                <Link href="/contact" className="text-primary text-lg font-medium hover:underline flex items-center justify-center gap-2">
                    Contact Our Team <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </section>

      </div>
    </div>
  );
}
