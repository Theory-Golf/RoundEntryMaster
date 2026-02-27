import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Round, RoundDetailsFormData, Screen } from '../types'

interface RoundState {
  // Round data
  round: Round | null
  isRoundStarted: boolean
  
  // UI state
  currentScreen: Screen
  
  // Submission state
  isSubmitting: boolean
  submitError: string | null
  submittedRoundId: string | null
  
  // Actions
  startRound: (formData: RoundDetailsFormData) => void
  updateRound: (updates: Partial<Round>) => void
  setScreen: (screen: Screen) => void
  setSubmitting: (isSubmitting: boolean) => void
  setSubmitError: (error: string | null) => void
  setSubmittedRoundId: (roundId: string) => void
  reset: () => void
}

const APP_VERSION = '1.0.0'

export const useRoundStore = create<RoundState>((set) => ({
  round: null,
  isRoundStarted: false,
  currentScreen: 'round-details',
  isSubmitting: false,
  submitError: null,
  submittedRoundId: null,

  startRound: (formData: RoundDetailsFormData) => {
    const clientId = uuidv4()
    const roundId = uuidv4()
    
    const round: Round = {
      roundId,
      playerName: formData.playerName,
      date: formData.date,
      courseName: formData.courseName,
      tournament: formData.tournament,
      holes: formData.holes,
      courseDifficulty: formData.courseDifficulty,
      weather: formData.weather,
      clientId,
      appVersion: APP_VERSION,
    }
    
    set({
      round,
      isRoundStarted: true,
      currentScreen: 'shot-entry',
    })
  },

  updateRound: (updates: Partial<Round>) => {
    set((state) => ({
      round: state.round ? { ...state.round, ...updates } : null,
    }))
  },

  setScreen: (screen: Screen) => {
    set({ currentScreen: screen })
  },

  setSubmitting: (isSubmitting: boolean) => {
    set({ isSubmitting })
  },

  setSubmitError: (error: string | null) => {
    set({ submitError: error })
  },

  setSubmittedRoundId: (roundId: string) => {
    set({ submittedRoundId: roundId })
  },

  reset: () => {
    set({
      round: null,
      isRoundStarted: false,
      currentScreen: 'round-details',
      isSubmitting: false,
      submitError: null,
      submittedRoundId: null,
    })
  },
}))
