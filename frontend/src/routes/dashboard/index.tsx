import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Eye,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Stats } from '@/lib/types/stats-types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Badge } from '@/components/ui/badge'
import { CardStack } from '@/components/CardStack'
import { authStore } from '@/lib/stores/auth-store'
import { useContacts } from '@/hooks/contact-hook'
import { useAllContactsStats } from '@/hooks/all-contacts-stats-hook'
import { ContactAvatar } from '@/components/contacts/ContactAvatar'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

interface AverageStats {
  totalRelationships: number
  averageHealthScore: number
  interactionCountMonthly: number
  needAttentionCount: number
}

interface MockTipOrInsight {
  type: 'tip' | 'stat' | 'globalStat' | 'reminder'
  message: string
}

// Get keys for sorting
type SortKeys = keyof Stats
// Get sort keys from Stats
const sortKeys: Array<SortKeys> = [
  'health_score',
  'total_interactions',
  'last_interaction_date',
  'last_conversation_topic',
  'response_time_median_min',
  'communication_balance',
]

const sortKeyLabels: Record<SortKeys, string> = {
  health_score: 'Puntaje de Relación',
  health_status: 'Estado de Salud',
  total_interactions: 'Total Interacciones',
  last_interaction_date: 'Último Contacto',
  last_conversation_topic: 'Último Tema',
  response_time_median_min: 'Tiempo de Respuesta',
  communication_balance: 'Balance de Comunicación',
}

