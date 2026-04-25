"use client";

import Link from "next/link";
import { BookOpen, Upload, Settings, Bell, Users } from "lucide-react";

interface LibrarianDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

export function LibrarianDashboard({ user }: LibrarianDashboardProps) {
  const name = user?.profile?.full_name?.split(" ")[0] || "Librarian";

  const actions = [
    {
      href: "/library/upload",
      icon: Upload,
      label: "Upload Book",
      desc: "Add a new textbook or reference to the library",
      primary: true,
    },
    {
      href: "/library",
      icon: BookOpen,
      label: "Browse Library",
      desc: "View all books available to students",
      primary: false,
    },
    {
      href: "/manage-books",
      icon: Settings,
      label: "Manage Books",
      desc: "Edit or remove books you uploaded",
      primary: false,
    },
    {
      href: "/requests",
      icon: Bell,
      label: "Book Requests",
      desc: "Review requests from students for new books",
      primary: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Welcome, {name} 📚
        </h1>
        <p className="text-sm text-ink-muted">
          Librarian · Manage the MTU digital library
        </p>
      </div>

      {/* Quick Actions */}
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-4">
        Quick Actions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex flex-col gap-3 p-5 rounded-md border transition-all hover:shadow-sm ${
                action.primary
                  ? "bg-brand border-brand text-white hover:bg-brand-hover"
                  : "bg-surface border-border text-ink-soft hover:border-border"
              }`}
            >
              <div
                className={`inline-flex size-9 items-center justify-center rounded-md ${
                  action.primary
                    ? "bg-white/20"
                    : "bg-subtle group-hover:bg-subtle/80"
                } transition-colors`}
              >
                <Icon
                  className={`size-5 ${action.primary ? "text-white" : "text-ink-muted"}`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold mb-0.5 ${action.primary ? "text-white" : "text-ink"}`}
                >
                  {action.label}
                </p>
                <p
                  className={`text-xs leading-relaxed ${action.primary ? "text-brand-wash-text" : "text-ink-muted"}`}
                >
                  {action.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-subtle border border-border rounded-md p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-surface border border-border rounded-md shrink-0">
            <Users className="size-5 text-ink-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Your Role</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              As a <strong className="text-ink-soft">Librarian</strong>, you are
              responsible for managing the MTU digital library. Only you can
              upload and manage books. Students can browse and request books
              through the library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
