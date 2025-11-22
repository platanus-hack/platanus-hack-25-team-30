import * as React from 'react'
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CardData {
  type: 'tip' | 'stat' | 'globalStat' | 'reminder'
  message: string
  title?: string
  icon?: React.ReactNode
}

interface CardStackProps {
  cards: Array<CardData>
  maxVisibleCards?: number
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function CardStack({
  cards,
  maxVisibleCards = 3,
  autoPlay = false,
  autoPlayInterval = 5000,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [startX, setStartX] = React.useState(0)
  const [dragOffset, setDragOffset] = React.useState(0)
  const autoPlayRef = React.useRef<NodeJS.Timeout | null>(null)

  const totalCards = cards.length

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        handleNext()
      }, autoPlayInterval)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, autoPlayInterval, currentIndex, isDragging])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
  }

  const goToCard = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index)
    }
  }

  // Touch/Mouse handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)

    // Pause autoplay when user interacts
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const offset = clientX - startX
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Swipe threshold (in pixels)
    const threshold = 100

    if (dragOffset > threshold) {
      handlePrev()
    } else if (dragOffset < -threshold) {
      handleNext()
    }

    setDragOffset(0)
  }

  const getCardIcon = (type: CardData['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5" />
      case 'stat':
        return <TrendingUp className="w-5 h-5" />
      case 'globalStat':
        return <Calendar className="w-5 h-5" />
      case 'reminder':
        return <Bell className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getCardColor = (type: CardData['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'stat':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'globalStat':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      case 'reminder':
        return 'bg-orange-50 border-orange-200 text-orange-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getIconBgColor = (type: CardData['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-100 text-blue-600'
      case 'stat':
        return 'bg-green-100 text-green-600'
      case 'globalStat':
        return 'bg-purple-100 text-purple-600'
      case 'reminder':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getCardTitle = (type: CardData['type']) => {
    switch (type) {
      case 'tip':
        return 'Tip'
      case 'stat':
        return 'Your Stats'
      case 'globalStat':
        return 'Did You Know?'
      case 'reminder':
        return 'Reminder'
      default:
        return 'Info'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Stack Container */}
      <div
        className="relative h-48 mb-6 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {cards.map((card, index) => {
          // Calculate the position of each card relative to the current index
          let position = index - currentIndex

          // Wrap around for circular behavior
          if (position < 0) position += totalCards
          if (position >= maxVisibleCards) return null

          // Calculate transform values
          const isActive = position === 0
          const scale = 1 - position * 0.05
          const translateX =
            position * 24 + (isActive && isDragging ? dragOffset * 0.5 : 0)
          const translateY = position * -4
          const opacity = position === 0 ? 1 : 0.7 - position * 0.2
          const zIndex = maxVisibleCards - position

          const cardColor = getCardColor(card.type)
          const iconBgColor = getIconBgColor(card.type)
          const cardTitle = card.title || getCardTitle(card.type)

          return (
            <Card
              key={`${card.type}-${index}`}
              className={`absolute inset-0 p-6 border-2 select-none ${cardColor} transition-all duration-500 ease-out ${
                isActive ? 'shadow-xl' : 'shadow-md'
              }`}
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                opacity,
                zIndex,
                transformOrigin: 'center left',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <div className="flex items-start gap-4 h-full">
                <div className={`p-3 rounded-lg ${iconBgColor} flex-shrink-0`}>
                  {getCardIcon(card.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2">{cardTitle}</h3>
                  <p className="text-sm leading-relaxed opacity-90">
                    {card.message}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="h-10 w-10 rounded-full flex-shrink-0"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Pager Dots */}
        <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto py-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`transition-all duration-300 rounded-full flex-shrink-0 ${
                index === currentIndex
                  ? 'w-8 h-3 bg-blue-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="h-10 w-10 rounded-full flex-shrink-0"
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Card Counter */}
      <div className="text-center mt-3 text-sm text-gray-600">
        {currentIndex + 1} / {totalCards}
      </div>
    </div>
  )
}
