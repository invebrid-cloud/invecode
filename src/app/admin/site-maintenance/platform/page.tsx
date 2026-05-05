
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlatformSettingsPage() {
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
          <CardTitle>Platform Details</CardTitle>
          <CardDescription>Manage general site information and branding.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Platform settings will be available here.</p>
            <p className="text-sm">This section is under construction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
