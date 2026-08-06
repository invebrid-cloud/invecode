"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/hooks/api";

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
};

function EditProfileSkeleton() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 animate-pulse">
            <div className="mb-6">
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="space-y-2">
                    <div className="h-7 w-32 bg-muted rounded" />
                    <div className="h-4 w-48 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded" />
                        <div className="h-3 w-44 bg-muted rounded" />
                    </div>
                </CardContent>
                <CardFooter className="gap-4">
                    <div className="h-10 w-20 bg-muted rounded" />
                    <div className="h-10 w-28 bg-muted rounded" />
                </CardFooter>
            </Card>
        </div>
    );
}

async function fetchUserDb(): Promise<User | null> {
    try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
        if (!res || !res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch user profile", error);
        return null;
    }
}

export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user, authLoading } = useUser();
    
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { data: userDb, isLoading: isProfileLoading } = useQuery<User | null>({
        queryKey: ["userProfile"],
        queryFn: fetchUserDb,
        enabled: !!user && !authLoading,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (userDb?.name) {
            setName(userDb.name);
        }
    }, [userDb]);

    const handleSaveChanges = async () => {
        if (!name.trim()) {
            toast({
                variant: "destructive",
                title: "Empty Name",
                description: "Please enter a valid Name.",
                duration: 1000,
            });
            return;
        }

        try {
            setSubmitting(true);
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/updateUser`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (!res || !res.ok) {
                throw new Error("No response from server");
            }

            const data = await res.json();

            // Invalidate user profile query to refresh cached data across application
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });

            toast({
                variant: "success",
                title: data.message,
                description: "Your changes have been saved successfully.",
                duration: 1000,
            });

            setTimeout(() => {
                router.replace("/userDashboard/profile");
            }, 1500);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Update Name Failed",
                description: "Something went wrong.",
                duration: 1500,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || isProfileLoading) {
        return <EditProfileSkeleton />;
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/userDashboard/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </Button>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={userDb?.username ?? ""} disabled />
                        <p className="text-xs text-muted-foreground">
                            Your username cannot be changed. <br /> Need to change, Contact Support.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={userDb?.email ?? ""} disabled />
                        <p className="text-xs text-muted-foreground">
                            Your email address cannot be changed.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/userDashboard/profile">Cancel</Link>
                    </Button>
                    <Button onClick={handleSaveChanges} disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}