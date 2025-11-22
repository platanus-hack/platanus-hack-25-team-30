import * as React from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore, authActions } from './lib/stores/auth-store'
import type { User } from './lib/stores/auth-store'

export type { User }

export interface AuthContext {
  isAuthenticated: boolean
  login: (
    name: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  user: User | null
  updateUser: (user: Partial<User>) => void
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useStore(authStore)

  const contextValue = React.useMemo<AuthContext>(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      login: authActions.login,
      register: authActions.register,
      logout: authActions.logout,
      updateUser: authActions.updateUser,
    }),
    [authState.isAuthenticated, authState.user],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
