import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Calendar,
  Clock,
  Edit,
  Gift,
  List,
  MessageCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ContactForm } from '@/components/contacts/ContactForm'
import { useContacts } from '@/hooks/contact-hook'
import { useContactPhoto } from '@/hooks/contact-photo-hook'
import { useContactChats } from '@/hooks/contact-chats-hook'
import { useContactStats } from '@/hooks/contact-stats-hook'
import { useWebSocketChat } from '@/hooks/useWebSocketChat'
import { authStore } from '@/lib/stores/auth-store'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/contacts/$contactId')({
  component: ContactShowComponent,
})

function ContactShowComponent() {
  const state = useStore(authStore)
  if (!state) return null
  const { token } = state
  const [showEditForm, setShowEditForm] = useState(false)
  const { contactId } = Route.useParams()
  const contactIdNum = parseInt(contactId, 10)
  const { contacts } = useContacts(token)
  const { contactChats } = useContactChats(contactIdNum, token)
  const { contactStats } = useContactStats(contactIdNum, token)
  const navigate = useNavigate()

  const sortedChats = [...contactChats].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  )

  const contact = contacts.find((c) => c.id === contactIdNum)

  const { data: photoData } = useContactPhoto(contactIdNum, token)
  const avatarUrl = photoData ? URL.createObjectURL(photoData) : null

  // WebSocket chat for AI simulation
  const {
    messages,
    sendMessage,
    connectionStatus,
    error: wsError,
    resetChat,
  } = useWebSocketChat({
    personId: contactIdNum,
    token,
  })

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || connectionStatus !== 'connected') return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isLoading = messages.some((msg) => msg.isLoading)

  if (!contact) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contacto no encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              El contacto que buscas no existe.
            </p>
            <Link to="/contacts">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a contactos
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Familia':
        return 'bg-purple-100 text-purple-800'
      case 'Amigo Cercano':
        return 'bg-blue-100 text-blue-800'
      case 'Profesional':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return { date: 'Sin fecha', time: '' }
    const date = new Date(isoString)

    const dateStr = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const time = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return { date: dateStr, time }
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `< ${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }

  const mapBalanceToText = (balance: number) => {
    if (balance > 0.9) return 'Muy desbalanceado'
    if (balance > 0.75) return 'Desbalanceado'
    if (balance > 0.6) return 'Un poco desbalanceado'
    return 'Balanceado'
  }

  return (
    <div className="min-h-screen bg-(--app-secondary) p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/contacts' })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a contactos
        </Button>

        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${contact.first_name} ${contact.last_name}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-3xl font-semibold text-gray-500">
                      {contact.first_name[0]}
                      {contact.last_name[0]}
                    </span>
                  </div>
                )}
                <div
                  className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full ${getScoreBgColor(contactStats?.health_score ?? 0)} border-2 border-white flex items-center justify-center`}
                >
                  <span
                    className={`text-lg font-bold ${getScoreColor(contactStats?.health_score ?? 0)}`}
                  >
                    {contactStats?.health_score}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {contact.first_name} {contact.last_name}
                </h1>
                <div className="flex flex-col gap-5">
                  <Badge
                    className={`${getCategoryColor(contact.relationship_type)} w-fit hover:bg-opacity-100`}
                  >
                    {contact.relationship_type}
                  </Badge>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {contact.personality_tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {showEditForm && (
              <ContactForm
                contact={contact}
                onClose={() => setShowEditForm(false)}
              />
            )} */}
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Simulación IA
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chats
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Puntaje de relación
                    </p>
                    <p
                      className={`text-3xl font-bold ${getScoreColor(contactStats?.health_score ?? 0)}`}
                    >
                      {contactStats?.health_score}/100
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {(contactStats?.health_score ?? 0) >= 80
                    ? 'Excelente estado de la relación'
                    : (contactStats?.health_score ?? 0) >= 50
                      ? 'Necesita atención'
                      : 'Requiere atención inmediata'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total de interacciones
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {contactStats?.total_interactions}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Último contacto
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatDate(contactStats?.last_interaction_date)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Último topico: {contactStats?.last_conversation_topic}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Historial de interracciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tiempo de respuesta
                    </p>
                    <p className="text-xs text-gray-500">
                      Tiempo promedio de respuesta
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {formatResponseTime(
                      Number(
                        (contactStats?.response_time_median_min ?? 0).toFixed(
                          0,
                        ),
                      ),
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Balance de comunicación
                    </p>
                    <p className="text-xs text-gray-500">Quién inicia más</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {mapBalanceToText(contactStats?.communication_balance ?? 0)}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <Card className="p-6 bg-white">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Simulador de Conversación IA
                  </h3>
                  {/* Connection Status Indicator */}
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'connected' && (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        Conectado
                      </Badge>
                    )}
                    {connectionStatus === 'connecting' && (
                      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Conectando...
                      </Badge>
                    )}
                    {(connectionStatus === 'disconnected' ||
                      connectionStatus === 'error') && (
                      <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                        <WifiOff className="w-3 h-3" />
                        Desconectado
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Practica tu conversación con {contact.first_name} usando IA
                </p>
              </div>

              {/* Error Message */}
              {wsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{wsError}</p>
                </div>
              )}

              {/* Chat Container */}
              <div className="h-96 overflow-y-auto p-4 bg-[#f5f3f0] rounded-lg space-y-3 mb-4">
                {messages.length === 0 && connectionStatus === 'connected' && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">
                      Envía un mensaje para comenzar la conversación con{' '}
                      {contact.first_name}
                    </p>
                  </div>
                )}
                {messages.length === 0 && connectionStatus === 'connecting' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Conectando con el simulador...</span>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.from === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.isLoading ? (
                        <div className="flex items-center gap-1 py-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></span>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="resize-none bg-white"
                  rows={3}
                  disabled={connectionStatus !== 'connected'}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={
                      isLoading ||
                      !input.trim() ||
                      connectionStatus !== 'connected'
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetChat}
                    className="px-4"
                  >
                    Reiniciar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Esta es una conversación simulada. Las respuestas son
                  generadas por IA basándose en el estilo de comunicación de{' '}
                  {contact.first_name}.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mensajes Recientes
              </h3>
              <div className="space-y-4">
                {sortedChats.slice(0, 5).map((chat) => {
                  const { date, time } = formatMessageTime(chat.time)
                  return (
                    <div key={chat.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {chat.source}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600 font-medium">
                            {date}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {time}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        {chat.message_text}
                      </p>
                    </div>
                  )
                })}
                {sortedChats.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No hay mensajes cargados para este contacto.
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
