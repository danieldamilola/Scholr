"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { createClientSingleton } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClientSingleton();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 border-r border-border bg-surface h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-[16px] font-semibold text-ink">Scholr</h1>
        <p className="text-xs text-ink-muted mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-wash text-brand"
                  : "text-ink-muted hover:bg-subtle hover:text-ink"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — logout */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-ink-muted hover:bg-subtle hover:text-red-600 transition-colors group"
        >
          <LogOut className="size-4 group-hover:text-red-500 transition-colors" />
          Log out
        </button>
      </div>
    </div>
  );
}
