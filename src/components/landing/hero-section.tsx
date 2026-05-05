
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden shadow-[0_10px_30px_-15px_hsl(var(--accent))]">
        <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Financial Dashboard Background"
            fill
            className="object-cover z-0"
            data-ai-hint="dashboard charts"
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-background/30 z-0"></div>
      <div className="container relative z-10 text-center max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          Invest with confidence,
          <br />
          <span className="text-primary">all in one place.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mt-6">
          Discover, compare, and invest in a curated selection of top-tier opportunities. We do the research, so you can build wealth with confidence.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#how-it-works">
               How It Works
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
