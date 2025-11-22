import { z } from 'zod'

export const API_BASE_URL = z.string().parse(import.meta.env.VITE_API_URL)
