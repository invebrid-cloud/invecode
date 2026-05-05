

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { users, totalUsers, newlyRegisteredUsers, type User } from "@/lib/data";
import Image from "next/image";
import { apiFetch } from "@/hooks/api";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    country: string;
    totalBalance: number;
    status: "Active" | "Suspended" | "Pending";
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const getStatusVariant = (status: User['status']) => {
    switch (status) {
        case 'Active':
            return 'success';
        case 'Suspended':
            return 'destructive';
        case 'Pending':
            return 'secondary';
        default:
            return 'outline';
    }
};

export default function UserManagementPage() {
    const [stats, setStats] = useState<{ newUsers: number; totalUsers: number } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/summary`),
                    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`),
                ]);

                if (!statsRes || !statsRes.ok) throw new Error("Failed to fetch stats");
                if (!usersRes || !usersRes.ok) throw new Error("Failed to fetch users");

                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                setStats({
                    totalUsers: statsData.totalUsers,
                    newUsers: statsData.newUsers,
                });

                setUsers(usersData);
            } catch (error) {
                // console.error("Failed to fetch user stats", error);
                toast({ 
                    variant: "destructive",
                    title: "Error", 
                    description: "Failed to fetch user Stats.", 
                    duration: 1500,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


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

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                        <p className="text-xs text-muted-foreground">All registered users on the platform.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Newly Registered (30 days)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats?.newUsers ?? 0}</div>
                        <p className="text-xs text-muted-foreground">New sign-ups in the last month.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Accounts</CardTitle>
                    <CardDescription>Manage user accounts and permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden lg:table-cell">Country</TableHead>
                                    <TableHead className="hidden sm:table-cell">Total Balance</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0.5">
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{user.country}</TableCell>
                                        <TableCell className="hidden sm:table-cell font-mono">{formatCurrency(user.totalBalance)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={`/admin/site-maintenance/users/edit/${user.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={`/admin/site-maintenance/users/settings/${user.id}`}>
                                                        <Settings className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
