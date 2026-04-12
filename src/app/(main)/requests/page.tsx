'use client'

import { useState } from 'react'
import { useRequests, type RequestType, type Request } from '@/hooks/useRequests'
import { useUser } from '@/hooks/useUser'
import {
  CheckCircle2, XCircle, Clock, Send, Loader2, Bell, Inbox,
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  className: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: Clock },
  approved: { label: 'Approved', className: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircle2 },
  denied:   { label: 'Denied',   className: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'denied' }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.className)}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  )
}

function RequestCard({ req, onRespond, isStaff }: {
  req: Request
  isStaff: boolean
  onRespond?: (id: string, status: 'approved' | 'denied', message?: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [responding, setResponding] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleRespond = async (status: 'approved' | 'denied') => {
    if (!onRespond) return
    setSubmitting(true)
    try {
      await onRespond(req.id, status, message.trim() || undefined)
      setResponding(false)
      setMessage('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-[10px] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-sm uppercase">
                {req.type}
              </span>
              {req.course_code && (
                <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-sm">
                  {req.course_code}
                </span>
              )}
              <StatusBadge status={req.status} />
            </div>
            <p className="text-sm font-semibold text-zinc-900 mb-0.5">{req.title}</p>
            {isStaff && (
              <p className="text-xs text-zinc-400">
                From <span className="text-zinc-600 font-medium">{req.requester_name}</span>
                {' '}·{' '}
                <span className="capitalize">{req.requester_role.replace('_', ' ')}</span>
              </p>
            )}
            {!isStaff && (
              <p className="text-xs text-zinc-400">
                Sent to <span className="text-zinc-600 font-medium capitalize">{req.target_role.replace('_', ' ')}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <time className="text-xs text-zinc-400">
              {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </time>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-100 p-5 space-y-4 bg-zinc-50/50">
          {req.description && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-700">{req.description}</p>
            </div>
          )}
          {(req.college || req.department) && (
            <div className="flex gap-4">
              {req.college && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-0.5">College</p>
                  <p className="text-sm text-zinc-700">{req.college}</p>
                </div>
              )}
              {req.department && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-0.5">Department</p>
                  <p className="text-sm text-zinc-700">{req.department}</p>
                </div>
              )}
            </div>
          )}

          {/* Staff response area */}
          {isStaff && req.status === 'pending' && !responding && (
            <button
              type="button"
              onClick={() => setResponding(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Respond to this request →
            </button>
          )}

          {isStaff && req.status === 'pending' && responding && (
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Optional message to the requester (e.g. 'Will upload by Friday')"
                rows={3}
                className="w-full text-sm bg-white border border-zinc-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRespond('approved')}
                  className="inline-flex items-center gap-1.5 h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                  Approve
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRespond('denied')}
                  className="inline-flex items-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3" />}
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => { setResponding(false); setMessage('') }}
                  className="h-8 px-3 text-xs text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Response message */}
          {req.response_message && (
            <div className={cn(
              'rounded-md p-3 text-xs border',
              req.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            )}>
              <span className="font-medium">Response: </span>{req.response_message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const TARGET_ROLES: Record<string, { label: string; roles: string[] }> = {
  student: {
    label: 'Who are you requesting from?',
    roles: ['lecturer', 'class_rep', 'librarian'],
  },
  lecturer: {
    label: 'Who are you requesting from?',
    roles: ['admin'],
  },
  class_rep: {
    label: 'Who are you requesting from?',
    roles: ['lecturer', 'admin'],
  },
  librarian: {
    label: 'Who are you requesting from?',
    roles: ['admin'],
  },
  admin: { label: '', roles: [] },
}

const ROLE_LABELS: Record<string, string> = {
  lecturer: 'Lecturer',
  class_rep: 'Class Rep',
  librarian: 'Librarian',
  admin: 'Admin',
}

export default function RequestsPage() {
  const { user } = useUser()
  const { myRequests, incomingRequests, loading, error, createRequest, respondToRequest } = useRequests()

  const [activeTab, setActiveTab] = useState<'mine' | 'incoming'>('mine')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [fType, setFType] = useState<RequestType>('file')
  const [fTarget, setFTarget] = useState('')
  const [fTitle, setFTitle] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fCourse, setFCourse] = useState('')
  const [fCollege, setFCollege] = useState('')
  const [fDept, setFDept] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  const role = user?.profile?.role || 'student'
  const isStaff = ['admin', 'lecturer', 'class_rep', 'librarian'].includes(role)
  const availableTargets = TARGET_ROLES[role]?.roles || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fTarget || !fTitle.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }
    setFormError(null)
    setFormLoading(true)
    try {
      await createRequest({
        target_role: fTarget,
        type: fType,
        title: fTitle.trim(),
        description: fDesc.trim() || undefined,
        course_code: fCourse.trim() || undefined,
        college: fCollege.trim() || undefined,
        department: fDept.trim() || undefined,
      })
      setFormSuccess(true)
      setShowForm(false)
      setFType('file'); setFTarget(''); setFTitle(''); setFDesc('')
      setFCourse(''); setFCollege(''); setFDept('')
      setTimeout(() => setFormSuccess(false), 4000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setFormLoading(false)
    }
  }

  const inputCls = 'h-9 w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Requests</h1>
          <p className="text-sm text-zinc-500">
            {isStaff
              ? 'Manage incoming requests and track ones you submitted'
              : 'Request course materials or books from lecturers, class reps, or the library'}
          </p>
        </div>
        {availableTargets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Send className="size-4" />
            New Request
          </button>
        )}
      </div>

      {/* Success banner */}
      {formSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm mb-6">
          <CheckCircle2 className="size-4 shrink-0" /> Request submitted! They&apos;ll be notified.
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-[10px] p-6 mb-8 space-y-4">
          <p className="text-sm font-semibold text-zinc-900 mb-2">New Request</p>

          {formError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-3 border border-red-100">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" /> {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Request Type *</label>
              <select
                value={fType}
                onChange={e => setFType(e.target.value as RequestType)}
                className={inputCls}
              >
                <option value="file">Course File / Notes</option>
                <option value="book">Book</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                {TARGET_ROLES[role]?.label || 'Send To'} *
              </label>
              <select
                value={fTarget}
                onChange={e => setFTarget(e.target.value)}
                className={inputCls}
              >
                <option value="">Select...</option>
                {availableTargets.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Title / What you need *</label>
            <input
              type="text"
              value={fTitle}
              onChange={e => setFTitle(e.target.value)}
              placeholder="e.g. GST 401 lecture slides, Introduction to Calculus textbook"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={fDesc}
              onChange={e => setFDesc(e.target.value)}
              placeholder="More details about what you need..."
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Course Code</label>
              <input type="text" value={fCourse} onChange={e => setFCourse(e.target.value)} placeholder="e.g. CSC401" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">College</label>
              <input type="text" value={fCollege} onChange={e => setFCollege(e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Department</label>
              <input type="text" value={fDept} onChange={e => setFDept(e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center gap-2 h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              {formLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 px-4 text-sm text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs (staff only) */}
      {isStaff && (
        <div className="flex border-b border-zinc-200 mb-6">
          {[
            { id: 'mine', label: 'My Requests', count: myRequests.length },
            { id: 'incoming', label: 'Incoming', count: incomingRequests.filter(r => r.status === 'pending').length },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'mine' | 'incoming')}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'inline-flex items-center justify-center size-5 rounded-full text-xs font-semibold',
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 text-zinc-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-md p-4 border border-red-100">
          <AlertCircle className="size-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* My Requests */}
      {!loading && (!isStaff || activeTab === 'mine') && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="size-10 text-zinc-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-900 mb-1">No requests yet</p>
              <p className="text-xs text-zinc-400">
                Use &ldquo;New Request&rdquo; to ask for course materials or books.
              </p>
            </div>
          ) : (
            myRequests.map(req => (
              <RequestCard key={req.id} req={req} isStaff={false} />
            ))
          )}
        </div>
      )}

      {/* Incoming Requests (staff only) */}
      {!loading && isStaff && activeTab === 'incoming' && (
        <div className="space-y-3">
          {incomingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="size-10 text-zinc-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-900 mb-1">No incoming requests</p>
              <p className="text-xs text-zinc-400">Requests from students will appear here.</p>
            </div>
          ) : (
            incomingRequests.map(req => (
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
  )
}
