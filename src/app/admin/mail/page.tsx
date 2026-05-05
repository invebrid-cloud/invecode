"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Send, Pencil, Inbox, Archive } from "lucide-react";

export default function MailPage() {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!to || !subject || !message) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out all fields before sending.",
        });
        return;
    }
    toast({
      title: "Email Sent!",
      description: `Your message to ${to} has been sent.`,
    });
    // Reset form
    setTo("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Tabs defaultValue="compose">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="compose"><Pencil className="mr-2 h-4 w-4" /> Compose</TabsTrigger>
                <TabsTrigger value="sent"><Inbox className="mr-2 h-4 w-4" /> Sent</TabsTrigger>
                <TabsTrigger value="drafts"><Archive className="mr-2 h-4 w-4" /> Drafts</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="compose" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>Send a direct email to a user.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="to">To (Email)</Label>
                    <Input id="to" type="email" placeholder="user@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Enter the email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <RichTextEditor
                        value={message}
                        onChange={setMessage}
                        placeholder="Write your message here..."
                    />
                </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendMessage}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="sent">
             <Card>
                <CardHeader>
                    <CardTitle>Sent Messages</CardTitle>
                    <CardDescription>A list of emails you have sent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Your sent messages will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="drafts">
             <Card>
                <CardHeader>
                    <CardTitle>Drafts</CardTitle>
                    <CardDescription>Your saved email drafts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Your draft messages will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
