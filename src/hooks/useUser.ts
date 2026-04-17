"use client";

import { useUserContext } from "@/contexts/UserContext";

/**
 * Returns the current authenticated user, their profile, and their role.
 * Reads from the UserContext — one Supabase subscription shared across the page.
 */
export function useUser() {
  return useUserContext();
}
