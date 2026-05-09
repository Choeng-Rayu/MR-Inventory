import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import { formatRelativeTime } from '@/utils/formatters'
import { Bell, Check, AlertTriangle, Package, Clock } from 'lucide-react'
import { NOTIFICATION_REFRESH_INTERVAL } from '@/utils/constants'
import type { Notification } from '@/types/notification.types'

const typeIcons: Record<string, React.ReactNode> = {
  low_stock: <Package className="h-4 w-4 text-warning-500" />,
  near_expiry: <Clock className="h-4 w-4 text-warning-500" />,
  expired: <AlertTriangle className="h-4 w-4 text-danger-500" />,
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL,
  })

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 10 }),
    enabled: isOpen,
  })

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = notificationsData?.data ?? []

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 border-b border-gray-100 px-4 py-3 ${
                    !notification.read ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="mt-0.5">{typeIcons[notification.type]}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
