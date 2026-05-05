import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const testimonialList = [
  {
    name: 'Sarah L.',
    role: 'Early Adopter',
    avatarUrl: 'https://picsum.photos/seed/sarah/100/100',
    avatarHint: 'woman portrait',
    quote: "Finally, I can see my entire portfolio in one place. InvestBridge has saved me countless hours and given me peace of mind. I can't imagine managing my finances without it.",
  },
  {
    name: 'Michael B.',
    role: 'Tech Investor',
    avatarUrl: 'https://picsum.photos/seed/michael/100/100',
    avatarHint: 'man portrait',
    quote: "The insights are game-changing. I've identified underperforming assets and rebalanced my portfolio for better returns, all thanks to the clear data InvestBridge provides.",
  },
  {
    name: 'Jessica T.',
    role: 'Crypto Enthusiast',
    avatarUrl: 'https://picsum.photos/seed/jessica/100/100',
    avatarHint: 'woman sunglasses',
    quote: "As someone with assets across multiple exchanges and wallets, this is the tool I've been waiting for. The security and read-only access give me confidence.",
  },
];

export function Testimonials() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by investors everywhere</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            See what our users are saying about gaining clarity and control over their finances.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonialList.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6">
                <p className="italic">"{t.quote}"</p>
                <div className="flex items-center gap-4 mt-6">
                  <Avatar>
                    <AvatarImage asChild src={t.avatarUrl}><Image src={t.avatarUrl} alt={t.name} width={40} height={40} data-ai-hint={t.avatarHint} /></AvatarImage>
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
