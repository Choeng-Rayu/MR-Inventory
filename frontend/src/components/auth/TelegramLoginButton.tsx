import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/helpers'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface TelegramLoginButtonProps {
  onSuccess: () => void
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: Record<string, unknown>) => void
    }
  }
}

function TelegramWidget({ onSuccess }: TelegramLoginButtonProps) {
  const { loginWithTelegram } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!botName || !containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '4')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.async = true

    script.onload = () => {
      setIsReady(true)
      window.TelegramLoginWidget = {
        dataOnauth: async (user) => {
          try {
            await loginWithTelegram(user)
            toast.success('Signed in with Telegram')
            onSuccess()
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Telegram authentication failed')
          }
        },
      }
    }

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      setIsReady(false)
    }
  }, [botName, loginWithTelegram, onSuccess])

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="flex justify-center" />
      {!isReady && (
        <button
          type="button"
          disabled
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-md',
            'bg-[#54A9EB] px-4 py-2.5 text-sm font-medium text-white',
            'cursor-wait'
          )}
        >
          <Send className="h-4 w-4 animate-pulse" />
          Loading Telegram...
        </button>
      )}
    </div>
  )
}

export function TelegramLoginButton({ onSuccess }: TelegramLoginButtonProps) {
  const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME

  // When Telegram OAuth is configured, render the official Telegram widget
  if (botName) {
    return <TelegramWidget onSuccess={onSuccess} />
  }

  // Fallback: render a styled button that explains configuration is needed
  return (
    <button
      type="button"
      onClick={() =>
        toast.error(
          'Telegram OAuth not configured. Please set VITE_TELEGRAM_BOT_NAME in your .env file.',
          { duration: 5000 }
        )
      }
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-md',
        'bg-[#54A9EB] px-4 py-2.5 text-sm font-medium text-white',
        'transition-colors hover:bg-[#3d9ae0] active:bg-[#2f8fd6]'
      )}
    >
      <Send className="h-4 w-4" />
      Login or Register with Telegram
    </button>
  )
}
