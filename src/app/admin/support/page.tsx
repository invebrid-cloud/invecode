
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSupportPage() {

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Support</CardTitle>
          <CardDescription>Access support resources and contact channels for platform administrators.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-12 text-muted-foreground">
              <p>Admin support chat and resources will be available here.</p>
              <p className="text-sm">This section is under construction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
