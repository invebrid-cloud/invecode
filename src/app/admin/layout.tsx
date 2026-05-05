
import { AdminAppShell } from "@/components/admin-app-shell";
import { UserProvider } from "@/hooks/use-user";
import { NotificationProvider } from "@/hooks/admn-use-notifications";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <NotificationProvider>
        <AdminAppShell>
          {children}
        </AdminAppShell>
      </NotificationProvider>
    </UserProvider>
  );
}
