import { ShieldCheck, Fingerprint, Lock } from 'lucide-react';

export function SecuritySection() {
  return (
    <section id="security" className="w-full py-16 md:py-24 bg-secondary">
      <div className="container grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto px-4 md:px-8">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Security First
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your data, protected.</h2>
          <p className="text-muted-foreground text-lg">
            We use enterprise-grade security practices to ensure your sensitive financial data is always safe and private. Your trust is our highest priority.
          </p>
        </div>
        <div className="space-y-8">
            <div className="flex items-start gap-4">
                <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-lg">End-to-End Encryption</h3>
                    <p className="text-muted-foreground">All your data is encrypted at rest and in transit using AES-256 encryption.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Lock className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-lg">Read-Only Access</h3>
                    <p className="text-muted-foreground">We use secure, read-only API connections, meaning your credentials are never stored and no one can move money from your accounts.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Fingerprint className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-lg">Multi-Factor Authentication</h3>
                    <p className="text-muted-foreground">Protect your account with an extra layer of security, including biometrics and authenticator apps.</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
