import { Button, Card, CardContent } from '../ui'
import { useRoundStore } from '../../stores/roundStore'
import { useShotsStore } from '../../stores/shotsStore'

export function ReviewScreen() {
  const round = useRoundStore((state) => state.round)
  const setScreen = useRoundStore((state) => state.setScreen)
  const shots = useShotsStore((state) => state.shots)
  const totalShots = useShotsStore((state) => state.getTotalShotCount())
  const setSubmitting = useRoundStore((state) => state.setSubmitting)
  const setSubmitError = useRoundStore((state) => state.setSubmitError)
  const setSubmittedRoundId = useRoundStore((state) => state.setSubmittedRoundId)

  const totalHoles = round?.holes || 18

  // Validate: each hole must have exactly one holed shot
  const holesWithHoled = Array.from({ length: totalHoles }, (_, i) => i + 1)
    .filter((holeNum) => {
      const holeShots = shots[holeNum] || []
      return holeShots.some((s) => s.holed)
    })

  const validationErrors: string[] = []
  if (holesWithHoled.length < totalHoles) {
    const missingHoles = Array.from({ length: totalHoles }, (_, i) => i + 1)
      .filter((h) => !holesWithHoled.includes(h))
    validationErrors.push(`Missing holed shots for holes: ${missingHoles.join(', ')}`)
  }

  // Calculate score for each hole
  const getHoleScore = (holeNum: number): number => {
    return (shots[holeNum] || []).length
  }

  const getTotalScore = (): number => {
    return totalShots
  }

  const handleSubmit = async () => {
    if (!round) return

    if (validationErrors.length > 0) {
      setSubmitError('Please complete all holes before submitting')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const allShots = Object.values(shots).flat()

      // Get GAS URL from environment
      const GAS_URL = import.meta.env.VITE_GAS_URL || ''

      if (!GAS_URL) {
        // Demo mode - simulate success
        console.log('Demo mode - would submit:', { round, shots: allShots })
        setTimeout(() => {
          setSubmittedRoundId(round.roundId)
          setScreen('success')
          setSubmitting(false)
        }, 1500)
        return
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round,
          shots: allShots,
          replaceExisting: false,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSubmittedRoundId(data.roundId)
        setScreen('success')
      } else {
        setSubmitError(data.error || 'Failed to submit round')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const goBackToShotEntry = () => {
    setScreen('shot-entry')
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-h2 text-ink mb-2">Review Round</h2>
        <p className="font-mono text-xs text-pewter">
          {round?.courseName} • {round?.tournament}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card variant="stat" accentColor="forest">
          <CardContent className="text-center py-3">
            <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Holes</p>
            <p className="font-display text-2xl text-ink">{totalHoles}</p>
          </CardContent>
        </Card>
        <Card variant="stat" accentColor="gold">
          <CardContent className="text-center py-3">
            <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Shots</p>
            <p className="font-display text-2xl text-ink">{totalShots}</p>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="text-center py-3">
            <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Score</p>
            <p className="font-display text-2xl text-ink">+{getTotalScore() - 72}</p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-score-double/10 border border-score-double/30 rounded-lg p-4 mb-6">
          <p className="font-mono text-xs text-score-double font-medium mb-2">Please complete all holes:</p>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="font-body text-sm text-score-double">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hole-by-Hole Summary */}
      <div className="space-y-3 mb-6">
        {Array.from({ length: totalHoles }, (_, i) => i + 1).map((holeNum) => {
          const holeShots = shots[holeNum] || []
          const score = getHoleScore(holeNum)
          const isHoled = holeShots.some((s) => s.holed)

          return (
            <Card 
              key={holeNum} 
              variant="stat"
              accentColor={isHoled ? 'forest' : 'none'}
            >
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-ink w-8">Hole {holeNum}</span>
                    {!isHoled && (
                      <span className="font-mono text-[10px] text-score-double">Incomplete</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-pewter">
                      {holeShots.length} shots
                    </span>
                    <span className={`font-mono text-sm font-medium ${
                      score === 1 ? 'text-score-under' :
                      score === 2 ? 'text-score-even' :
                      score === 3 ? 'text-score-bogey' :
                      'text-score-double'
                    }`}>
                      {score === 1 ? 'E' : score === 2 ? '+1' : score === 3 ? '+2' : `+${score - 1}`}
                    </span>
                  </div>
                </div>
                
                {/* Table Header */}
                {holeShots.length > 0 && (
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 border-t border-stone/50 font-mono text-[9px] tracking-wider text-pewter uppercase">
                    <div>Shot</div>
                    <div>Start Dist</div>
                    <div>Start Lie</div>
                    <div>End Dist</div>
                    <div>End Lie</div>
                    <div className="text-center">Penalty</div>
                  </div>
                )}
                
                {/* Table Body */}
                {holeShots.length > 0 && (
                  <div className="divide-y divide-stone/30">
                    {holeShots.map((shot, idx) => (
                      <div 
                        key={shot.shotId}
                        className="grid grid-cols-6 gap-2 px-4 py-2 font-body text-sm text-ink"
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
                )}
                
                {holeShots.length === 0 && (
                  <div className="px-4 py-4 text-sm text-pewter italic border-t border-stone/50">
                    No shots recorded
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={goBackToShotEntry} className="flex-1">
          ← Edit Shots
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={validationErrors.length > 0}
        >
          Submit Round
        </Button>
      </div>
    </div>
  )
}
