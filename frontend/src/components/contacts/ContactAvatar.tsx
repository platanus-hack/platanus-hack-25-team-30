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

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${className} rounded-full object-cover border-2 border-white shadow`}
      />
    )
  }

  return <div className={`${className} bg-gray-200 rounded-full`} />
}
