export interface User {
  id: string
  email: string
  name: string
  authMethod: 'email' | 'google' | 'telegram'
  role: string
  createdAt: string
}

export interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  token: string
  user: User
}
