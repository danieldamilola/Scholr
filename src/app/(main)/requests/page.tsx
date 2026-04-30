"use client";

import { useState, useCallback } from "react";
import {
  useRequests,
  type RequestType,
  type Request,
} from "@/hooks/useRequests";
import { useUser } from "@/hooks/useUser";
import { createClientSingleton } from "@/lib/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
  Bell,
  Inbox,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-success-bg text-success-text border-success",
    icon: CheckCircle2,
  },
  denied: {
    label: "Denied",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "denied";
}) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg.className,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

// ── Request card ────────────────────────────────────────────────────────────
function RequestCard({
  req,
  isStaff,
  onRespond,
}: {
  req: Request;
  isStaff: boolean;
  onRespond?: (
    id: string,
    status: "approved" | "denied",
    message?: string,
  ) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async (status: "approved" | "denied") => {
    if (!onRespond) return;
    setSubmitting(true);
    try {
      await onRespond(req.id, status, message.trim() || undefined);
      setResponding(false);
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono bg-subtle text-ink-soft px-2 py-0.5 rounded-sm uppercase">
                {req.type}
              </span>
              {req.course_code && (
                <span className="text-xs font-mono bg-subtle text-ink-soft px-2 py-0.5 rounded-sm">
                  {req.course_code}
                </span>
              )}
              <StatusBadge status={req.status} />
            </div>
            <p className="text-sm font-semibold text-ink mb-0.5">{req.title}</p>
            {isStaff ? (
              <p className="text-xs text-ink-muted">
                From{" "}
                <span className="text-ink-soft font-medium">
                  {req.requester_name}
                </span>
                {" · "}
                <span className="capitalize">
                  {req.requester_role.replace("_", " ")}
                </span>
              </p>
            ) : (
              <p className="text-xs text-ink-muted">
                Sent to{" "}
                <span className="text-ink-soft font-medium">
                  {req.target_name ??
                    `any ${req.target_role.replace("_", " ")}`}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <time className="text-xs text-ink-muted">
              {new Date(req.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-ink-muted hover:text-ink-soft transition-colors"
            >
              {expanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-5 space-y-4 bg-subtle/50">
          {req.description && (
            <div>
              <p className="text-xs font-medium text-ink-muted mb-1">
                Description
              </p>
              <p className="text-sm text-ink-soft">{req.description}</p>
            </div>
          )}
          {isStaff && req.status === "pending" && !responding && (
            <button
              type="button"
              onClick={() => setResponding(true)}
              className="text-sm text-brand hover:text-brand-hover font-medium"
            >
              Respond to this request →
            </button>
          )}
          {isStaff && req.status === "pending" && responding && (
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message to the requester"
                rows={3}
                className="w-full text-sm bg-surface border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-ink placeholder:text-ink-muted"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRespond("approved")}
                  className="inline-flex items-center gap-1.5 h-8 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}{" "}
                  Approve
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRespond("denied")}
                  className="inline-flex items-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <XCircle className="size-3" />
                  )}{" "}
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResponding(false);
                    setMessage("");
                  }}
                  className="h-8 px-3 text-xs text-ink-muted hover:text-ink-soft border border-border rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {req.response_message && (
            <div
              className={cn(
                "rounded-md p-3 text-xs border",
                req.status === "approved"
                  ? "bg-success-bg border-success text-success-text"
                  : "bg-error-bg border-error text-error-text",
              )}
            >
              <span className="font-medium">Response: </span>
              {req.response_message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Person search ────────────────────────────────────────────────────────────
interface ProfileResult {
  id: string;
  full_name: string;
  role: string;
}

function PersonSearch({
  role,
  onSelect,
  selected,
}: {
  role: string;
  selected: ProfileResult | null;
  onSelect: (p: ProfileResult | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      setSearching(true);
      const supabase = createClientSingleton();
      const dbRole = role === "classrep" ? "class_rep" : role;
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("role", dbRole)
        .ilike("full_name", `%${q}%`)
        .limit(8);
      setResults((data as ProfileResult[]) || []);
      setOpen(true);
      setSearching(false);
    },
    [role],
  );

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-2 h-9 px-3 bg-brand-wash border border-border rounded-md">
          <User className="size-3.5 text-brand shrink-0" />
          <span className="text-sm text-brand-text font-medium flex-1">
            {selected.full_name}
          </span>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
              setResults([]);
            }}
            className="text-brand-muted hover:text-brand text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                search(e.target.value);
              }}
              placeholder={`Search by name (e.g. Dr. Okonkwo, Prof. Smith)`}
              className="h-9 w-full bg-surface border border-border rounded-md text-sm text-ink px-3 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-ink-muted"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted animate-spin" />
            )}
          </div>

          {open && results.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-raised border border-border rounded-md shadow-lg overflow-hidden">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setQuery("");
                    setResults([]);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-subtle transition-colors"
                >
                  <div className="size-7 rounded-full bg-brand-wash flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-brand">
                      {p.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {p.full_name}
                    </p>
                    <p className="text-xs text-ink-muted capitalize">
                      {p.role.replace("_", " ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {open && results.length === 0 && query.length >= 2 && !searching && (
            <div className="absolute z-20 w-full mt-1 bg-raised border border-border rounded-md shadow-lg px-3 py-3">
              <p className="text-sm text-ink-muted">
                No {role.replace("_", " ")}s found matching &ldquo;{query}
                &rdquo;
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Role config ─────────────────────────────────────────────────────────────
const AVAILABLE_TARGETS: Record<string, { role: string; label: string }[]> = {
  student: [
    { role: "lecturer", label: "Lecturer" },
    { role: "class_rep", label: "Class Rep" },
    { role: "librarian", label: "Librarian" },
  ],
  lecturer: [{ role: "admin", label: "Admin" }],
  class_rep: [
    { role: "lecturer", label: "Lecturer" },
    { role: "admin", label: "Admin" },
  ],
  librarian: [{ role: "admin", label: "Admin" }],
  admin: [],
};

// ── Main page ────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const { user } = useUser();
  const {
    myRequests,
    incomingRequests,
    loading,
    error,
    createRequest,
    respondToRequest,
  } = useRequests();

  const [activeTab, setActiveTab] = useState<"mine" | "incoming">("mine");
  const [showForm, setShowForm] = useState(false);

  const [fType, setFType] = useState<RequestType>("file");
  const [fTargetRole, setFTargetRole] = useState("");
  const [fTargetPerson, setFTargetPerson] = useState<ProfileResult | null>(
    null,
  );
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCourse, setFCourse] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const role = user?.profile?.role || "student";
  const isStaff = ["admin", "lecturer", "class_rep", "librarian"].includes(
    role,
  );
  const availableTargets = AVAILABLE_TARGETS[role] || [];

  const resetForm = () => {
    setFType("file");
    setFTargetRole("");
    setFTargetPerson(null);
    setFTitle("");
    setFDesc("");
    setFCourse("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTargetRole || !fTitle.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!fTargetPerson) {
      setFormError(
        "Please search and select a specific person to send your request to.",
      );
      return;
    }
    setFormError(null);
    setFormLoading(true);
    try {
      await createRequest({
        target_role: fTargetRole,
        target_id: fTargetPerson?.id || null,
        target_name: fTargetPerson?.full_name || null,
        type: fType,
        title: fTitle.trim(),
        description: fDesc.trim() || undefined,
        course_code: fCourse.trim() || undefined,
      });
      setFormSuccess(true);
      setShowForm(false);
      resetForm();
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to submit request",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const inputCls =
    "h-9 w-full bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">Requests</h1>
          <p className="text-sm text-ink-muted">
            {isStaff
              ? "Manage incoming requests and track ones you submitted"
              : "Request materials from a specific lecturer, class rep, or librarian"}
          </p>
        </div>
        {availableTargets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 h-9 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
          >
            <Send className="size-4" /> New Request
          </button>
        )}
      </div>

      {/* Success banner */}
      {formSuccess && (
        <div className="flex items-center gap-2 bg-success-bg border border-success text-success-text rounded-md px-4 py-3 text-sm mb-6">
          <CheckCircle2 className="size-4 shrink-0" /> Request sent
          successfully!
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-md p-6 mb-8 space-y-4"
        >
          <p className="text-sm font-semibold text-ink mb-2">New Request</p>

          {formError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-3 border border-red-100">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" /> {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">
                Request Type *
              </label>
              <select
                value={fType}
                onChange={(e) => setFType(e.target.value as RequestType)}
                className={inputCls}
              >
                <option value="file">Course File / Notes</option>
                <option value="book">Book</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">
                Send To *
              </label>
              <select
                value={fTargetRole}
                onChange={(e) => {
                  setFTargetRole(e.target.value);
                  setFTargetPerson(null);
                }}
                className={inputCls}
              >
                <option value="">Select role...</option>
                {availableTargets.map((t) => (
                  <option key={t.role} value={t.role}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Person search — only shows once a role is selected */}
          {fTargetRole && fTargetRole !== "admin" && (
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">
                Search specific person *{" "}
                <span className="font-normal text-ink-muted">
                  (e.g. Dr. Okonkwo, Prof. Smith, Mr. Adams)
                </span>
              </label>
              <PersonSearch
                role={fTargetRole}
                selected={fTargetPerson}
                onSelect={setFTargetPerson}
              />
            </div>
          )}
          {fTargetRole === "admin" && (
            <p className="text-xs text-ink-muted bg-subtle rounded-md px-3 py-2 border border-border">
              Your request will be sent to the administrator.
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Title / What you need *
            </label>
            <input
              type="text"
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
              placeholder="e.g. GST 401 lecture slides, Introduction to Calculus textbook"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Description
            </label>
            <textarea
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              placeholder="More details about what you need..."
              rows={3}
              className="w-full bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Course Code
            </label>
            <input
              type="text"
              value={fCourse}
              onChange={(e) => setFCourse(e.target.value)}
              placeholder="e.g. CSC401"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center gap-2 h-9 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              {formLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}{" "}
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="h-9 px-4 text-sm text-ink-muted hover:text-ink-soft border border-border rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      {isStaff && (
        <div className="flex border-b border-border mb-6">
          {[
            { id: "mine", label: "My Requests", count: myRequests.length },
            {
              id: "incoming",
              label: "Incoming",
              count: incomingRequests.filter((r) => r.status === "pending")
                .length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "mine" | "incoming")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink-soft",
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                    activeTab === tab.id
                      ? "bg-brand-wash text-brand"
                      : "bg-subtle text-ink-muted",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 text-ink-muted animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-md p-4 border border-red-100">
          <AlertCircle className="size-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* My Requests */}
      {!loading && (!isStaff || activeTab === "mine") && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell
                className="size-10 text-ink-muted opacity-40 mb-3"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-ink mb-1">
                No requests yet
              </p>
              <p className="text-xs text-ink-muted">
                Use &ldquo;New Request&rdquo; to ask for course materials or
                books.
              </p>
            </div>
          ) : (
            myRequests.map((req) => (
              <RequestCard key={req.id} req={req} isStaff={false} />
            ))
          )}
        </div>
      )}

      {/* Incoming (staff only) */}
      {!loading && isStaff && activeTab === "incoming" && (
        <div className="space-y-3">
          {incomingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox
                className="size-10 text-ink-muted opacity-40 mb-3"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-ink mb-1">
                No incoming requests
              </p>
              <p className="text-xs text-ink-muted">
                Requests from students will appear here.
              </p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                isStaff
                onRespond={respondToRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
