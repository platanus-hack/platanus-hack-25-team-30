import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import Header from '../components/Header'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthContext } from '../auth'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})
