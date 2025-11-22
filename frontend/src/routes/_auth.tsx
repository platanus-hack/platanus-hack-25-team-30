import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { authStore } from '@/lib/stores/auth-store'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    // Check if user is authenticated
    if (!authStore.state) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})
