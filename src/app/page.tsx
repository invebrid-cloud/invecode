import { HeroSection } from '@/components/landing/hero-section';
import { TrustedBy } from '@/components/landing/trusted-by';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { ProductPreview } from '@/components/landing/product-preview';
import { SecuritySection } from '@/components/landing/security-section';
import { Testimonials } from '@/components/landing/testimonials';
import { FinalCTA } from '@/components/landing/final-cta';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      <HeroSection />
      <TrustedBy />
      <Separator className="my-10" />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <ProductPreview />
      <SecuritySection />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}
