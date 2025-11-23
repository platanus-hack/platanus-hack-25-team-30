import { Link, createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Stats } from '@/lib/types/stats-types'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardStack } from '@/components/CardStack'
import { authStore } from '@/lib/stores/auth-store'
import { useContacts } from '@/hooks/contact-hook'
import { useAllContactsStats } from '@/hooks/all-contacts-stats-hook'
import { useContactPhoto } from '@/hooks/contact-photo-hook'
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
  type: 'tip' | 'stat' | 'globalStat' | 'reminder' | 'statContact'
  message: string
  contactName?: string
  avatarElement?: React.ReactNode
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

// Component to display contact avatar with photo or initials
function ContactAvatarWithPhoto({
  contactId,
  token,
  firstName,
  lastName,
}: {
  contactId: number
  token: string
  firstName: string
  lastName: string
}) {
  const { data: photoData } = useContactPhoto(contactId, token)
  const avatarUrl = photoData ? URL.createObjectURL(photoData) : null
  const fullName = `${firstName} ${lastName}`

  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase()
  }

  return (
    <Avatar className="h-16 w-16">
      <AvatarImage src={avatarUrl || undefined} alt={fullName} />
      <AvatarFallback className="bg-gray-200 text-gray-700">
        {getInitials(firstName, lastName)}
      </AvatarFallback>
    </Avatar>
  )
}

function RouteComponent() {
  const state = useStore(authStore)
  const token = state?.token ?? ''
  const [sortBy, setSortBy] = useState<string>('')
  const { contacts } = useContacts(token)
  const { statsMap, isLoading: isLoadingStats } = useAllContactsStats(
    contacts,
    token,
  )

  if (!state) return null

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

  // Get favorite contact (highest score)
  const favoriteContact = useMemo(() => {
    const contactsWithStats = mergedContacts.filter((mc) => mc.stats !== null)
    if (contactsWithStats.length === 0) return null
    return contactsWithStats.reduce((prev, current) =>
      (current.stats?.health_score ?? 0) > (prev.stats?.health_score ?? 0)
        ? current
        : prev,
    )
  }, [mergedContacts])

  // Por mostrar utiliza un sample de los mergedContacts para cada dato
  const mockTips: Array<MockTipOrInsight> = [
    ...(favoriteContact
      ? [
          {
            type: 'statContact' as const,
            message: `¡${favoriteContact.contact.first_name} ${favoriteContact.contact.last_name} es tu contacto favorito!`,
            contactName: `${favoriteContact.contact.first_name} ${favoriteContact.contact.last_name}`,
            avatarElement: (
              <ContactAvatarWithPhoto
                contactId={favoriteContact.contact.id}
                token={token}
                firstName={favoriteContact.contact.first_name}
                lastName={favoriteContact.contact.last_name}
              />
            ),
          },
        ]
      : []),
    {
      type: 'tip',
      message:
        'Tus relaciones este último mes han mejorado en un 20%. ¡Sigue así!',
    },
    {
      type: 'stat',
      message:
        'Has mejorado tu tiempo de respuesta promedio en un 15% este mes!',
    },
    {
      type: 'tip',
      message: `Tu relación con ${mergedContacts[Math.floor(Math.random() * mergedContacts.length)]?.contact.first_name} ha mejorado significativamente en las últimas semanas. ¡Buen trabajo!`,
    },
    {
      type: 'globalStat',
      message:
        'Las personas han mejorado su puntaje de relación un 2% esta semana en promedio.',
    },
    {
      type: 'reminder',
      message: `¡Hoy es el cumpleaños de ${mergedContacts[Math.floor(Math.random() * mergedContacts.length)]?.contact.first_name}! No olvides enviarle tus mejores deseos.`,
    },
    {
      type: 'stat',
      message: `Tu racha actual con ${mergedContacts[Math.floor(Math.random() * mergedContacts.length)]?.contact.first_name} es de 12 semanas, la más larga de este año. ¡Sigue así!`,
    },
    {
      type: 'tip',
      message:
        'Intenta equilibrar quién inicia las conversaciones. El esfuerzo mutuo fortalece las relaciones.',
    },
    {
      type: 'globalStat',
      message:
        'Los estudios muestran que las revisiones regulares cada 2 semanas mejoran la satisfacción en las relaciones en un 40%.',
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
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-500'
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
                <p className="text-sm text-gray-600 mb-2">
                  Total Interacciones
                </p>
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
        <div className="my-8 w-full items-center justify-center flex flex-col">
          {/* Agrandamos la letra */}
          <Badge
            variant="outline"
            className="mb-4 text-2xl font-semibold px-6 py-2 border-gray-300 bg-white shadow-md"
          >
            Consejos e Ideas para ti
          </Badge>
          <CardStack
            cards={mockTips}
            maxVisibleCards={3}
            autoPlay={true}
            autoPlayInterval={6000}
          />
        </div>

        {/* Sort By */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Ordenar por:
          </label>
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
            <Link
              key={mergedContact.contact.id}
              to="/contacts/$contactId"
              params={{ contactId: mergedContact.contact.id.toString() }}
              className="block"
            >
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ContactAvatarWithPhoto
                      contactId={mergedContact.contact.id}
                      token={token}
                      firstName={mergedContact.contact.first_name}
                      lastName={mergedContact.contact.last_name}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {mergedContact.contact.first_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {mergedContact.stats?.total_interactions ?? 0}{' '}
                        interacciones
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
                          (mergedContact.stats?.health_score ?? 0) >= 80
                            ? '#16a34a'
                            : (mergedContact.stats?.health_score ?? 0) >= 50
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
                      <p className="text-gray-600 font-medium">
                        Último Contacto
                      </p>
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
                    <span className="text-sm text-gray-600">
                      Tiempo de Respuesta
                    </span>
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
                        ? (
                            mergedContact.stats.communication_balance * 100
                          ).toFixed(0) + '%'
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