function RouteComponent() {
  const state = useStore(authStore)
  if (!state) return null
  const { token } = state

  const [sortBy, setSortBy] = useState<string>('')
  const { contacts } = useContacts(token)
  const { statsMap, isLoading: isLoadingStats } = useAllContactsStats(
    contacts,
    token,
  )

  const mergedContacts = contacts.map((contact) => ({
    contact,
    stats: statsMap.get(contact.id) ?? null,
  }))

  const aggregateStats: AverageStats = useMemo(() => {
    const contactsWithStats = mergedContacts.filter((mc) => mc.stats !== null)
    const totalRelationships = contacts.length
    const averageHealthScore =
      contactsWithStats.length > 0
        ? Math.round(
            contactsWithStats.reduce(
              (sum, mc) => sum + (mc.stats?.health_score ?? 0),
              0,
            ) / contactsWithStats.length,
          )
        : 0
    const interactionCountMonthly = contactsWithStats.reduce(
      (sum, mc) => sum + (mc.stats?.total_interactions ?? 0),
      0,
    )
    const needAttentionCount = contactsWithStats.filter(
      (mc) => (mc.stats?.health_score ?? 100) < 65,
    ).length

    return {
      totalRelationships,
      averageHealthScore,
      interactionCountMonthly,
      needAttentionCount,
    }
  }, [mergedContacts, contacts.length])

  const mockTips: Array<MockTipOrInsight> = [
    {
      type: 'tip',
      message:
        'Remember to check in with Nicolás, it has been 3 weeks since your last contact.',
    },
    {
      type: 'stat',
      message:
        'You have improved your average response time by 15% this month!',
    },
    {
      type: 'tip',
      message:
        'Consider reaching out to Renata more often to improve your relationship health.',
    },
    {
      type: 'globalStat',
      message:
        'Today is the day of friendship! Reach out to at least 3 contacts to celebrate.',
    },
    {
      type: 'reminder',
      message: "Today is Jose's birthday! Send him a message to wish him well.",
    },
    {
      type: 'stat',
      message:
        'Your current streak with Alonso is at 12 weeks - the longest this year! Keep it up!',
    },
    {
      type: 'tip',
      message:
        'Try to balance who initiates conversations. Mutual effort strengthens relationships.',
    },
    {
      type: 'globalStat',
      message:
        'Studies show that regular check-ins every 2 weeks improve relationship satisfaction by 40%.',
    },
  ]

  const sortedMergedContacts = useMemo(() => {
    if (!sortBy) return mergedContacts
    return [...mergedContacts].sort((a, b) => {
      const key = sortBy
      // @ts-ignore fine
      if (!sortKeys.includes(key)) {
        return 0
      }
      const checkedKey = key as SortKeys
      const aValue = a.stats?.[checkedKey]
      const bValue = b.stats?.[checkedKey]
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue
      }
      return 0
    })
  }, [sortBy, mergedContacts])

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 60) return 'text-orange-500'
    return 'text-red-500'
  }

  const getHealthBorderColor = (score: number) => {
    if (score >= 85) return 'border-green-600'
    if (score >= 60) return 'border-orange-500'
    return 'border-red-500'
  }

  return (
    <div className="w-full h-full bg-(--app-secondary) p-16 overflow-auto">
      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Relaciones</p>
                <p className="text-3xl font-bold text-gray-900">
                  {aggregateStats.totalRelationships}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  En todas las categorías
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Puntaje Promedio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${aggregateStats.averageHealthScore}/100`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Salud general de relaciones
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Interacciones</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    aggregateStats.interactionCountMonthly
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Interacciones registradas
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Necesitan Atención</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    aggregateStats.needAttentionCount
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contactos con puntaje bajo
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tips & Insights Card Stack */}
        <div className="my-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tips & Insights
          </h2>
          <CardStack
            cards={mockTips}
            maxVisibleCards={3}
            autoPlay={true}
            autoPlayInterval={6000}
          />
        </div>

        {/* Sort By */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Puntaje de Relación" />
            </SelectTrigger>
            <SelectContent>
              {sortKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {sortKeyLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMergedContacts.map((mergedContact) => (
            <Card
              key={mergedContact.contact.id}
              className="p-6 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ContactAvatar
                    contactId={mergedContact.contact.id}
                    token={token}
                    name={mergedContact.contact.first_name}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {mergedContact.contact.first_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {mergedContact.stats?.total_interactions ?? 0} interacciones
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mergedContact.contact.personality_tags.map(
                        (tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-white text-xs px-2 py-0.5 border-gray-200"
                          >
                            {tag}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end" side="top">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-sm font-normal"
                        onClick={() =>
                          console.log('Show', mergedContact.contact.first_name)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        Show
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-sm font-normal"
                        onClick={() =>
                          console.log('Edit', mergedContact.contact.first_name)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          console.log(
                            'Delete',
                            mergedContact.contact.first_name,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-6 mb-4">
                {/* Circular Progress */}
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={
                        (mergedContact.stats?.health_score ?? 0) >= 85
                          ? '#16a34a'
                          : (mergedContact.stats?.health_score ?? 0) >= 60
                            ? '#f97316'
                            : '#dc2626'
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${((mergedContact.stats?.health_score ?? 0) / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold ${getHealthColor(mergedContact.stats?.health_score ?? 0)}`}
                    >
                      {mergedContact.stats?.health_score ?? 0}/100
                    </span>
                    <span className="text-xs text-gray-600">
                      {mergedContact.stats?.health_status ?? '-'}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Último Contacto</p>
                    <p className="text-gray-900">
                      {formatDate(mergedContact.stats?.last_interaction_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row - Response Time */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {mergedContact.stats?.response_time_median_min
                    ? `${Math.round(mergedContact.stats.response_time_median_min)} min`
                    : '-'}
                </span>
              </div>

              {/* Communication Balance - Alone in final row */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-1">
                  Balance de Comunicación
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {mergedContact.stats?.communication_balance !== undefined
                      ? (mergedContact.stats.communication_balance * 100).toFixed(0) + '%'
                      : '-'}
                  </p>
                  {(mergedContact.stats?.communication_balance ?? 0) >= 0.4 &&
                  (mergedContact.stats?.communication_balance ?? 0) <= 0.6 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>

              {/* Warning if needed */}
              {(mergedContact.stats?.health_score ?? 100) < 65 && (
                <div className="mt-3 p-2 bg-orange-50 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-800 font-medium">
                    Necesita Atención
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
