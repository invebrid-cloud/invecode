'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    if (authStatus) {
      let userEmail: string | null = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          userEmail = JSON.parse(userStr).email;
        }
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }

      if (userEmail?.toLowerCase() === 'admin@gmail.com') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/userDashboard');
      }
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return null; // Prevents showing landing page UI to logged-in users before redirect
  }

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