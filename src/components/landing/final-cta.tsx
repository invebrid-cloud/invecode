import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="w-full py-16 md:py-24 bg-secondary">
      <div className="container text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Ready to take control of your investments?
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Join thousands of smart investors who use InvestBridge to track their portfolio, gain insights, and build wealth with confidence.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-4">
            No credit card required.
          </p>
      </div>
    </section>
  );
}
