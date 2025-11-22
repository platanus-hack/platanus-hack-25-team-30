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
import { contactsData } from '@/data/contact-data'
import { authStore } from '@/lib/stores/auth-store'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const state = useStore(authStore)
  if (!state) return null
  const { user, token } = state

  const [sortBy, setSortBy] = useState('')

  const mockStats = {
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

  // Adapt contactsData to dashboard user format
  const mockUsers = contactsData.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    interactions: c.totalInteractions,
    healthScore: c.score,
    lastContact: c.lastContact,
    source: c.tags[2] || 'WhatsApp', // fallback
    streak: 0, // Not available in data
    responseTime: '< 1h', // Not available in data
    communicationBalance: 'Balanced', // Not available in data
    healthStatus:
      c.score >= 85 ? 'Healthy' : c.score >= 60 ? 'Moderate' : 'Low',
    avatar: c.avatar,
    category: c.category,
    tags: c.tags,
  }))

  const mockTips: Array<{
    type: 'tip' | 'stat' | 'globalStat' | 'reminder'
    message: string
  }> = [
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

  const sortedUsers = useMemo(() => {
    if (!sortBy) return mockUsers
    return [...mockUsers].sort((a, b) => {
      const key = sortBy as keyof (typeof mockUsers)[0]
      const aValue = a[key]
      const bValue = b[key]
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
    <div className="w-full h-full bg-[var(--app-secondary)] p-8 overflow-auto">
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
              {mockSortStats.map((stat) => (
                <SelectItem key={stat.value} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedUsers.map((user) => (
            <Card
              key={user.id}
              className="p-6 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500">
                      {user.interactions} interactions
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.tags &&
                        user.tags.map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-white text-xs px-2 py-0.5 border-gray-200"
                          >
                            {tag}
                          </Badge>
                        ))}
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
                        onClick={() => console.log('Show', user.name)}
                      >
                        <Eye className="h-4 w-4" />
                        Show
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-sm font-normal"
                        onClick={() => console.log('Edit', user.name)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => console.log('Delete', user.name)}
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
                        user.healthScore >= 85
                          ? '#16a34a'
                          : user.healthScore >= 60
                            ? '#f97316'
                            : '#dc2626'
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(user.healthScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold ${getHealthColor(user.healthScore)}`}
                    >
                      {user.healthScore}/100
                    </span>
                    <span className="text-xs text-gray-600">
                      {user.healthStatus}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Last Contact</p>
                    <p className="text-gray-900">{user.lastContact}</p>
                    {/* Badge para el source (usar color e icono segun app de mockApps) */}
                    <Badge
                      className="mt-1 px-2 py-1 text-xs font-medium"
                      variant="secondary"
                    >
                      {user.source}
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
                    {user.responseTime}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Streak</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.streak ? `${user.streak} weeks` : 'None'}
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
                    {user.communicationBalance}
                  </p>
                  {user.communicationBalance === 'Balanced' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>

              {/* Warning if needed */}
              {user.healthScore < 65 && (
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
