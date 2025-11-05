//*** */ Purpose: Define what a valid patient object looks like at the API boundary.
// These rules run on the server for POST and PATCH to catch bad input early and to keep the DB safer and cleaner.

import { z } from 'zod'                                                                 //***I use Zod on the server to validate request bodies

// Create: All required fields must be present and valid. (We keep the rules simple and mirror the DB and frontend.)
export const patientCreateSchema = z.object({
    firstName: z.string().min(1, 'firstName is required'),
    lastName: z.string().min(1, 'lastName is required'),
    age: z.number().int().nonnegative().optional(),                                     // age is optional; if provided it must be a non-negative integer
    phoneNumber: z                                                                      // phone: allow digits, spaces, and + - ( )
        .string()
        .min(7, 'phoneNumber too short')
        .max(20, 'phoneNumber too long')
        .regex(/^[0-9+\-() ]+$/, 'phoneNumber can only contain digits, + - ( ) and spaces'),
    healthIssue: z.string().optional().default(''),                                     // optional note field
})
// Update: same shape as create, but every field becomes optional. Perfect for PATCH where clients send only what they want to change.
export const patientUpdateSchema = patientCreateSchema.partial()
