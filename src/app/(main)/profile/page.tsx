"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClientSingleton } from "@/lib/supabase/client";
import {
  User,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLLEGES, DEPARTMENTS, PROGRAMMES, LEVELS } from "@/constants";
import { UserProfile } from "@/types";

type Tab = "profile" | "password";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile Information", icon: User },
  { id: "password", label: "Account Security", icon: Lock },
];

// ─── Reusable field row ───
function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

// ─── Read-only input ───
function ReadOnlyInput({ value }: { value: string }) {
  return (
    <div className="flex h-9 w-full items-center rounded-md border border-border bg-subtle px-3 text-sm text-ink-muted select-none">
      {value}
    </div>
  );
}

// ─── Editable text input ───
function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-shadow"
    />
  );
}

// ─── Password input ───
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-shadow"
    />
  );
}

// ─── Toast message ───
function Toast({
  message,
}: {
  message: { type: "success" | "error"; text: string };
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 p-3 rounded-md text-sm border",
        message.type === "success"
          ? "bg-success-bg border-success text-success-text"
          : "bg-error-bg border-error text-error-text",
      )}
    >
      {message.type === "success" ? (
        <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
      )}
      {message.text}
    </div>
  );
}

// ─── Profile Form ───
function ProfileForm({
  user,
}: {
  user: {
    profile: UserProfile | null;
    session: import("@supabase/supabase-js").Session | null;
  };
}) {
  const profile = user.profile;

  const [college, setCollege] = useState(profile?.college || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [programme, setProgramme] = useState(profile?.programmes?.[0] || "");
  const [level, setLevel] = useState(profile?.level || "");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const availableDepts = college
    ? (DEPARTMENTS as unknown as Record<string, readonly string[]>)[college] ||
      []
    : [];
  const availableProgs = department
    ? (PROGRAMMES as unknown as Record<string, readonly string[]>)[
        department
      ] || []
    : [];

  const handleCollegeChange = (v: string) => {
    setCollege(v);
    setDepartment("");
    setProgramme("");
  };
  const handleDeptChange = (v: string) => {
    setDepartment(v);
    setProgramme("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);
    try {
      const supabase = createClientSingleton();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("profiles") as any)
        .update({
          college: college || null,
          department: department || null,
          programmes: programme ? [programme] : null,
          level: level || null,
        })
        .eq("id", profile?.id ?? "");
      if (error) throw error;

      setToast({ type: "success", text: "Profile updated successfully." });
    } catch {
      setToast({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {toast && <Toast message={toast} />}

      {/* Read-only row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" hint="Name cannot be changed">
          <ReadOnlyInput value={profile?.full_name || "—"} />
        </Field>
        <Field label="Email" hint="Email cannot be changed">
          <ReadOnlyInput
            value={profile?.email || user.session?.user?.email || "—"}
          />
        </Field>
      </div>

      {/* Role — read-only */}
      <Field label="Role" hint="Contact an admin to change your role">
        <ReadOnlyInput value={profile?.role?.replace("_", " ") || "—"} />
      </Field>

      {profile?.role !== "librarian" && (
        <>
          <hr className="border-border" />
          <p className="text-sm font-medium text-ink">
            Academic Information
          </p>

          {/* College */}
          <Field label="College">
            <Select value={college} onValueChange={handleCollegeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {[...COLLEGES].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Department */}
          <Field label="Department">
            <Select
              value={department}
              onValueChange={handleDeptChange}
              disabled={!college}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    college ? "Select department" : "Select college first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableDepts.map((d: string) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Programme */}
          <Field label="Programme">
            <Select
              value={programme}
              onValueChange={setProgramme}
              disabled={!department}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    department ? "Select programme" : "Select department first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableProgs.map((p: string) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Level */}
          <Field label="Level">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {[...LEVELS].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 h-9 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ─── Password Form ───
function PasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (newPassword.length < 8) {
      setToast({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClientSingleton();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setToast({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setToast({
        type: "error",
        text: "Failed to update password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {toast && <Toast message={toast} />}

      <div className="p-4 bg-subtle border border-border rounded-md text-sm text-ink-muted">
        Choose a strong password with at least 8 characters.
      </div>

      <Field label="New Password">
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Minimum 8 characters"
          disabled={isLoading}
        />
      </Field>

      <Field label="Confirm New Password">
        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter new password"
          disabled={isLoading}
        />
      </Field>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-2 h-9 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  );
}

// ─── Main Profile Page ───
export default function ProfilePage() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 text-ink-muted animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-sm text-ink-muted">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  const initials =
    user.profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Profile &amp; Settings
        </h1>
        <p className="text-[14px] text-ink-muted">
          Manage your academic details and account security.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Left sidebar ─── */}
        <div className="lg:w-64 shrink-0 space-y-3">
          {/* Avatar card */}
          <div className="bg-surface border border-border rounded-md p-5 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-subtle text-ink text-2xl font-semibold mb-3">
              {initials}
            </div>
            <p className="text-sm font-semibold text-ink leading-tight">
              {user.profile?.full_name}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              {user.profile?.email || user.session?.user?.email}
            </p>
            <span className="mt-2 inline-block bg-subtle text-ink-muted text-xs px-2 py-0.5 rounded-sm capitalize">
              {user.profile?.role?.replace("_", " ")}
            </span>
          </div>

          {/* Tab nav */}
          <nav className="bg-surface border border-border rounded-md overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center justify-between gap-2.5 px-4 py-3 text-sm transition-colors border-b border-border last:border-0",
                  activeTab === id
                    ? "bg-brand-wash text-brand font-medium"
                    : "text-ink-soft hover:bg-subtle hover:text-ink",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  {label}
                </span>
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-colors",
                    activeTab === id ? "text-brand-muted" : "text-ink-muted",
                  )}
                />
              </button>
            ))}
          </nav>
        </div>

        {/* ─── Right content ─── */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-border rounded-md">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-ink">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-[13px] text-ink-muted mt-0.5">
                {activeTab === "profile"
                  ? "Update your academic information. Name, email, and role are read-only."
                  : "Set a new password for your Scholr account."}
              </p>
            </div>

            {/* Card body */}
            <div className="px-6 py-6">
              {activeTab === "profile" ? (
                <ProfileForm user={user} />
              ) : (
                <PasswordForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
