import { Button, Card, CardContent } from '../ui'
import { useRoundStore } from '../../stores/roundStore'
import { useShotsStore } from '../../stores/shotsStore'

export function SuccessScreen() {
  const round = useRoundStore((state) => state.round)
  const submittedRoundId = useRoundStore((state) => state.submittedRoundId)
  const reset = useRoundStore((state) => state.reset)
  const shotsReset = useShotsStore((state) => state.reset)

  const handleNewRound = () => {
    reset()
    shotsReset()
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto bg-score-under/10 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-10 h-10 text-score-under" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h2 className="font-display text-h2 text-ink mb-2">Round Submitted!</h2>
        <p className="font-mono text-xs text-pewter">
          Your round has been saved successfully
        </p>
      </div>

      {/* Success Details */}
      <Card variant="hero" accentColor="gold" className="mb-6">
        <CardContent className="text-center py-6">
          <p className="font-mono text-[10px] text-gold uppercase tracking-widest mb-4">
            Round Details
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Course</p>
              <p className="font-body text-sm text-ink">{round?.courseName}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Date</p>
              <p className="font-body text-sm text-ink">{round?.date}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Tournament</p>
              <p className="font-body text-sm text-ink">{round?.tournament}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-1">Holes</p>
              <p className="font-body text-sm text-ink">{round?.holes}</p>
            </div>
          </div>

          {submittedRoundId && (
            <div className="pt-4 border-t border-stone/50">
              <p className="font-mono text-[10px] text-pewter uppercase tracking-wider mb-2">
                Round ID
              </p>
              <p className="font-mono text-xs text-flint bg-parchment px-3 py-2 rounded inline-block">
                {submittedRoundId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action */}
      <Button onClick={handleNewRound} className="w-full">
        Start New Round
      </Button>
    </div>
  )
}
