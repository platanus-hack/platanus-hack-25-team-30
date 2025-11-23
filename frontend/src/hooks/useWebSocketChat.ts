import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '@/integrations/api/load-env'
import type {
  WebSocketIncomingMessage,
  WebSocketOutgoingMessage,
  WebSocketErrorMessage,
} from '@/lib/types/websocket-types'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface ChatMessage {
  from: 'user' | 'contact'
  text: string
  isLoading?: boolean
}

interface UseWebSocketChatOptions {
  personId: number
  token: string
  onMessage?: (message: WebSocketOutgoingMessage) => void
  onError?: (error: string) => void
}

interface UseWebSocketChatReturn {
  messages: ChatMessage[]
  sendMessage: (message: string) => void
  connectionStatus: ConnectionStatus
  error: string | null
  resetChat: () => void
}

export function useWebSocketChat({
  personId,
  token,
  onMessage,
  onError,
}: UseWebSocketChatOptions): UseWebSocketChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Convert HTTP URL to WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws'
    const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '')
    return `${wsProtocol}://${baseUrl}/chat/${personId}?token=${encodeURIComponent(token)}`
  }, [personId, token])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')
    setError(null)

    try {
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Check if it's an error message
          if ('error' in data) {
            const errorMsg = data as WebSocketErrorMessage
            setError(errorMsg.error)
            onError?.(errorMsg.error)
            return
          }

          // It's a response message
          const response = data as WebSocketOutgoingMessage

          // Remove loading indicator and add real response
          setMessages((prev) => {
            const filtered = prev.filter((msg) => !msg.isLoading)
            return [...filtered, { from: 'contact', text: response.response }]
          })

          onMessage?.(response)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.onerror = () => {
        setConnectionStatus('error')
        setError('Error de conexión con el servidor')
      }

      ws.onclose = () => {
        setConnectionStatus('disconnected')
        wsRef.current = null
      }
    } catch (e) {
      setConnectionStatus('error')
      setError('No se pudo establecer la conexión')
      console.error('WebSocket connection error:', e)
    }
  }, [getWebSocketUrl, onMessage, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus('disconnected')
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('No hay conexión con el servidor')
      return
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { from: 'user', text: message }])

    // Add loading indicator
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'contact', text: '', isLoading: true }])
    }, 300)

    // Send message to server
    const payload: WebSocketIncomingMessage = { message }
    wsRef.current.send(JSON.stringify(payload))
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
    // Reconnect to get fresh context
    disconnect()
    setTimeout(connect, 100)
  }, [connect, disconnect])

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    messages,
    sendMessage,
    connectionStatus,
    error,
    resetChat,
  }
}
