import Image from 'next/image';

export function ProductPreview() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          A dashboard designed for clarity
        </h2>
        <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          Our clean, intuitive interface makes it easy to visualize your performance, understand your asset allocation, and track your net worth over time.
        </p>
        <div className="relative p-2 bg-secondary/30 rounded-xl border shadow-lg shadow-primary/10 mt-12">
           <div className="aspect-video overflow-hidden rounded-lg">
              <Image 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" 
                alt="Product preview chart"
                width={1200}
                height={675}
                className="w-full h-full object-cover"
                data-ai-hint="dashboard chart"
              />
           </div>
        </div>
      </div>
    </section>
  );
}
