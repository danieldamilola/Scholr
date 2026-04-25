"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useFiles } from "@/hooks/useFiles";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNotifications } from "@/hooks/useNotifications";
import {
  FileText,
  Bookmark,
  Bell,
  Upload,
  BookOpen,
  ArrowRight,
  Search,
  Library,
  FolderOpen,
} from "lucide-react";
import { FileCard } from "@/components/files/FileCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function ClassRepDashboard() {
  const { user } = useUser();
  const { data: recentFiles, loading: filesLoading } = useFiles({
    page: 1,
    sortBy: "newest",
    materialType: "course_material",
  });
  const { bookmarkedFileIds } = useBookmarks();
  const { unreadCount } = useNotifications();

  const name = user?.profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const bookmarkedFiles =
    recentFiles?.filter((f) => bookmarkedFileIds.has(f.id)) || [];

  const stats = [
    { label: "Recent Files", value: recentFiles?.length ?? 0, icon: FileText },
    { label: "Bookmarks", value: bookmarkedFileIds.size, icon: Bookmark },
    { label: "Notifications", value: unreadCount, icon: Bell },
  ];

  const uploadActions = [
    {
      href: "/upload?tab=file",
      label: "Upload Course Material",
      icon: Upload,
      desc: "Share lecture notes, slides, past papers",
    },
    {
      href: "/upload?tab=book",
      label: "Upload Library Book",
      icon: BookOpen,
      desc: "Add textbooks and references",
    },
    {
      href: "/manage",
      label: "Manage My Files",
      icon: FolderOpen,
      desc: "View and delete your uploads",
    },
  ];

  const browseActions = [
    {
      href: "/browse",
      label: "Browse Files",
      icon: Search,
      desc: "Find course materials",
    },
    {
      href: "/library",
      label: "Library",
      icon: Library,
      desc: "Textbooks & references",
    },
    {
      href: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      desc: "Your saved files",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero greeting */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-ink mb-1">
          {greeting}, {name} 👋
        </h1>
        <p className="text-[14px] text-ink-muted">
          Class Representative ·{" "}
          {[
            user?.profile?.department,
            user?.profile?.level ? `Level ${user.profile.level}` : null,
          ]
            .filter(Boolean)
            .join(", ") || "Scholr"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-md p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                {label}
              </p>
              <div className="p-1.5 bg-subtle rounded-md">
                <Icon className="size-4 text-ink-muted" />
              </div>
            </div>
            <p className="text-3xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Upload Actions */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Upload &amp; Manage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {uploadActions.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 bg-surface border border-border rounded-md p-4 hover:shadow-sm transition-all"
            >
              <div className="p-2.5 bg-subtle group-hover:bg-brand-wash rounded-md transition-colors shrink-0">
                <Icon className="size-5 text-ink-muted group-hover:text-brand-muted transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-ink-muted">{desc}</p>
              </div>
              <ArrowRight className="size-4 text-ink-muted opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Browse Actions */}
      <div className="mb-10">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Browse &amp; Study
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {browseActions.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 bg-surface border border-border rounded-md p-4 hover:shadow-sm transition-all"
            >
              <div className="p-2.5 bg-subtle group-hover:bg-brand-wash rounded-md transition-colors shrink-0">
                <Icon className="size-5 text-ink-muted group-hover:text-brand-muted transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-ink-muted">{desc}</p>
              </div>
              <ArrowRight className="size-4 text-ink-muted opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-ink">Recent Files</h2>
          <Link
            href="/browse"
            className="text-sm text-brand-muted hover:text-brand flex items-center gap-1"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {filesLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : recentFiles && recentFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFiles.slice(0, 6).map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isBookmarked={bookmarkedFileIds.has(file.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-md py-12 text-center">
            <FileText
              className="size-7 text-ink-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-ink-muted">No files available yet.</p>
          </div>
        )}
      </div>

      {/* Bookmarks (if any) */}
      {bookmarkedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-ink">
              Your Bookmarks
            </h2>
            <Link
              href="/bookmarks"
              className="text-sm text-brand-muted hover:text-brand flex items-center gap-1"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedFiles.slice(0, 3).map((file) => (
              <FileCard key={file.id} file={file} isBookmarked />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
