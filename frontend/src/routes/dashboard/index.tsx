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
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ContactStats } from '@/lib/types/person-stats-types'
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
import { useContactPhoto } from '@/hooks/contact-photo-hook'

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
type SortKeys = keyof ContactStats
// Get sort keys from ContactStats
const sortKeys: Array<SortKeys> = [
  'healthScore',
  'totalInteractions',
  'lastContact',
  'lastConversationTopic',
  'responseTimeMin',
  'communicationBalance',
]

function RouteComponent() {
  const state = useStore(authStore)
  if (!state) return null
  const { token } = state

  const [sortBy, setSortBy] = useState<string>('')
  const { contacts } = useContacts(token)
  const contactsStats: Array<ContactStats> = Array(contacts.length)
    .fill(null)
    .map(() => ({
      healthStatus: 'Bad',
      healthScore: Math.floor(Math.random() * 100),
      totalInteractions: Math.floor(Math.random() * 200),
      lastContact: new Date('2020-01-01T06:15:00Z').toISOString(),
      lastConversationTopic: 'Discussed project updates',
      streak: Math.floor(Math.random() * 20),
      responseTimeMin: Math.floor(Math.random() * 120) + 1,
      communicationBalance: Math.random(),
    }))

  const contactsPhotoUrl = contacts.map((contact) => {
    const { data: photoData } = useContactPhoto(contact.id, token)
    const avatarUrl = photoData ? URL.createObjectURL(photoData) : null
    return avatarUrl
  })

  const mergedContacts = contacts.map((contact, index) => ({
    contact,
    stats: contactsStats[index],
    avatar_url: contactsPhotoUrl[index],
  }))

  const mockStats: AverageStats = {
    totalRelationships: 24,
    averageHealthScore: 78,
    interactionCountMonthly: 47,
    needAttentionCount: 5,
  }

  const mockSortStats = [
    { label: 'Relationship Score', value: 'healthScore' },
    { label: 'Most Interactions', value: 'interactions' },
    { label: 'Longest Streak', value: 'streak' },
    { label: 'Recent Contact', value: 'lastContact' },
  ]

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
      const aValue = a.stats[checkedKey]
      const bValue = b.stats[checkedKey]
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue
      }
      return 0
    })
  }, [sortBy])

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
    <div className="w-full h-full bg-(--app-secondary) p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Talk2Me</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Total Relationships
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockStats.totalRelationships}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all categories
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
                <p className="text-sm text-gray-600 mb-2">Avg. Health Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockStats.averageHealthScore}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Overall relationship health
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
                <p className="text-sm text-gray-600 mb-2">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockStats.interactionCountMonthly}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total interactions logged
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
                <p className="text-sm text-gray-600 mb-2">Need Attention</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockStats.needAttentionCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Haven't contacted recently
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
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Relationship Score" />
            </SelectTrigger>
            <SelectContent>
              {sortKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
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
                  {mergedContact.avatar_url ? (
                    <img
                      src={mergedContact.avatar_url}
                      alt={mergedContact.contact.first_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {mergedContact.contact.first_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {mergedContact.stats.totalInteractions} interactions
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
                        mergedContact.stats.healthScore >= 85
                          ? '#16a34a'
                          : mergedContact.stats.healthScore >= 60
                            ? '#f97316'
                            : '#dc2626'
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(mergedContact.stats.healthScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold ${getHealthColor(mergedContact.stats.healthScore)}`}
                    >
                      {mergedContact.stats.healthScore}/100
                    </span>
                    <span className="text-xs text-gray-600">
                      {mergedContact.stats.healthStatus}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Last Contact</p>
                    <p className="text-gray-900">
                      {mergedContact.stats.lastContact}
                    </p>
                    {/* Badge para el source (usar color e icono segun app de mockApps) */}
                    <Badge
                      className="mt-1 px-2 py-1 text-xs font-medium"
                      variant="secondary"
                    >
                      {'whatsapp'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Row - Response Time and Streak in same row */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Response Time</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {mergedContact.stats.responseTimeMin}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Streak</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    1 week
                  </span>
                </div>
              </div>

              {/* Communication Balance - Alone in final row */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-1">
                  Communication Balance
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {mergedContact.stats.communicationBalance}
                  </p>
                  {mergedContact.stats.communicationBalance >= 0.4 &&
                  mergedContact.stats.communicationBalance <= 0.6 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>

              {/* Warning if needed */}
              {mergedContact.stats.healthScore < 65 && (
                <div className="mt-3 p-2 bg-orange-50 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-800 font-medium">
                    Needs Attention
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
