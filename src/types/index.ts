/**
 * Golf Entry App - TypeScript Types
 * Based on specification v1.0
 */

// ============================================
// ENUMS
// ============================================

export type Lie = 'Tee' | 'Fairway' | 'Rough' | 'Sand' | 'Recovery' | 'Green'

export type DistanceUnit = 'yards' | 'feet'

export type CourseDifficulty = 'Getable' | 'Standard' | 'Hard'

export type Weather = 'Normal' | 'Cold' | 'Windy' | 'Cold and Windy'

export type PuttLeave = 'Short' | 'Long'

// ============================================
// ROUND
// ============================================

export interface Round {
  roundId: string
  playerName: string
  date: string // yyyy-mm-dd
  courseName: string
  tournament: string
  holes: 9 | 18
  courseDifficulty: CourseDifficulty
  weather: Weather
  clientId: string
  appVersion: string
  submittedAt?: string // Set by backend
}

// ============================================
// SHOT
// ============================================

export interface Shot {
  shotId: string
  roundId: string
  holeNumber: number
  shotNumber: number
  startLie: Lie
  startDistance: number
  startUnit: DistanceUnit
  endLie: Lie
  endDistance: number
  endUnit: DistanceUnit
  penalty: boolean
  holed: boolean
  // Optional fields
  nonDriverTeeShot?: boolean // Only for Tee shots with startDistance >= 250
  puttLeave?: PuttLeave // Only for first putt >= 10 ft
}

// ============================================
// API PAYLOADS
// ============================================

export interface FullRoundPayload {
  round: Round
  shots: Shot[]
  replaceExisting?: boolean
}

export interface SuccessResponse {
  ok: true
  roundId: string
  roundRow: number
  shotsInserted: number
  submittedAt: string
}

export interface ErrorResponse {
  ok: false
  error: string
  details?: string
}

export type APIResponse = SuccessResponse | ErrorResponse

// ============================================
// UI STATE TYPES
// ============================================

export type Screen = 'round-details' | 'shot-entry' | 'review' | 'success'

export interface ShotEntryState {
  currentHole: number
  currentShotNumber: number
  totalShots: number
}

// ============================================
// FORM TYPES
// ============================================

export interface RoundDetailsFormData {
  playerName: string
  date: string
  courseName: string
  tournament: string
  holes: 9 | 18
  courseDifficulty: CourseDifficulty
  weather: Weather
}

export interface ShotFormData {
  startLie: Lie
  startDistance?: number
  startUnit: DistanceUnit
  endLie: Lie
  endDistance?: number
  endUnit: DistanceUnit
  penalty: boolean
  holed: boolean
  nonDriverTeeShot?: boolean
  puttLeave?: PuttLeave
}

// ============================================
// LIE OPTIONS
// ============================================

export const LIE_OPTIONS: Lie[] = ['Tee', 'Fairway', 'Rough', 'Sand', 'Recovery', 'Green']

export const LIE_OPTIONS_OFF_GREEN: Lie[] = ['Tee', 'Fairway', 'Rough', 'Sand', 'Recovery']

// ============================================
// UI OPTIONS
// ============================================

export const COURSE_DIFFICULTY_OPTIONS: CourseDifficulty[] = ['Getable', 'Standard', 'Hard']

export const WEATHER_OPTIONS: Weather[] = ['Normal', 'Cold', 'Windy', 'Cold and Windy']

export const PUTT_LEAVE_OPTIONS: PuttLeave[] = ['Short', 'Long']

export const DISTANCE_UNIT_OPTIONS: DistanceUnit[] = ['yards', 'feet']

export const HOLES_OPTIONS: (9 | 18)[] = [9, 18]
