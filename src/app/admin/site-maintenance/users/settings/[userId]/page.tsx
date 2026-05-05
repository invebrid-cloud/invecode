
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, User as UserIcon, Shield, Trash2, KeyRound, Ban } from "lucide-react";
import Link from "next/link";
// import { users as allUsers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { apiFetch } from "@/hooks/api";

interface User {
    id: string;
    name: string;
    email: string;
    canDeposit?: boolean;
    canInvest?: boolean;
    canAccessSite?: boolean;
}

export default function UserSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { userId } = params;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [canInvest, setCanInvest] = useState(true);
    const [canDeposit, setCanDeposit] = useState(true);
    const [canAccessSite, setCanAccessSite] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`);
                if (!res || !res.ok) throw new Error();

                const data = await res.json();
                setUser(data);

                // initialize switches from backend
                setCanDeposit(data.canDeposit ?? true);
                setCanInvest(data.canInvest ?? true);
                setCanAccessSite(data.canAccessSite ?? true);

            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch user",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) {
        return <p className="p-4">Loading user data...</p>;
    }

    if (!user) {
        return (
            <div className="flex-1 space-y-8 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>User Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The user with ID `{userId}` could not be found.</p>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href="/admin/site-maintenance/users">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to User Management
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSaveChanges = () => {
        // In a real app, you'd save these to a backend.
        // For now, we simulate it with toasts.
        if (!canAccessSite) {
            localStorage.setItem(`banned_${user.id}`, 'true');
        } else {
            localStorage.removeItem(`banned_${user.id}`);
        }
        toast({
            title: "Permissions Updated",
            description: `Settings for ${user.name} have been saved.`
        });
    }

    const handleAction = (action: string) => {
        toast({
            title: `Action: ${action}`,
            description: `The action has been simulated for ${user.name}.`
        });
    }

    const handleDeleteUser = async () => {
    try {
        const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/actions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "deleteUser",
                }),
            }
        );

        if (!res || !res.ok) throw new Error();

        toast({
            variant: "success",
            title: "User Deleted",
            description: `${user?.name} has been deleted.`,
            duration: 1500,
        });

        router.push("/admin/site-maintenance/users");

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete user.",
            duration: 1500,
        });
    }
};

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/site-maintenance/users">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to User Management
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                {/* <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Permissions</CardTitle>
                        <CardDescription>Control what this user can do on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="can-deposit" className="font-semibold">Deposit Access</Label>
                                <p className="text-xs text-muted-foreground">Allows the user to make new deposits.</p>
                            </div>
                            <Switch id="can-deposit" checked={canDeposit} onCheckedChange={setCanDeposit} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="can-invest" className="font-semibold">Investment Access</Label>
                                <p className="text-xs text-muted-foreground">Allows the user to make new investments.</p>
                            </div>
                            <Switch id="can-invest" checked={canInvest} onCheckedChange={setCanInvest} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="can-access" className="font-semibold">Site Access</Label>
                                <p className="text-xs text-muted-foreground">If disabled, the user will be blocked from the site.</p>
                            </div>
                            <Switch id="can-access" checked={canAccessSite} onCheckedChange={setCanAccessSite} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveChanges}>Save Permissions</Button>
                    </CardFooter>
                </Card> */}

                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                        <CardDescription>Perform critical actions on this user's account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Force Password Reset</p>
                                <p className="text-sm text-muted-foreground">The user will be required to set a new password on their next login.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="outline"><KeyRound className="mr-2 h-4 w-4" />Force Reset</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will log the user out of all sessions and require them to reset their password.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('Password Reset')}>Continue</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        {/* <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Suspend User</p>
                                <p className="text-sm text-muted-foreground">Temporarily disable account access without deleting data.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="secondary"><Ban className="mr-2 h-4 w-4" />Suspend</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will prevent the user from logging in until their account is reactivated.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('Suspend User')}>Continue</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div> */}
                        <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                            <div>
                                <p className="font-medium text-destructive">Delete User Account</p>
                                <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete User</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the user and all their data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteUser}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
