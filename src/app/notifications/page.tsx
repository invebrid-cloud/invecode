
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
// import { type Notification } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCheck, MailOpen } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { apiFetch } from "@/hooks/api";

export default function NotificationsPage() {
  const user = useUser();
  type UserNotification = {
    id: number;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  };
  const { notifications, setNotifications, loading } = useNotifications();
  const [updating, setUpdating] = useState(false);

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const token = localStorage.getItem("token");

  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/trans/notify/me`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       setNotifications(data.notifications);
  //     } catch (error) {
  //       console.error("Failed to fetch transactions", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchNotifications();
  // }, []);

  const markAsRead = async (id: number) => {
    // Optimistically update first
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
     const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`,
        { method: "PATCH" }
      );
       if (!res || !res.ok) {
                throw new Error("No response from server");
            }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    // Update UI after success
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    try {
      setUpdating(true);

      await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
        }
      );

    } catch (error) {
      console.error("Failed to mark all as read", error);
    } finally {
      setUpdating(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have {unreadCount} unread messages.</CardDescription>
          </div>
          <Button onClick={markAllAsRead} disabled={unreadCount === 0 || updating} className="w-full md:w-auto">
            <MailOpen className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <div>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Loading notifications...</p>
                </div>
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>You have no notifications.</p>
              </div>
            )}
            {!loading && notifications.length > 0 && notifications.map((notification) => (
              <Dialog key={notification.id}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "flex items-start gap-4 rounded-lg border p-4 text-left text-sm transition-all hover:bg-secondary/50 cursor-pointer",
                      !notification.read && "bg-secondary"
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        notification.read ? "text-muted-foreground cursor-default" : "text-primary hover:text-primary"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{notification.title}</DialogTitle>
                    <DialogDescription className="pt-2">{new Date(notification.createdAt).toLocaleString()}</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">{notification.message}</div>
                </DialogContent>
              </Dialog>
            ))

            }

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
