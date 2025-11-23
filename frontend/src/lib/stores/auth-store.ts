import { Store } from '@tanstack/react-store'
import { z } from 'zod'
import { API_BASE_URL } from '@/integrations/api/load-env'
import { hashPassword } from '@/lib/utils/hash'

const STORAGE_KEY = 'app_auth_state'

const UserSchema = z.object({
  username: z.string(),
})
const AuthStateSchema = z.object({
  user: UserSchema,
  token: z.string(),
})

export type User = z.infer<typeof UserSchema>
type AuthState = z.infer<typeof AuthStateSchema>

const parseJson = (val: unknown) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return null
    }
  }
  return null
}

// Initialize store with stored values
export const authStore = new Store<AuthState | null>(
  (() => {
    if (typeof window === 'undefined') return null // Server-side safety

    const saved = localStorage.getItem(STORAGE_KEY)

    const parsedJson = parseJson(saved)

    const parsed = AuthStateSchema.safeParse(parsedJson)

    const state = parsed.success ? parsed.data : null

    return state
  })(),
)

authStore.subscribe((state) => {
  if (state.currentVal) {
    const currentVal = state.currentVal
    // Check schema validity before saving
    AuthStateSchema.parse(currentVal)
    const serialized = JSON.stringify(currentVal)
    localStorage.setItem(STORAGE_KEY, serialized)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
})

// Auth actions
export const authActions = {
  async login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hashedPassword = await hashPassword(password)
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: hashedPassword }),
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
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hashedPassword = await hashPassword(password)
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: hashedPassword }),
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
