
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, LayoutGrid, Activity, Search, Target, LineChart } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Explore Opportunities',
    description: 'Browse our curated marketplace of pre-vetted investment plans from top-tier firms.',
    icon: <Search className="h-8 w-8 text-primary" />,
  },
  {
    step: 2,
    title: 'Choose Your Investment',
    description: 'Select the plan that aligns with your financial goals, risk tolerance, and timeline.',
    icon: <Target className="h-8 w-8 text-primary" />,
  },
  {
    step: 3,
    title: 'Invest and Grow',
    description: 'Invest directly through our platform and monitor your portfolio\'s performance in one unified dashboard.',
    icon: <LineChart className="h-8 w-8 text-primary" />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 bg-secondary">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground mt-4 text-lg">Get started in just a few minutes.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="text-center flex flex-col items-center">
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background border shadow-sm">
                  {item.icon}
                </div>
                 <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
