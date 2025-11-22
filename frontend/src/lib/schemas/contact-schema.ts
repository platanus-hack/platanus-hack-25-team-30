import { z } from 'zod'

export const CreateContactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  relationshipType: z.enum([
    "Familia",
    "Amigo Cercano",
    "Amigo",
    "Colega",
    "Romantico",
    "Conocido",
  ]),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string(), 
  birthday: z.iso.date(), 
  personalityTags: z.array(z.string()),
  notes: z.string(),
})

export type CreateContactData = z.infer<typeof CreateContactSchema>