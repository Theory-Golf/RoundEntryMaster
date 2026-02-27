import { useRoundStore } from './stores/roundStore'
import {
  RoundDetailsScreen,
  ShotEntryScreen,
  ReviewScreen,
  SuccessScreen,
} from './components/screens'

function App() {
  const currentScreen = useRoundStore((state) => state.currentScreen)

  // Render the appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'round-details':
        return <RoundDetailsScreen />
      case 'shot-entry':
        return <ShotEntryScreen />
      case 'review':
        return <ReviewScreen />
      case 'success':
        return <SuccessScreen />
      default:
        return <RoundDetailsScreen />
    }
  }

  return (
    <div className="min-h-screen bg-linen">
      {/* Header */}
      <header className="max-w-3xl mx-auto pt-8 pb-6 px-6 border-b border-stone">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase mb-3">
              Golf Intelligence
            </p>
            <h1 className="font-display text-h1 text-ink">
              Round <em className="text-forest italic">Entry</em>
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-pewter tracking-wider">v1.0</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-6">
        {renderScreen()}
      </main>
    </div>
  )
}

export default App
