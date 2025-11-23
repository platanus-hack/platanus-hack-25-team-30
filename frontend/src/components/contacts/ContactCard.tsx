import { Calendar, MoreVertical, PartyPopper } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { Contact } from '../../lib/types/contact-types'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useContactPhoto } from '@/hooks/contact-photo-hook'
import { authStore } from '@/lib/stores/auth-store'

interface ContactCardProps {
  contact: Contact
  score: number
  lastConversation: string
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-red-600 bg-red-50 border-red-200'
}
export function ContactCard({
  contact,
  score,
  lastConversation,
}: ContactCardProps) {
  const authState = useStore(authStore)
  if (!authState) return null
  const { token } = authState

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const fullName = `${contact.first_name} ${contact.last_name}`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
    }
    return date.toLocaleDateString('es-ES', options)
  }

  const { data: photoData } = useContactPhoto(contact.id, token)
  const avatarUrl = photoData ? URL.createObjectURL(photoData) : null

  return (
    <Link
      to="/contacts/$contactId"
      params={{ contactId: contact.id.toString() }}
    >
      <Card className="relative bg-white hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          {/* Header with avatar and menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(contact.first_name, contact.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{fullName}</h3>
                <p className="text-sm text-gray-500">
                  {contact.relationship_type}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" className="text-gray-400">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Puntaje</span>
              {score > 0 && (
                <span
                  className={`text-sm font-medium rounded-md px-2.5 py-1 border ${getScoreColor(score)}`}
                >
                  {score}
                </span>
              )}
            </div>
          </div>

          {/* Last conversation and total interactions */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs">
                Ultima conversación: {lastConversation}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PartyPopper className="h-4 w-4 text-gray-400" />
              <span className="text-xs">
                Cumpleaños: {formatDate(contact.birthday)}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {contact.personality_tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-orange-100 text-orange-700 border-0 text-xs px-2 py-0.5 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
