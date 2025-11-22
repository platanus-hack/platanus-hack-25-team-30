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
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import * as React from 'react'
import { contactsData } from '@/data/contact-data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ContactForm } from '@/components/contacts/ContactForm'

export const Route = createFileRoute('/contacts/$contactId')({
  component: ContactShowComponent,
})

function ContactShowComponent() {
  const [showEditForm, setShowEditForm] = React.useState(false)
  const { contactId } = Route.useParams()
  const navigate = useNavigate()

  const contact = contactsData.find((c) => c.id === contactId)

  const mockInitialMessage = `Oye cabro wn, donde has estado? En lo prado???!!! Andate inmediatamente de esta casa porfa.`
  const mockAnswers = [
    'Lo que hiciste fue una falta grave, no puedo creer que me hayas mentido así.',
    'Necesitamos hablar seriamente sobre lo que pasó la última vez.',
    'Siento que nuestra relación ha cambiado y no sé cómo manejarlo.',
    '¿Por qué nunca me dices la verdad sobre lo que sientes?',
    'Estoy muy decepcionado/a por tus acciones recientes.',
  ]

  const [messages, setMessages] = React.useState<
    Array<{ from: 'user' | 'contact'; text: string; isLoading?: boolean }>
  >([{ from: 'contact', text: mockInitialMessage }])

  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }])
    setLoading(true)

    // Add loading indicator
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'contact', text: '', isLoading: true },
      ])
    }, 500)

    // Simulate contact response
    setTimeout(() => {
      const randomAnswer =
        mockAnswers[Math.floor(Math.random() * mockAnswers.length)]
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading)
        return [...filtered, { from: 'contact', text: randomAnswer }]
      })
      setLoading(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The contact you're looking for doesn't exist.
            </p>
            <Link to="/contacts">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contacts
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

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
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
                <img
                  src={contact.avatar}
                  alt={`${contact.firstName} ${contact.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div
                  className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full ${getScoreBgColor(contact.score)} border-2 border-white flex items-center justify-center`}
                >
                  <span
                    className={`text-lg font-bold ${getScoreColor(contact.score)}`}
                  >
                    {contact.score}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {contact.firstName} {contact.lastName}
                </h1>
                <Badge className={`${getCategoryColor(contact.category)} mb-4`}>
                  {contact.category}
                </Badge>

                <div className="flex flex-wrap gap-2 mb-4">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-white">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{contact.totalInteractions} interacciones</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Último contacto: {contact.lastContact}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
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
            {showEditForm && contact && (
              <ContactForm
                contact={contact}
                onClose={() => setShowEditForm(false)}
              />
            )}
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
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
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Recordatorios
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Health Score</p>
                    <p
                      className={`text-3xl font-bold ${getScoreColor(contact.score)}`}
                    >
                      {contact.score}/100
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {contact.score >= 80
                    ? 'Excellent relationship health'
                    : contact.score >= 50
                      ? 'Needs some attention'
                      : 'Requires immediate attention'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Interactions
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {contact.totalInteractions}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Conversations recorded</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Contact</p>
                    <p className="text-xl font-bold text-gray-900">
                      {contact.lastContact}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Last conversation: {contact.lastConversation}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interaction History
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Response Time
                    </p>
                    <p className="text-xs text-gray-500">
                      Average time to respond
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    &lt; 1 hour
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Communication Balance
                    </p>
                    <p className="text-xs text-gray-500">Who initiates more</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Balanced
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Streak
                    </p>
                    <p className="text-xs text-gray-500">
                      Consecutive weeks of contact
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700"
                  >
                    5 weeks
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <Card className="p-6 bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Conversation Simulator
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Practice your conversation with {contact.firstName} using AI
                </p>
              </div>

              {/* Chat Container */}
              <div className="h-96 overflow-y-auto p-4 bg-[#f5f3f0] rounded-lg space-y-3 mb-4">
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
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="resize-none bg-white"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessages([
                        { from: 'contact', text: mockInitialMessage },
                      ])
                      setInput('')
                      setLoading(false)
                    }}
                    className="px-4"
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  This is a simulated conversation. Responses are AI-generated
                  based on {contact.firstName}'s communication style.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Conversations
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        WhatsApp
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Hey! How have you been? Want to grab coffee this weekend?"
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Email
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Thanks for your help with the project. Really appreciate
                    it!"
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Phone Call
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Call duration: 45 minutes - Discussed weekend plans
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600" />
                Important Dates
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Birthday
                    </p>
                    <p className="text-xs text-gray-600">
                      January 15 (Coming up in 54 days)
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Set Reminder
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Anniversary
                    </p>
                    <p className="text-xs text-gray-600">
                      Friendship Anniversary - March 10
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Set Reminder
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Active Reminders
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Check in reminder
                      </p>
                      <p className="text-xs text-gray-600">Every 2 weeks</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Birthday reminder
                      </p>
                      <p className="text-xs text-gray-600">1 week before</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Add New Reminder
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Notes
              </h3>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li>Prefers morning meetings</li>
                <li>Loves Italian food</li>
                <li>Has a dog named Max</li>
                <li>Works in marketing</li>
                <li>Interested in photography</li>
              </ul>
              <Button className="w-full mt-4" variant="outline" size="sm">
                Add Note
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
