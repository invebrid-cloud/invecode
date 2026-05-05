
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Wrench, Users, Settings } from "lucide-react";
import Link from "next/link";

const settingsCards = [
    {
        name: "Maintenance Mode",
        description: "Control site access during updates.",
        Icon: Wrench,
        href: "/admin/site-maintenance/maintenance",
    },
    {
        name: "User Management",
        description: "View, edit, and manage user accounts.",
        Icon: Users,
        href: "/admin/site-maintenance/users",
    },
    {
        name: "Platform Details",
        description: "Configure site name and branding.",
        Icon: Settings,
        href: "/admin/site-maintenance/platform",
    }
];

export default function GeneralSettingsPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage platform-wide settings and user configurations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {settingsCards.map((card) => (
                <Link href={card.href} key={card.name} className="block rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <card.Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{card.name}</p>
                                <p className="text-sm text-muted-foreground">{card.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
