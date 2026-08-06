
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, LifeBuoy, FileQuestion, ArrowRight, Building, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
    });
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground">We'd love to hear from you. Here's how you can reach us.</p>
        </div>
        
        <div>
            {/* Contact Form Card */}
            <Card className="mb-5">
                <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                    Fill out the form and our team will get back to you within 24 hours.
                </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your Name" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message..." required rows={5} />
                    </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit">Send Message</Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Contact Options Card */}
            <Card className="mb-5">
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>
                        Alternatively, you can reach us through the following channels.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Email</h3>
                            <p className="text-muted-foreground">Our support team is here to help.</p>
                            <a href="mailto:support@InvestBridge.com" className="text-primary hover:underline">support@InvestBridge.com</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Phone</h3>
                            <p className="text-muted-foreground">Mon-Fri from 9am to 5pm.</p>
                            <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-890</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Office</h3>
                            <p className="text-muted-foreground">123 Investment Drive, Finance City, 12345</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Support & Help Links */}
            <Card className="mb-5">
                <CardHeader>
                    <CardTitle>Support &amp; Help</CardTitle>
                    <CardDescription>Looking for quick answers? Check out our FAQ.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/publicPages/faq" className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <FileQuestion className="h-6 w-6 text-primary" />
                            <p className="font-semibold">Frequently Asked Questions</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>
            
            {/* Company Information */}
            <div className="rounded-lg border bg-secondary/30 p-6">
                <h3 className="font-semibold text-lg mb-4 text-center">Company Information</h3>
                <div className="text-sm text-muted-foreground space-y-3">
                    <div className="flex items-center gap-3">
                        <Building className="h-4 w-4" />
                        <span>InvestBridge Solutions Inc.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4" />
                        <span>123 Investment Drive, Finance City, FC 12345, USA</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        <span>Business Hours: Monday - Friday, 9:00 AM - 5:00 PM (EST)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Registered under the Financial Conduct Authority (FCA), Ref: 12345678</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
