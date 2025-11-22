import { createFileRoute } from '@tanstack/react-router'
import { ImportConversations } from '@/components/import/ImportConversations'

export const Route = createFileRoute('/import/')({
  component: ImportRoute,
})

function ImportRoute() {
  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <div className="max-w-4xl mx-auto">
        <ImportConversations />
      </div>
    </div>
  )
}
