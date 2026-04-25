"use client";

import { useEffect, useState } from "react";
import { createClientSingleton } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const supabase = createClientSingleton();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers((data || []) as UserProfile[]);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch users",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ink mb-8">Users</h1>

      {loading ? (
        <div className="text-ink-muted">Loading users...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-ink-muted">No users found.</div>
      ) : (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-subtle border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-wash text-brand">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {user.college || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {user.department || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
