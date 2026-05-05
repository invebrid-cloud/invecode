export function TrustedBy() {
  const logos = [
    "Global Finance",
    "Quantum Inc",
    "Apex Holdings",
    "CryptoFund",
    "Gemstone Capital",
    "Vertex Ventures",
  ];

  return (
    <section className="w-full pt-12 md:pt-16">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Trusted by top firms, companies, and organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12">
          {logos.map((logo) => (
            <div key={logo} className="text-2xl font-bold text-muted-foreground/60 filter grayscale hover:grayscale-0 transition-all duration-300">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
