
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


const PaypalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="h-5 w-5">
        <path d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4 .7-69.5-23.5-69.5-23.5zM62.6 140.3c-3.3 16.2-3.3 16.2-3.3 16.2-1.2 .2-2.3 .4-3.4 .5L25.3 256h39.8c4.4 0 7.9-3.5 8.1-7.9l3-22.8c1-7.6 8.7-13.3 16.5-13.3h33.4c25.5 0 54-13.4 54-44.3 0-26.1-19.1-39.4-44.9-39.4-21.2 0-33.4 10-33.4 10-1.8 1-2.9 2.4-2.9 4.3l-5.6 40.5z"/>
    </svg>
)

const initialPaypalGateway = {
    email: "admin-paypal@InvestBridge.com",
    status: "Verified",
    clientId: "AZD123...xyz"
}


export default function PaypalGatewayPage() {
  const [gateway, setGateway] = useState(initialPaypalGateway);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState(initialPaypalGateway.email);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingEmail(gateway.email);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setGateway({ ...gateway, email: editingEmail });
    toast({
      title: "Email Updated",
      description: "The PayPal email address has been successfully updated.",
    });
    setIsEditing(false);
  };
  
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
       <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/admin/payment-gateways">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payment Gateways
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>PayPal Account</CardTitle>
          <CardDescription>Manage your PayPal business account settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-blue-800">
                            <PaypalIcon />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">Primary Account</p>
                                <Badge variant={gateway.status === 'Verified' ? 'secondary' : 'destructive'}>{gateway.status}</Badge>
                            </div>
                            {isEditing ? (
                              <Input 
                                ref={inputRef}
                                value={editingEmail}
                                onChange={(e) => setEditingEmail(e.target.value)}
                                className="text-sm h-8"
                              />
                            ) : (
                               <p className="text-sm text-muted-foreground">{gateway.email}</p>
                            )}
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="icon" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="icon" onClick={handleEdit}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                 </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
