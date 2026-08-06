
import { Button } from "@/components/ui/button";
import { Briefcase, Mail } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="container max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        
        <section className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Join Our Team</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of investment management and are always looking for passionate, talented people to join our mission.
          </p>
        </section>

        <section className="mt-16 text-center rounded-lg border bg-secondary/50 p-8 md:p-12">
            <h2 className="text-2xl font-bold tracking-tight">No Open Positions Currently</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                While we don't have any specific roles open at the moment, we are growing quickly and things can change. If you're passionate about what we do, we'd still love to hear from you.
            </p>
            <div className="mt-8">
                <Button asChild>
                    <a href="mailto:careers@InvestBridge.com">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Our Hiring Team
                    </a>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
                Check back soon or follow us on LinkedIn for future updates.
            </p>
        </section>
      </div>
    </div>
  );
}
