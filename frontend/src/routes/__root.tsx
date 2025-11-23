import { Outlet, createRootRouteWithContext, redirect } from '@tanstack/react-router'
import Header from '../components/Header'
import type { QueryClient } from '@tanstack/react-query'
import { authStore } from '@/lib/stores/auth-store'


interface MyRouterContext {
  queryClient: QueryClient
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/']

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ location }) => {
    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

    // If route is not public and user is not authenticated, redirect to login
    if (!isPublicRoute && !authStore.state) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})
