import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Shot, ShotFormData } from '../types'

interface ShotsState {
  // Shots organized by hole number
  shots: Record<number, Shot[]>
  
  // Current editing state
  currentHole: number
  currentShotIndex: number
  
  // Actions
  addShot: (holeNumber: number, roundId: string, formData: ShotFormData) => Shot
  updateShot: (shotId: string, updates: Partial<Shot>) => void
  deleteShot: (shotId: string) => void
  getNextShotNumber: (holeNumber: number) => number
  getTotalShotCount: () => number
  getHoleShotCount: (holeNumber: number) => number
  hasHoledShot: (holeNumber: number) => boolean
  setCurrentHole: (hole: number) => void
  setCurrentShotIndex: (index: number) => void
  getShotsForHole: (holeNumber: number) => Shot[]
  getAllShots: () => Shot[]
  reset: () => void
}

export const useShotsStore = create<ShotsState>((set, get) => ({
  shots: {},
  currentHole: 1,
  currentShotIndex: 0,

  addShot: (holeNumber: number, roundId: string, formData: ShotFormData) => {
    const state = get()
    const shotNumber = state.getNextShotNumber(holeNumber)
    
    const shot: Shot = {
      shotId: uuidv4(),
      roundId,
      holeNumber,
      shotNumber,
      startLie: formData.startLie,
      startDistance: formData.startDistance ?? 0,
      startUnit: formData.startUnit,
      endLie: formData.endLie,
      endDistance: formData.endDistance ?? 0,
      endUnit: formData.endUnit,
      penalty: formData.penalty,
      holed: formData.holed,
      nonDriverTeeShot: formData.nonDriverTeeShot,
      puttLeave: formData.puttLeave,
    }
    
    set((state) => ({
      shots: {
        ...state.shots,
        [holeNumber]: [...(state.shots[holeNumber] || []), shot],
      },
      currentShotIndex: (state.shots[holeNumber]?.length || 0),
    }))
    
    return shot
  },

  updateShot: (shotId: string, updates: Partial<Shot>) => {
    set((state) => {
      const newShots = { ...state.shots }
      
      // Find and update the shot
      for (const holeNum of Object.keys(newShots)) {
        const holeShots = newShots[parseInt(holeNum)]
        const shotIndex = holeShots.findIndex((s) => s.shotId === shotId)
        
        if (shotIndex !== -1) {
          newShots[parseInt(holeNum)] = [
            ...holeShots.slice(0, shotIndex),
            { ...holeShots[shotIndex], ...updates },
            ...holeShots.slice(shotIndex + 1),
          ]
          break
        }
      }
      
      return { shots: newShots }
    })
  },

  deleteShot: (shotId: string) => {
    set((state) => {
      const newShots = { ...state.shots }
      
      for (const holeNum of Object.keys(newShots)) {
        const holeShots = newShots[parseInt(holeNum)]
        const shotIndex = holeShots.findIndex((s) => s.shotId === shotId)
        
        if (shotIndex !== -1) {
          const updatedHoleShots = [
            ...holeShots.slice(0, shotIndex),
            ...holeShots.slice(shotIndex + 1),
          ]
          
          // Renumber remaining shots
          updatedHoleShots.forEach((shot, idx) => {
            shot.shotNumber = idx + 1
          })
          
          newShots[parseInt(holeNum)] = updatedHoleShots
          break
        }
      }
      
      return { shots: newShots }
    })
  },

  getNextShotNumber: (holeNumber: number) => {
    const state = get()
    const holeShots = state.shots[holeNumber] || []
    return holeShots.length + 1
  },

  getTotalShotCount: () => {
    const state = get()
    return Object.values(state.shots).reduce((sum, holeShots) => sum + holeShots.length, 0)
  },

  getHoleShotCount: (holeNumber: number) => {
    const state = get()
    return (state.shots[holeNumber] || []).length
  },

  hasHoledShot: (holeNumber: number) => {
    const state = get()
    return (state.shots[holeNumber] || []).some((shot) => shot.holed)
  },

  setCurrentHole: (hole: number) => {
    set({ currentHole: hole, currentShotIndex: 0 })
  },

  setCurrentShotIndex: (index: number) => {
    set({ currentShotIndex: index })
  },

  getShotsForHole: (holeNumber: number) => {
    const state = get()
    return state.shots[holeNumber] || []
  },

  getAllShots: () => {
    const state = get()
    return Object.values(state.shots).flat()
  },

  reset: () => {
    set({
      shots: {},
      currentHole: 1,
      currentShotIndex: 0,
    })
  },
}))
