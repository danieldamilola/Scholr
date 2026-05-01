"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  BookOpen,
  Users,
  Library,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { createClientSingleton } from "@/lib/supabase/client";
import {
  colleges,
  departments,
  programmes,
  levels,
  type Role,
  type Department,
  type Programme,
} from "@/lib/academic-data";

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  college?: string;
  department?: string;
  programme?: string;
  level?: string;
  signupCode?: string;
  general?: string;
};

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [level, setLevel] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const availableDepartments: Department[] = college
    ? departments[college] || []
    : [];
  const availableProgrammes: Programme[] = department
    ? programmes[department] || []
    : [];

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setDepartment("");
    setProgramme("");
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setProgramme("");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!role) newErrors.role = "Please select a role";

    // Librarians don't need college/dept/programme/level
    if (role !== "librarian") {
      if (!college) newErrors.college = "Please select a college";
      if (!department) newErrors.department = "Please select a department";
      if (role !== "lecturer") {
        if (!programme) newErrors.programme = "Please select a programme";
        if (!level) newErrors.level = "Please select a level";
      }
    }

    if (!signupCode) {
      newErrors.signupCode = "Sign up code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const codeRes = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: signupCode }),
      });
      const codeData = await codeRes.json();
      if (!codeData.valid) {
        setErrors({ signupCode: "Invalid sign up code" });
        setIsLoading(false);
        return;
      }

      const supabase = createClientSingleton();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            college,
            department,
            programmes: [programme],
            level,
          },
        },
      });

      if (error) {
        setErrors({ general: error.message });
      } else if (data?.session) {
        window.location.href = "/dashboard";
      } else {
        // Email confirmation required
        setShowSuccessDialog(true);
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { id: "student" as Role, label: "Student", icon: GraduationCap },
    { id: "lecturer" as Role, label: "Lecturer", icon: BookOpen },
    { id: "class_rep" as Role, label: "Class Rep", icon: Users },
    { id: "librarian" as Role, label: "Librarian", icon: Library },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-page py-12 px-4">
      <div className="bg-surface border border-none rounded-md p-8 w-full max-w-lg drop-shadow-lg drop-shadow-gray-100">
        <h1 className="text-ink font-bold text-xl mb-1">Scholr</h1>
        <p className="text-ink-muted text-sm mb-6">
          Create your account to get started.
        </p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-3">
            Account Details
          </p>

          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-ink-soft text-sm font-medium mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-ink-soft text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-ink-soft text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-ink-soft text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="signupCode"
              className="block text-ink-soft text-sm font-medium mb-1"
            >
              Sign Up Code
            </label>
            <input
              id="signupCode"
              type="text"
              value={signupCode}
              onChange={(e) => setSignupCode(e.target.value)}
              placeholder="Enter MTU sign up code"
              className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3"
              disabled={isLoading}
            />
            {errors.signupCode && (
              <p className="text-destructive text-sm mt-1">
                {errors.signupCode}
              </p>
            )}
          </div>

          <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-3 mt-6">
            Academic Profile
          </p>

          <div className="mb-4">
            <label className="block text-ink-soft text-sm font-medium mb-2">
              Role
            </label>
            <div className="flex gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-md border transition-colors ${
                      isSelected
                        ? "bg-brand-wash border-brand text-brand"
                        : "bg-surface border-border text-ink-soft hover:border-border"
                    }`}
                  >
                    <Icon className="size-5 mb-1" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-destructive text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {role !== "librarian" && (
            <>
              <div className="mb-4">
                <label className="block text-ink-soft text-sm font-medium mb-1">
                  College
                </label>
                <Select
                  value={college}
                  onValueChange={handleCollegeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.college && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.college}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-ink-soft text-sm font-medium mb-1">
                  Department
                </label>
                <Select
                  value={department}
                  onValueChange={handleDepartmentChange}
                  disabled={!college || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        college ? "Select department" : "Select a college first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.department}
                  </p>
                )}
              </div>
            </>
          )}

          {role !== "lecturer" && role !== "librarian" && (
            <>
              <div className="mb-4">
                <label className="block text-ink-soft text-sm font-medium mb-1">
                  Programme
                </label>
                <Select
                  value={programme}
                  onValueChange={setProgramme}
                  disabled={!department || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        department
                          ? "Select programme"
                          : "Select a department first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProgrammes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programme && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.programme}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-ink-soft text-sm font-medium mb-1">
                  Level
                </label>
                <Select
                  value={level}
                  onValueChange={setLevel}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.level}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-ink-muted text-sm mt-4 text-center">
          {"Already have an account? "}
          <Link href="/login" className="text-brand-muted hover:text-brand">
            Sign in
          </Link>
        </p>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <CheckCircle2 className="size-6 text-brand" />
            </AlertDialogMedia>
            <AlertDialogTitle>Check your email</AlertDialogTitle>
            <AlertDialogDescription>
              We have sent a verification link to{" "}
              <span className="font-medium text-ink">{email}</span>. Please
              check your inbox and click the link to verify your account, then
              sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-9 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
              >
                Go to Sign In
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
