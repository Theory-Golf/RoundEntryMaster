import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Card, CardContent, ChipGroup } from '../ui'
import { useRoundStore } from '../../stores/roundStore'
import { useShotsStore } from '../../stores/shotsStore'
import { createShotSchema, getDefaultShotFormData } from '../../schemas'
import type { ShotFormData, Lie, DistanceUnit, PuttLeave } from '../../types'
import { LIE_OPTIONS, DISTANCE_UNIT_OPTIONS, PUTT_LEAVE_OPTIONS } from '../../types'

// Helper to get default end lie based on start lie and distance
const getPredictedEndLie = (startLie: Lie, startDistance: number): Lie => {
  if (startLie === 'Green') return 'Green'
  if (startLie === 'Tee') {
    return startDistance <= 225 ? 'Green' : 'Fairway'
  }
  return 'Green'
}

// Helper to get default unit based on lie
const getDefaultUnit = (lie: Lie): DistanceUnit => {
  return lie === 'Green' ? 'feet' : 'yards'
}

export function ShotEntryScreen() {
  const round = useRoundStore((state) => state.round)
  const currentHole = useShotsStore((state) => state.currentHole)
  const setCurrentHole = useShotsStore((state) => state.setCurrentHole)
  const currentShotIndex = useShotsStore((state) => state.currentShotIndex)
  const setCurrentShotIndex = useShotsStore((state) => state.setCurrentShotIndex)
  const totalShots = useShotsStore((state) => state.getTotalShotCount())
  const getNextShotNumber = useShotsStore((state) => state.getNextShotNumber)
  const getHoleShotCount = useShotsStore((state) => state.getHoleShotCount)
  const addShot = useShotsStore((state) => state.addShot)
  const getShotsForHole = useShotsStore((state) => state.getShotsForHole)
  const setScreen = useRoundStore((state) => state.setScreen)

  const totalHoles = round?.holes || 18
  const shotNumber = getNextShotNumber(currentHole)
  const existingShotsForHole = getHoleShotCount(currentHole)
  const isFirstShot = shotNumber === 1
  const holeShots = getShotsForHole(currentHole)
  
  // Get previous shot's end data for auto-populating start
  const previousShot = holeShots.length > 0 ? holeShots[holeShots.length - 1] : null
  
  // Start distance is only editable for first shot of hole
  const canEditStartDistance = isFirstShot
  
  // Start lie is read-only (first shot = Tee, otherwise = previous shot's end lie)
  const startLieDisplay: Lie = isFirstShot ? 'Tee' : (previousShot?.endLie || 'Fairway') as Lie

  const defaultValues = getDefaultShotFormData(isFirstShot, existingShotsForHole, totalHoles)
  // Override with previous shot's end distance/unit
  if (!isFirstShot && previousShot) {
    defaultValues.startDistance = previousShot.endDistance
    defaultValues.startUnit = previousShot.endUnit
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ShotFormData>({
    resolver: zodResolver(createShotSchema(currentHole, shotNumber, isFirstShot, totalHoles, existingShotsForHole)),
    defaultValues,
  })

  // Watch form values for reactive updates
  const watchStartLie = watch('startLie')
  const watchStartDistance = watch('startDistance')
  const watchEndDistance = watch('endDistance')
  // Infer holed status from endDistance being 0
  const isHoled = watchEndDistance === 0

  // Update end lie prediction when start lie or distance changes
  useEffect(() => {
    if (!isHoled) {
      const predictedEndLie = getPredictedEndLie(watchStartLie, watchStartDistance || 0)
      setValue('endLie', predictedEndLie)
      setValue('endUnit', getDefaultUnit(predictedEndLie))
    }
  }, [watchStartLie, watchStartDistance, isHoled, setValue])

  // Reset form when hole changes
  useEffect(() => {
    const newDefaults = getDefaultShotFormData(
      getNextShotNumber(currentHole) === 1,
      getHoleShotCount(currentHole),
      totalHoles
    )
    
    // Get previous shot for auto-populate (only for subsequent shots within same hole)
    const currentHoleShots = getShotsForHole(currentHole)
    const prevShot = currentHoleShots.length > 0 ? currentHoleShots[currentHoleShots.length - 1] : null
    
    // Only auto-populate start distance for subsequent shots WITHIN the same hole
    // Don't auto-populate when moving to a new hole - let user input the starting distance
    if (getNextShotNumber(currentHole) !== 1 && prevShot) {
      newDefaults.startDistance = prevShot.endDistance
      newDefaults.startUnit = prevShot.endUnit
    }
    // When starting a new hole (first shot), leave startDistance blank for user input
    
    reset(newDefaults)
  }, [currentHole, getNextShotNumber, getHoleShotCount, totalHoles, getShotsForHole, reset])

  // Determine if non-driver option should show
  const showNonDriverOption = watchStartLie === 'Tee' && (watchStartDistance || 0) >= 250

  // Determine if putt leave should show
  const isPutt = watchStartLie === 'Green' && watchStartLie === 'Green'
  const isFirstPutt = isPutt && existingShotsForHole === 0
  const isLongPutt = isPutt && (watchStartDistance || 0) >= 10
  const showPuttLeave = isFirstPutt && isLongPutt

  // Options for lie selection
  const endLieOptions = LIE_OPTIONS.map((lie) => ({ value: lie, label: lie }))

  const unitOptions = DISTANCE_UNIT_OPTIONS.map((unit) => ({
    value: unit,
    label: unit === 'yards' ? 'yds' : 'ft',
  }))

  const puttLeaveOptions = PUTT_LEAVE_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }))

  const onSubmit = (data: ShotFormData) => {
    if (!round) return

    // Infer holed status from endDistance being 0
    const isShotHoled = data.endDistance === 0
    
    // Set holed flag and ensure endLie is Green when holed
    if (isShotHoled) {
      data.holed = true
      data.endLie = 'Green'
      data.endUnit = 'feet'
    }

    addShot(currentHole, round.roundId, data)

    // If holed, advance to next hole
    if (isShotHoled) {
      if (currentHole < totalHoles) {
        setCurrentHole(currentHole + 1)
      } else {
        setScreen('review')
      }
    } else {
      // Stay on same hole for next shot - auto-populate start from previous
      const updatedHoleShots = getShotsForHole(currentHole)
      const lastShot = updatedHoleShots[updatedHoleShots.length - 1]
      
      reset({
        ...getDefaultShotFormData(false, getHoleShotCount(currentHole) + 1, totalHoles),
        startLie: lastShot.endLie,
        startDistance: lastShot.endDistance,
        startUnit: lastShot.endUnit,
        endLie: getPredictedEndLie(lastShot.endLie, lastShot.endDistance),
        endUnit: getDefaultUnit(getPredictedEndLie(lastShot.endLie, lastShot.endDistance)),
        endDistance: '' as unknown as number,
      })
    }
  }

  const goToNextHole = () => {
    if (currentHole < totalHoles) {
      setCurrentHole(currentHole + 1)
      setCurrentShotIndex(0)
    }
  }

  const goToPreviousShot = () => {
    if (currentShotIndex > 0) {
      // Go to previous shot on current hole
      const prevShot = holeShots[currentShotIndex - 1]
      setCurrentShotIndex(currentShotIndex - 1)
      reset({
        startLie: prevShot.startLie,
        startDistance: prevShot.startDistance,
        startUnit: prevShot.startUnit,
        endLie: prevShot.endLie,
        endDistance: prevShot.endDistance,
        endUnit: prevShot.endUnit,
        penalty: prevShot.penalty,
        holed: prevShot.holed,
        nonDriverTeeShot: prevShot.nonDriverTeeShot,
        puttLeave: prevShot.puttLeave,
      })
    } else if (currentHole > 1) {
      // Go to last shot of previous hole
      const prevHole = currentHole - 1
      const prevHoleShots = getShotsForHole(prevHole)
      if (prevHoleShots.length > 0) {
        setCurrentHole(prevHole)
        setCurrentShotIndex(prevHoleShots.length - 1)
        const lastShot = prevHoleShots[prevHoleShots.length - 1]
        reset({
          startLie: lastShot.startLie,
          startDistance: lastShot.startDistance,
          startUnit: lastShot.startUnit,
          endLie: lastShot.endLie,
          endDistance: lastShot.endDistance,
          endUnit: lastShot.endUnit,
          penalty: lastShot.penalty,
          holed: lastShot.holed,
          nonDriverTeeShot: lastShot.nonDriverTeeShot,
          puttLeave: lastShot.puttLeave,
        })
      }
    }
  }

  const goToReview = () => {
    setScreen('review')
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-h2 text-ink mb-1">Shot Entry</h2>
            <p className="font-mono text-xs text-pewter">
              {round?.courseName} • {round?.tournament}
            </p>
          </div>
          <Button variant="outline" onClick={goToReview}>
            Review
          </Button>
        </div>
      </div>

      {/* Shot Header - Lighter colors for readability */}
      <div className="bg-forest text-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest">Hole</p>
            <p className="font-display text-4xl font-light text-white">{currentHole}</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest">Shot</p>
            <p className="font-display text-4xl font-light text-white">{shotNumber}</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest">Total</p>
            <p className="font-display text-4xl font-light text-white">{totalShots}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant="stat" className="mb-6">
          <CardContent>
            {/* Start Distance - Only editable on first shot */}
            <div className="mb-3">
              <label className="block font-mono text-[10px] tracking-widest text-pewter uppercase mb-2">
                {isFirstShot ? 'Start Distance' : 'Start Distance'}
                {!isFirstShot && <span className="text-flint ml-2">(from previous)</span>}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    inputMode="numeric"
                    disabled={!canEditStartDistance}
                    error={errors.startDistance?.message}
                    {...register('startDistance', {
                      setValueAs: (value) => value === '' ? undefined : Number(value),
                    })}
                    className={!canEditStartDistance ? 'bg-parchment' : ''}
                  />
                </div>
                <div className="w-16">
                  <ChipGroup
                    options={unitOptions}
                    value={watchStartLie === 'Green' ? 'feet' : 'yards'}
                    onChange={(value) => setValue('startUnit', value as DistanceUnit)}
                  />
                </div>
              </div>
            </div>

            {/* Start Lie - Read Only - Less spacing */}
            <div className="mb-4">
              <label className="block font-mono text-[10px] tracking-widest text-pewter uppercase mb-2">
                Start Lie {!isFirstShot && <span className="text-flint ml-2">(prev)</span>}
              </label>
              <div className={`px-4 py-2 bg-parchment border border-stone rounded text-ink font-body ${
                isFirstShot ? 'text-flint' : ''
              }`}>
                {isFirstShot ? 'Tee' : startLieDisplay}
              </div>
            </div>

            {/* Non-driver option (Tee >= 250y) */}
            {showNonDriverOption && (
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('nonDriverTeeShot')}
                    className="w-5 h-5 rounded border-stone text-forest focus:ring-forest"
                  />
                  <span className="font-body text-sm text-ink">I did NOT hit driver</span>
                </label>
              </div>
            )}

            {/* End Distance & Unit - before End Lie */}
            <div className="mb-3">
              <label className="block font-mono text-[10px] tracking-widest text-pewter uppercase mb-2">
                End Distance
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    inputMode="numeric"
                    disabled={isHoled}
                    error={errors.endDistance?.message}
                    {...register('endDistance', {
                      setValueAs: (value) => value === '' ? undefined : Number(value),
                    })}
                    className={isHoled ? 'bg-parchment' : ''}
                  />
                </div>
                <div className="w-16">
                  <ChipGroup
                    options={unitOptions}
                    value={watchStartLie === 'Green' || watch('endLie') === 'Green' ? 'feet' : 'yards'}
                    onChange={(value) => setValue('endUnit', value as DistanceUnit)}
                  />
                </div>
              </div>
            </div>

            {/* End Lie - Below End Distance */}
            <div className="mb-4">
              <ChipGroup
                label="End Lie"
                options={endLieOptions}
                value={watchStartLie === 'Green' ? 'Green' : watch('endLie')}
                onChange={(value) => setValue('endLie', value)}
                disabled={isHoled}
                error={errors.endLie?.message}
              />
            </div>

            {/* Putt Leave (first putt >= 10ft) */}
            {showPuttLeave && (
              <div className="mb-4">
                <ChipGroup
                  label="Putt Leave"
                  options={[{ value: 'None' as PuttLeave, label: 'None' }, ...puttLeaveOptions]}
                  value={watch('puttLeave') || 'None'}
                  onChange={(value) => setValue('puttLeave', value === 'None' ? undefined : value as PuttLeave)}
                />
              </div>
            )}

            {/* Penalty */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('penalty')}
                  className="w-5 h-5 rounded border-stone text-forest focus:ring-forest"
                />
                <span className="font-body text-sm text-ink">Penalty Stroke</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={goToPreviousShot}
            disabled={currentHole === 1 && currentShotIndex === 0}
            className="flex-1"
          >
            ← Prev Shot
          </Button>
          
          <Button type="submit" className="flex-1">
            {isHoled ? 'Next Hole →' : 'Add Shot'}
          </Button>
        </div>

        {currentHole < totalHoles && (
          <Button 
            type="button" 
            variant="gold" 
            onClick={goToNextHole}
            className="w-full mt-3"
          >
            Skip to Hole {currentHole + 1} →
          </Button>
        )}
      </form>

      {/* Mini Hole Summary - Table Format */}
      <div className="mt-8">
        <h3 className="font-mono text-[10px] tracking-widest text-pewter uppercase mb-3">
          Hole {currentHole} Summary
        </h3>
        {holeShots.length === 0 ? (
          <p className="text-sm text-pewter italic">No shots recorded yet</p>
        ) : (
          <div className="bg-white border border-stone rounded overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-parchment border-b border-stone font-mono text-[9px] tracking-wider text-pewter uppercase">
              <div>Shot</div>
              <div>Start Dist</div>
              <div>Start Lie</div>
              <div>End Dist</div>
              <div>End Lie</div>
              <div className="text-center">Penalty</div>
            </div>
            {/* Table Body */}
            <div className="divide-y divide-stone/50">
              {holeShots.map((shot, idx) => (
                <div 
                  key={shot.shotId}
                  className="grid grid-cols-6 gap-2 px-3 py-2 font-body text-sm text-ink"
                >
                  <div className="font-mono text-xs text-pewter">#{idx + 1}</div>
                  <div>{shot.startDistance}{shot.startUnit === 'yards' ? 'yds' : 'ft'}</div>
                  <div>{shot.startLie}</div>
                  <div>{shot.holed ? '—' : `${shot.endDistance}${shot.endUnit === 'yards' ? 'yds' : 'ft'}`}</div>
                  <div>{shot.holed ? 'HOLED' : shot.endLie}</div>
                  <div className="text-center">
                    {shot.penalty && (
                      <span className="bg-score-double text-white text-[10px] px-2 py-0.5 rounded-full">
                        +1
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
