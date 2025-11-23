import { z } from 'zod'

// Message sent from client to server
export const WebSocketIncomingMessageSchema = z.object({
  message: z.string(),
})

export type WebSocketIncomingMessage = z.infer<typeof WebSocketIncomingMessageSchema>

// Message received from server
export const WebSocketOutgoingMessageSchema = z.object({
  response: z.string(),
  person_id: z.number(),
})

export type WebSocketOutgoingMessage = z.infer<typeof WebSocketOutgoingMessageSchema>

// Error message from server
export const WebSocketErrorMessageSchema = z.object({
  error: z.string(),
})

export type WebSocketErrorMessage = z.infer<typeof WebSocketErrorMessageSchema>

// Union type for all possible server messages
export const WebSocketServerMessageSchema = z.union([
  WebSocketOutgoingMessageSchema,
  WebSocketErrorMessageSchema,
])

export type WebSocketServerMessage = z.infer<typeof WebSocketServerMessageSchema>
