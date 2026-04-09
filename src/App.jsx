import { useState } from 'react'
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
  const [showStats, setShowStats] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [activeTab, setActiveTab] = useState('ranking')
  const game = useGameState()
  const opinion = useOpinionState()

  const { puzzle, rankingLoaded, hasData, gameStatus, attemptsRemaining, stats } = game

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

  return (
    <div className="app">
      <Header onShowStats={() => setShowStats(true)} streak={stats.currentStreak} />


      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          #1 Daily Ranking
        </button>
        <button
          className={`tab-btn ${activeTab === 'opinion' ? 'active' : ''}`}
          onClick={() => setActiveTab('opinion')}
        >
          #2 Your Opinion
        </button>
      </div>

      <main className="main">
        {activeTab === 'ranking' && (
          <>
            <div className="puzzle-info">
              <span className="category-badge">{puzzle.category}</span>
              <h2 className="question">{puzzle.question}</h2>
              <p className="attempts-remaining">{rankingStatus}</p>
            </div>
            {rankingLoaded && hasData && <GameBoard game={game} />}
          </>
        )}

        {activeTab === 'opinion' && (
          <>
            <div className="puzzle-info">
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
        <StatsModal stats={stats} onClose={() => setShowStats(false)} gameStatus={gameStatus} />
      )}

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {import.meta.env.DEV && <DevPanel game={game} opinion={opinion} />}
    </div>
  )
}
