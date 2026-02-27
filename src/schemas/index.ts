import { z } from 'zod'
import type { 
  RoundDetailsFormData, 
  ShotFormData, 
  Lie, 
  DistanceUnit,
  PuttLeave
} from '../types'

// ============================================
// ROUND DETAILS SCHEMA
// ============================================

export const roundDetailsSchema: z.ZodSchema<RoundDetailsFormData> = z.object({
  playerName: z
    .string()
    .min(1, 'Player name is required')
    .max(100, 'Player name must be less than 100 characters'),
  date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-mm-dd format'),
  courseName: z
    .string()
    .min(1, 'Course name is required')
    .max(200, 'Course name must be less than 200 characters'),
  tournament: z
    .string()
    .min(1, 'Tournament name is required')
    .max(200, 'Tournament name must be less than 200 characters'),
  holes: z.union([z.literal(9), z.literal(18)], {
    errorMap: () => ({ message: 'Please select 9 or 18 holes' }),
  }),
  courseDifficulty: z.enum(['Getable', 'Standard', 'Hard'], {
    errorMap: () => ({ message: 'Please select course difficulty' }),
  }),
  weather: z.enum(['Normal', 'Cold', 'Windy', 'Cold and Windy'], {
    errorMap: () => ({ message: 'Please select weather condition' }),
  }),
})

// ============================================
// SHOT SCHEMA
// ============================================

// Helper to get default unit based on lie
const getDefaultUnit = (lie: Lie): DistanceUnit => {
  return lie === 'Green' ? 'feet' : 'yards'
}

export const createShotSchema = (
  _holeNumber: number,
  _shotNumber: number,
  isFirstShot: boolean,
  _totalHoles: 9 | 18,
  existingShotsForHole: number
) => {
  return z.object({
    startLie: isFirstShot 
      ? z.literal('Tee', { errorMap: () => ({ message: 'First shot must start from Tee' }) })
      : z.enum(['Fairway', 'Rough', 'Sand', 'Recovery', 'Green'] as [Lie, ...Lie[]], {
          errorMap: () => ({ message: 'Please select a valid lie' }),
        }),
    startDistance: z
      .number()
      .min(0, 'Distance must be positive')
      .max(500, 'Distance seems too large')
      .optional()
      .nullable(),
    startUnit: z.enum(['yards', 'feet'] as [DistanceUnit, ...DistanceUnit[]]),
    endLie: z.enum(['Tee', 'Fairway', 'Rough', 'Sand', 'Recovery', 'Green'] as [Lie, ...Lie[]], {
      errorMap: () => ({ message: 'Please select a valid end lie' }),
    }),
    endDistance: z
      .number()
      .min(0, 'Distance must be positive')
      .max(500, 'Distance seems too large')
      .optional()
      .nullable(),
    endUnit: z.enum(['yards', 'feet'] as [DistanceUnit, ...DistanceUnit[]]),
    penalty: z.boolean(),
    holed: z.boolean(),
    nonDriverTeeShot: z.boolean().optional(),
    puttLeave: z.enum(['Short', 'Long'] as [PuttLeave, ...PuttLeave[]]).optional(),
  }).superRefine((data, ctx) => {
    // Rule: If holed, endLie must be Green and endDistance must be 0
    if (data.holed && data.endLie !== 'Green') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Holed shots must end on the Green',
        path: ['endLie'],
      })
    }
    if (data.holed && data.endDistance !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Holed shots must have 0 distance',
        path: ['endDistance'],
      })
    }
    
    // Rule: Non-driver tee shot only on Tee with distance >= 250
    if (data.nonDriverTeeShot && data.startLie !== 'Tee') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Non-driver option only applies to Tee shots',
        path: ['nonDriverTeeShot'],
      })
    }
    if (data.nonDriverTeeShot && (data.startDistance ?? 0) < 250) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Non-driver option only for shots 250+ yards',
        path: ['nonDriverTeeShot'],
      })
    }
    
    // Rule: Putt leave only on first putt >= 10 feet
    const isPutts = data.startLie === 'Green' && data.endLie === 'Green'
    const isFirstPutt = isPutts && existingShotsForHole === 0
    const isLongPutt = isPutts && (data.startDistance ?? 0) >= 10
    
    if (data.puttLeave && !isFirstPutt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Putt leave only applies to first putt',
        path: ['puttLeave'],
      })
    }
    if (data.puttLeave && !isLongPutt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Putt leave only for putts 10+ feet',
        path: ['puttLeave'],
      })
    }
  })
}

// ============================================
// DEFAULT VALUES
// ============================================

export const getDefaultShotFormData = (
  isFirstShot: boolean,
  _existingShotsForHole: number,
  _totalHoles: 9 | 18
): ShotFormData => {
  const startLie: Lie = isFirstShot ? 'Tee' : 'Fairway'
  
  return {
    startLie,
    startDistance: undefined as unknown as number, // Empty in UI
    startUnit: getDefaultUnit(startLie),
    endLie: isFirstShot ? 'Fairway' : 'Green',
    endDistance: undefined as unknown as number, // Empty in UI
    endUnit: 'yards',
    penalty: false,
    holed: false,
    nonDriverTeeShot: undefined,
    puttLeave: undefined,
  }
}

// ============================================
// TYPE EXPORTS
// ============================================

export type RoundDetailsSchema = z.infer<typeof roundDetailsSchema>
export type ShotSchema = z.infer<ReturnType<typeof createShotSchema>>
