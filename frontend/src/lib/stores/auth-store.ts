import { Store } from '@tanstack/react-store'

const API_BASE_URL = 'http://localhost:8000'

export interface User {
  id?: string
  name: string
  email?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const USER_KEY = 'tanstack.auth.user'
const TOKEN_KEY = 'tanstack.auth.token'

function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// Initialize store with stored values
export const authStore = new Store<AuthState>({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredUser(),
})

// Auth actions
export const authActions = {
  async login(name: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      const userData: User = {
        id: data.id || data.user?.id,
        name: data.name || data.user?.name || name,
        email: data.email || data.user?.email,
        avatar: data.avatar || data.user?.avatar,
      }

      const token = data.token || data.access_token

      // Update store
      authStore.setState((state) => ({
        ...state,
        user: userData,
        token,
        isAuthenticated: true,
      }))

      // Persist to localStorage
      setStoredUser(userData)
      setStoredToken(token)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async register(name: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' }
      }

      const userData: User = {
        id: data.id || data.user?.id,
        name: data.name || data.user?.name || name,
        email: data.email || data.user?.email,
        avatar: data.avatar || data.user?.avatar,
      }

      const token = data.token || data.access_token

      // Update store
      authStore.setState((state) => ({
        ...state,
        user: userData,
        token,
        isAuthenticated: true,
      }))

      // Persist to localStorage
      setStoredUser(userData)
      setStoredToken(token)

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async logout(): Promise<void> {
    // Clear store
    authStore.setState((state) => ({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false,
    }))

    // Clear localStorage
    setStoredUser(null)
    setStoredToken(null)
  },

  updateUser(user: Partial<User>): void {
    const currentUser = authStore.state.user
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user }
      authStore.setState((state) => ({
        ...state,
        user: updatedUser,
      }))
      setStoredUser(updatedUser)
    }
  },
}
