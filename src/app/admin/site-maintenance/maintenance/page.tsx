
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SiteMaintenancePage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Our site is currently undergoing scheduled maintenance. We'll be back online shortly. Thank you for your patience."
  );
  const { toast } = useToast();

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Site maintenance settings have been updated.",
    });
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/site-maintenance">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to General Settings
                </Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Site Maintenance</CardTitle>
          <CardDescription>Manage site status and maintenance mode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="text-base">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, visitors will be redirected to a maintenance page.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={isMaintenanceMode}
              onCheckedChange={setIsMaintenanceMode}
              aria-label="Toggle maintenance mode"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter a message to display to users..."
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={4}
            />
             <p className="text-xs text-muted-foreground">
                This message will be shown to users when maintenance mode is active.
            </p>
          </div>

          {isMaintenanceMode && (
            <Alert>
              <Wrench className="h-4 w-4" />
              <AlertTitle>Maintenance Mode is Active</AlertTitle>
              <AlertDescription>
                The site is currently not accessible to regular users.
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
