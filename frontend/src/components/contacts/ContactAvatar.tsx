import { useEffect, useState } from 'react'
import { useContactPhoto } from '@/hooks/contact-photo-hook'

interface ContactAvatarProps {
  contactId: number
  token: string
  name: string
  className?: string
}

export function ContactAvatar({
  contactId,
  token,
  name,
  className = 'w-12 h-12',
}: ContactAvatarProps) {
  const { data: photoData } = useContactPhoto(contactId, token)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (photoData) {
      const url = URL.createObjectURL(photoData)
      setAvatarUrl(url)

      // Cleanup: revoke the object URL when component unmounts or photoData changes
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [photoData])

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${className} rounded-full object-cover border-2 border-white shadow`}
      />
    )
  }

  return (
    <div
      className={`${className} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center border-2 border-white shadow`}
    >
      {getInitials(name)}
    </div>
  )
}
