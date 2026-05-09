import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Clear ALL auth storage to prevent Zustand from re-hydrating stale auth state.
      // Without clearing auth-storage, the persist middleware would restore
      // isAuthenticated=true on the next reload, causing an infinite 401→login loop.
      localStorage.removeItem('auth-storage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export function handleApiError(error: AxiosError<unknown>): string {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    if (status === 400 && data && typeof data === 'object' && 'errors' in data) {
      return Object.values((data as ApiError).errors!).flat().join(', ')
    }

    if (data && typeof data === 'object' && 'message' in data) {
      return (data as ApiError).message
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Session expired. Please log in again.'
      case 403:
        return 'Access denied.'
      case 404:
        return 'Resource not found.'
      case 409:
        return 'Conflict. The resource already exists.'
      case 422:
        return 'Validation failed. Please check your input.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return `An error occurred (${status}).`
    }
  }

  if (error.request) {
    return 'Connection error. Please check your internet connection.'
  }

  return 'An unexpected error occurred.'
}
