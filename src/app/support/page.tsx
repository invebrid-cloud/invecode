import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>This is the support page.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Support chat and resources will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
