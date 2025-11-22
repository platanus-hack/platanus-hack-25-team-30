import { Store } from '@tanstack/react-store'

const API_BASE_URL = 'http://localhost:8000'

export interface User {
  username: string
}

interface AuthState {
  user: User
  token: string
}

// Initialize store with stored values
export const authStore = new Store<AuthState | null>(null)

// Auth actions
export const authActions = {
  async login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password }),
      })

      const data = await response.json()
      console.log('data', data)

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      const userData: User = {
        username: username,
      }

      const token = username

      // Update store
      authStore.setState((state) => ({
        ...state,
        user: userData,
        token: token,
      }))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' }
      }

      const userData: User = {
        username: username,
      }

      const token = username

      // Update store
      authStore.setState((state) => ({
        ...state,
        user: userData,
        token: token,
      }))

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  logout(): void {
    // Clear store
    authStore.setState(() => null)
  },
}
