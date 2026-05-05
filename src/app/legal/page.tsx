
import { Separator } from "@/components/ui/separator";

const LegalSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
            {children}
        </div>
    </section>
);

export default function LegalPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Legal Center</h1>
        <p className="mt-4 text-lg text-muted-foreground">Important documents governing your use of our platform.</p>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <LegalSection id="privacy-policy" title="Privacy Policy">
        <p>InvestBridge Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
        <p>This policy covers: Information Collection (personal and derivative data), Use of Information (account management, communications), Disclosure of Information (with your consent, by law), and your Data Rights (access, correction, deletion). We implement a variety of security measures to maintain the safety of your personal information.</p>
      </LegalSection>

      <Separator className="my-12" />

      <LegalSection id="terms-of-service" title="Terms of Service">
        <p>Welcome to InvestBridge. These Terms of Service ("Terms") govern your access to and use of our services. By using our services, you agree to be bound by these Terms.</p>
        <p>These Terms include provisions regarding Account Registration and Security, User Conduct, Intellectual Property Rights, Disclaimers, and Limitation of Liability. Failure to comply with these terms may result in the suspension or termination of your account. Please read them carefully.</p>
      </LegalSection>

       <Separator className="my-12" />

      <LegalSection id="risk-disclosure" title="Risk Disclosure">
        <p>All investments involve a degree of risk. This Risk Disclosure is intended to inform you of the potential risks associated with the investment opportunities available through the InvestBridge platform.</p>
        <p>Risks include, but are not limited to, market risk, liquidity risk, and credit risk. The value of investments can fluctuate and may fall as well as rise. Past performance is not a reliable indicator of future results. You may not get back the full amount you invested. You should not invest money that you cannot afford to lose.</p>
      </LegalSection>
      
       <Separator className="my-12" />

      <LegalSection id="cookie-policy" title="Cookie Policy">
        <p>Our website uses cookies to enhance your user experience, analyze site traffic, and for security purposes. A cookie is a small piece of data stored on your device.</p>
        <p>This policy details the types of cookies we use (e.g., Essential, Analytical, Functional) and how you can manage your preferences. By continuing to use our site, you consent to our use of cookies as described in this policy.</p>
      </LegalSection>

    </div>
  );
}
