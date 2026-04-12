'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const notificationsData = (data || []) as Notification[]
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClientSingleton()
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
