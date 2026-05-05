import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartBig, Combine, Zap, ShieldCheck, CheckSquare, Library } from 'lucide-react';

const featureList = [
  {
    icon: <Library className="h-8 w-8 text-primary" />,
    title: 'Curated Marketplace',
    description: 'Access a select range of investment opportunities that have been rigorously vetted by our expert team.',
  },
  {
    icon: <BarChartBig className="h-8 w-8 text-primary" />,
    title: 'Unified Dashboard',
    description: 'Monitor all investments made through our platform in one consolidated, easy-to-understand dashboard.',
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-primary" />,
    title: 'Simplified Investing',
    description: 'Invest in different services from multiple providers without the hassle of creating and managing separate accounts.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Bank-Level Security',
    description: 'Your data and transactions are protected with AES-256 encryption and multi-factor authentication.',
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-16 md:py-24">
      <div className="container text-center max-w-5xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Everything you need to succeed
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          InvestBridge provides powerful tools to help you manage your wealth and achieve your financial goals.
        </p>

        <div className="grid gap-8 md:grid-cols-2 mt-12 text-left">
          {featureList.map((feature) => (
            <div key={feature.title} className="flex items-start gap-6">
              <div>{feature.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
