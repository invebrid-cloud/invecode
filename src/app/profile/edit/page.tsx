
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    id: number
    name: string;
    username: string;
    email: string;
};

export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, authLoading } = useUser();
    const [userDb, setUserDb] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserDb = async () => {
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,);
                if (!res) {
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setUserDb(data);
                setName(data.name);
            } catch (error) {
                console.error("Failed to fetch user balance", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDb();
    }, []);

    const handleSaveChanges = async () => {
        if (!name) {
            toast({
                variant: "destructive",
                title: "Emoty Name",
                description: "Please enter a valid Name.",
                duration: 1000,
            });
            return;
        }
        // console.log(name);
        try {
            setSubmitting(true);
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/updateUser`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name }),
                }
            );
            if (!res || !res.ok) {
                throw new Error("No response from server");
            }

            const data = await res.json();

            toast({
                variant: "success",
                title: data.message,
                description: "Your changes have been saved successfully.",
                duration: 1000,
            });

            setTimeout(() => {
                router.replace("/profile");
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

    if (loading || authLoading) {
        return <div className="p-4 md:p-8">Loading...</div>;
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/profile">
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
                        <Input id="username" value={userDb?.username} onChange={(e) => setUsername(e.target.value)} disabled />
                        <p className="text-xs text-muted-foreground">
                            Your username cannot be changed. <br /> Need to change, Contact Support..
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
                        <Link href="/profile">Cancel</Link>
                    </Button>
                    <Button onClick={handleSaveChanges} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
