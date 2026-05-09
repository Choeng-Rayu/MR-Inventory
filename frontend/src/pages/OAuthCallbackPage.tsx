import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error(`Authentication failed: ${error}`)
      navigate('/login')
      return
    }

    if (!token) {
      toast.error('Authentication failed: no token received')
      navigate('/login')
      return
    }

    // Store token and fetch user profile
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    api
      .get('/auth/profile')
      .then((response) => {
        setAuth(token, response.data)
        toast.success('Signed in successfully')
        navigate('/')
      })
      .catch(() => {
        toast.error('Failed to load user profile')
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        navigate('/login')
      })
  }, [searchParams, navigate, setAuth])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-lg font-medium text-gray-700">Completing sign in...</p>
      </div>
    </div>
  )
}
