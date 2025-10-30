//Schema (patient.schema.js) — the rules for what a valid request body looks like.

import { z } from 'zod';

export const patientCreateSchema = z.object({
    firstName: z.string().min(1, 'firstName is required'),
    lastName: z.string().min(1, 'lastName is required'),
    // age is optional but if present must be a non-negative integer
    age: z.number().int().nonnegative().optional(),
    // keep phone simple: digits and + - ( ) space; front-end will enforce further later
    phoneNumber: z
        .string()
        .min(7, 'phoneNumber too short')
        .max(20, 'phoneNumber too long')
        .regex(/^[0-9+\-() ]+$/, 'phoneNumber can only contain digits, + - ( ) and spaces'),
    healthIssue: z.string().optional().default(''),
});

export const patientUpdateSchema = patientCreateSchema.partial(); //.partial() makes every field optional.Now PATCH requests can send just the fields you want to change.
