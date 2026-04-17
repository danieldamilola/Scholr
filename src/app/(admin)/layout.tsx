import RoleGuard from "@/components/auth/RoleGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserProvider } from "@/contexts/UserContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-64">{children}</div>
        </div>
      </RoleGuard>
    </UserProvider>
  );
}
