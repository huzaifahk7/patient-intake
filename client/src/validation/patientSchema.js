// client/src/validation/patientSchema.js
import { z } from 'zod'

// Match the backend rules (simple and consistent)
export const patientCreateSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    age: z
        .union([z.string(), z.number()])
        .optional()
        .transform(v => {
            // Allow empty string => undefined, otherwise number
            if (v === '' || v === undefined || v === null) return undefined
            const n = Number(v)
            if (Number.isNaN(n)) return undefined
            return n
        })
        .refine(v => v === undefined || (Number.isInteger(v) && v >= 0), 'Age must be a whole number ≥ 0'),
    phoneNumber: z
        .string()
        .min(7, 'Phone number too short')
        .max(20, 'Phone number too long')
        .regex(/^[0-9+\-() ]+$/, 'Use digits, spaces, + - ( ) only'),
    healthIssue: z.string().optional().default(''),
})

export const patientUpdateSchema = patientCreateSchema.partial()
