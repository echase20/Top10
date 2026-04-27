import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import OpinionBoard from './components/OpinionBoard'
import StatsModal from './components/StatsModal'
import WelcomeModal from './components/WelcomeModal'
import DevPanel from './components/DevPanel'
import { useGameState } from './hooks/useGameState'
import { useOpinionState } from './hooks/useOpinionState'
import './App.css'

export default function App() {
  const [view, setView] = useState('ranking')
  const [showStats, setShowStats] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const game = useGameState()
  const opinion = useOpinionState()

  const { puzzle, rankingLoaded, hasData, gameStatus, attemptsRemaining, stats } = game

  // Auto-show stats after the slide animation finishes (once per session)
  const statsAutoShownRef = useRef(false)
  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'lost') && !statsAutoShownRef.current) {
      statsAutoShownRef.current = true
      const t = setTimeout(() => setShowStats(true), 2800)
      return () => clearTimeout(t)
    }
  }, [gameStatus])

  const rankingStatus =
    !rankingLoaded
      ? 'Loading community rankings…'
      : !hasData
        ? 'No community responses yet — play the opinion game first!'
        : gameStatus === 'playing'
          ? `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`
          : gameStatus === 'won'
            ? 'You got it!'
            : 'Better luck tomorrow!'

  const handleContinueToOpinion = () => {
    setShowStats(false)
    setView('opinion')
  }

  const rankingDone = gameStatus === 'won' || gameStatus === 'lost'

  return (
    <div className="app">
      <Header onShowStats={() => setShowStats(true)} streak={stats.currentStreak} />

      <main className="main">
        {view === 'ranking' && (
          <>
            <div className="puzzle-info">
              <span className="category-badge">{puzzle.category}</span>
              <h2 className="question">{puzzle.question}</h2>
              <p className="attempts-remaining">{rankingStatus}</p>
            </div>
            {rankingLoaded && hasData && <GameBoard game={game} />}
            {rankingDone && (
              <button className="continue-to-opinion-btn" onClick={() => setView('opinion')}>
                Continue to Opinion Game →
              </button>
            )}
          </>
        )}

        {view === 'opinion' && (
          <>
            <div className="puzzle-info">
              <button className="back-btn" onClick={() => setView('ranking')}>
                ← Back to Puzzle
              </button>
              <span className="category-badge opinion-badge">
                {opinion.puzzle.category}
              </span>
              <h2 className="question">{opinion.puzzle.question}</h2>
              <p className="attempts-remaining">
                {opinion.gameStatus === 'submitted'
                  ? 'Response recorded!'
                  : 'No right or wrong — rank based on your personal opinion'}
              </p>
            </div>
            <OpinionBoard game={opinion} />
          </>
        )}
      </main>

      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
          gameStatus={gameStatus}
          onContinue={rankingDone && view === 'ranking' ? handleContinueToOpinion : null}
        />
      )}

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {import.meta.env.DEV && <DevPanel game={game} opinion={opinion} />}
    </div>
  )
}
