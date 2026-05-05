import Image from 'next/image';

export function ProblemSolution() {
  return (
    <section className="w-full pb-16 md:pb-24">
      <div className="container grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto px-4 md:px-8">
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">The Problem</h3>
            <p className="text-3xl md:text-4xl font-bold tracking-tight">Finding great investments is hard.</p>
            <p className="text-muted-foreground text-lg">
                The world of investing is noisy and complex. It's difficult to separate real opportunities from the hype, and the risk of making a wrong choice is high.
            </p>
        </div>
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-500">The Solution</h3>
            <p className="text-3xl md:text-4xl font-bold tracking-tight">Curated opportunities, simplified.</p>
            <p className="text-muted-foreground text-lg">
               InvestBridge cuts through the noise. We rigorously vet and present high-quality investment services, giving you a clear and direct path to building your wealth.
            </p>
        </div>
      </div>
    </section>
  );
}
