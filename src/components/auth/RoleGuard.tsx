"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, router, allowedRoles]);

  if (
    loading ||
    !user?.session ||
    !user?.role ||
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full size-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
