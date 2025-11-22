import * as React from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore, authActions } from './lib/stores/auth-store'
import type { User } from './lib/stores/auth-store'

export type { User }

export interface AuthContext {
  isAuthenticated: boolean
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  user: User | null
  updateUser: (user: Partial<User>) => void
}

const AuthContext = React.createContext<AuthContext | null>(null)

const key = 'tanstack.auth.user'
const dbKey = 'tanstack.auth.db'

// Mock user database
interface User {
  username: string
  email: string
  password: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getUserDB(): Array<User> {
  const db = localStorage.getItem(dbKey)
  return db ? JSON.parse(db) : []
}

function saveUserDB(users: Array<User>) {
  localStorage.setItem(dbKey, JSON.stringify(users))
}

function getStoredUser() {
  return localStorage.getItem(key)
}

function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(key, user)
  } else {
    localStorage.removeItem(key)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<string | null>(getStoredUser())
  const isAuthenticated = !!user

  const logout = React.useCallback(async () => {
    setStoredUser(null)
    setUser(null)
  }, [])

  const login = React.useCallback(
    async (username: string, password: string) => {
      await sleep(500)

      const users = getUserDB()
      const foundUser = users.find(
        (u) => u.username === username && u.password === password,
      )

      if (!foundUser) {
        return { success: false, error: 'Invalid username or password' }
      }

      setStoredUser(username)
      setUser(username)
      return { success: true }
    },
    [],
  )

  const register = React.useCallback(
    async (username: string, email: string, password: string) => {
      await sleep(500)

      const users = getUserDB()

      // Check if username already exists
      if (users.some((u) => u.username === username)) {
        return { success: false, error: 'Username already exists' }
      }

      // Check if email already exists
      if (users.some((u) => u.email === email)) {
        return { success: false, error: 'Email already exists' }
      }

      // Add new user
      users.push({ username, email, password })
      saveUserDB(users)

      // Auto login after registration
      setStoredUser(username)
      setUser(username)
      return { success: true }
    },
    [],
  )

  React.useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
