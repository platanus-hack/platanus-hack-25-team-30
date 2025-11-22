import {
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'
import { authActions, authStore } from '@/lib/stores/auth-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const fallback = '/dashboard' as const

export const Route = createFileRoute('/login/')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ search }) => {
    if (authStore.state) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const router = useRouter()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRegister, setIsRegister] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const search = Route.useSearch()

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const data = new FormData(evt.currentTarget)
      const username = data.get('username')?.toString()
      const password = data.get('password')?.toString()

      if (!username || !password) {
        setError('Please fill in all fields')
        return
      }

      if (isRegister) {
        const email = data.get('email')?.toString()
        if (!email) {
          setError('Please fill in all fields')
          return
        }

        const result = await authActions.register(username, email, password)
        if (!result.success) {
          setError(result.error || 'Registration failed')
          return
        }
      } else {
        const result = await authActions.login(username, password)
        if (!result.success) {
          setError(result.error || 'Login failed')
          return
        }
      }

      await router.invalidate()
      await navigate({ to: search.redirect || fallback })
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoggingIn = isLoading || isSubmitting

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError('')
  }

  return (
    <div className="min-h-screen flex bg-[var(--app-secondary)]">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--app-primary)] items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-64 h-64 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-32 h-32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Talk2Me</h1>
          <p className="text-xl text-white/90">
            Manage your relationships with ease
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
          {/* Animated background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 opacity-5 ${
              isRegister
                ? 'from-blue-500 to-purple-500'
                : 'from-pink-500 to-orange-500'
            }`}
          />

          <div className="relative">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-600">
                {isRegister
                  ? 'Sign up to get started'
                  : 'Login to access your dashboard'}
              </p>
            </div>

            {search.redirect && !isRegister && (
              <p className="text-red-500 text-center mb-4 text-sm">
                You need to login to access this page.
              </p>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={onFormSubmit}>
              <fieldset disabled={isLoggingIn} className="space-y-4">
                {/* Animated form fields */}
                <div
                  className={`space-y-4 transition-all duration-500 ${
                    isRegister ? 'opacity-100' : 'opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="username-input"
                      className="text-sm font-medium"
                    >
                      Username
                    </label>
                    <Input
                      id="username-input"
                      name="username"
                      placeholder="Enter your username"
                      type="text"
                      required
                      className="transition-all duration-300"
                    />
                  </div>

                  {/* Email field - only for register */}
                  <div
                    className={`space-y-2 transition-all duration-500 overflow-hidden ${
                      isRegister ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <label
                      htmlFor="email-input"
                      className="text-sm font-medium"
                    >
                      Email
                    </label>
                    <Input
                      id="email-input"
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      required={isRegister}
                      className="transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password-input"
                      className="text-sm font-medium"
                    >
                      Password
                    </label>
                    <Input
                      id="password-input"
                      name="password"
                      placeholder="Enter your password"
                      type="password"
                      required
                      className="transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all duration-300 hover:scale-105"
                  disabled={isLoggingIn}
                  style={{
                    backgroundColor: isRegister
                      ? 'var(--app-neutral)'
                      : 'var(--app-primary)',
                  }}
                >
                  {isLoggingIn
                    ? 'Please wait...'
                    : isRegister
                      ? 'Create Account'
                      : 'Login'}
                </Button>
              </fieldset>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[var(--app-primary)] font-semibold hover:underline transition-all duration-300"
                  disabled={isLoggingIn}
                >
                  {isRegister ? 'Login here' : 'Sign up here'}
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
