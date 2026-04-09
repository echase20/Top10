import { useState, useCallback, useEffect, useMemo } from 'react'
import { puzzles } from '../data/puzzles'
import { evaluateAttempt, isWin, shuffleArray, getPuzzleIndex, getTodayStrET, getYesterdayStrET } from '../utils/gameLogic'

const MAX_ATTEMPTS = 3
const STATS_KEY = 'top10_stats'

function getDefaultStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0],
    lastPlayed: null,
  }
}

function loadStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    if (!saved) return getDefaultStats()
    return { ...getDefaultStats(), ...JSON.parse(saved) }
  } catch {
    return getDefaultStats()
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {}
}

function getYesterdayPuzzle() {
  const devId = localStorage.getItem('top10_dev_puzzleId')
  if (devId !== null) {
    const found = puzzles.find(p => p.id === Number(devId))
    if (found) {
      const prevIdx = puzzles.indexOf(found)
      return puzzles[Math.max(0, prevIdx - 1)]
    }
  }
  const yesterday = getYesterdayStrET()
  const idx = getPuzzleIndex(yesterday)
  return puzzles[idx % puzzles.length]
}

export function useGameState() {
  const todayET = getTodayStrET()
  const yesterdayPuzzle = getYesterdayPuzzle()
  const basePuzzle = yesterdayPuzzle.opinionPuzzle
  const gameKey = `top10_game_${todayET}_${yesterdayPuzzle.id}`

  const [stats, setStats] = useState(loadStats)
  const [communityRanking, setCommunityRanking] = useState({
    loaded: false,
    hasData: false,
    rankedIds: [],
  })

  useEffect(() => {
    fetch(`/api/opinion/aggregate/${yesterdayPuzzle.id}`)
      .then(res => res.json())
      .then(data => {
        setCommunityRanking({ loaded: true, hasData: data.hasData, rankedIds: data.rankedIds || [] })
      })
      .catch(() => {
        setCommunityRanking({ loaded: true, hasData: false, rankedIds: [] })
      })
  }, [yesterdayPuzzle.id])

  // Build puzzle with correctRank once community ranking is loaded.
  // Falls back to a static rankingPuzzle on the puzzle entry if one exists and no responses are in yet.
  const puzzle = useMemo(() => {
    if (!communityRanking.loaded) {
      return { id: yesterdayPuzzle.id, ...basePuzzle }
    }
    if (communityRanking.hasData) {
      return {
        id: yesterdayPuzzle.id,
        category: basePuzzle.category,
        question: basePuzzle.question,
        items: basePuzzle.items.map(item => ({
          ...item,
          correctRank: communityRanking.rankedIds.indexOf(item.id) + 1,
        })),
      }
    }
    if (yesterdayPuzzle.rankingPuzzle) {
      return { id: yesterdayPuzzle.id, ...yesterdayPuzzle.rankingPuzzle }
    }
    return { id: yesterdayPuzzle.id, ...basePuzzle }
  }, [yesterdayPuzzle, basePuzzle, communityRanking])

  const initGame = () => {
    try {
      const saved = localStorage.getItem(gameKey)
      if (saved) {
        const state = JSON.parse(saved)
        const itemMap = Object.fromEntries(basePuzzle.items.map(i => [i.id, i]))
        return {
          leftItems: state.leftItemIds.map(id => itemMap[id]).filter(Boolean),
          rightItems: state.rightItemIds.map(id => (id != null ? itemMap[id] : null)),
          attempts: state.attempts.map(a => ({
            items: a.itemIds.map(id => (id != null ? itemMap[id] : null)),
            feedback: a.feedback,
          })),
          gameStatus: state.gameStatus,
          lastFeedback: state.lastFeedback || null,
          lockedSlots: state.lockedSlots || Array(10).fill(false),
        }
      }
    } catch {}
    return {
      leftItems: shuffleArray([...basePuzzle.items]),
      rightItems: Array(10).fill(null),
      attempts: [],
      gameStatus: 'playing',
      lastFeedback: null,
      lockedSlots: Array(10).fill(false),
    }
  }

  const [gameState, setGameState] = useState(initGame)
  const [selectedItem, setSelectedItem] = useState(null)

  const { leftItems, rightItems, attempts, gameStatus, lastFeedback, lockedSlots } = gameState

  useEffect(() => {
    try {
      const toSave = {
        leftItemIds: gameState.leftItems.map(i => i.id),
        rightItemIds: gameState.rightItems.map(i => (i ? i.id : null)),
        attempts: gameState.attempts.map(a => ({
          itemIds: a.items.map(i => (i ? i.id : null)),
          feedback: a.feedback,
        })),
        gameStatus: gameState.gameStatus,
        lastFeedback: gameState.lastFeedback,
        lockedSlots: gameState.lockedSlots,
      }
      localStorage.setItem(gameKey, JSON.stringify(toSave))
    } catch {}
  }, [gameState, gameKey])

  const isSubmittable = rightItems.every(item => item !== null)
  const attemptsRemaining = MAX_ATTEMPTS - attempts.length
  const inFeedbackMode = lastFeedback !== null

  const placeItem = useCallback((item, fromSource, fromIndex, toIndex) => {
    setGameState(prev => {
      if (fromSource === 'right' && prev.lockedSlots[fromIndex]) return prev
      if (prev.lockedSlots[toIndex]) return prev
      const newLeft = [...prev.leftItems]
      const newRight = [...prev.rightItems]
      const displaced = newRight[toIndex]

      if (fromSource === 'left') {
        const leftIdx = newLeft.findIndex(i => i.id === item.id)
        if (leftIdx !== -1) newLeft.splice(leftIdx, 1)
        newRight[toIndex] = item
        if (displaced) newLeft.push(displaced)
      } else {
        newRight[fromIndex] = displaced
        newRight[toIndex] = item
      }

      return { ...prev, leftItems: newLeft, rightItems: newRight }
    })
    setSelectedItem(null)
  }, [])

  const returnToLeft = useCallback((item, fromIndex) => {
    setGameState(prev => {
      if (prev.lockedSlots[fromIndex]) return prev
      const newLeft = [...prev.leftItems, item]
      const newRight = [...prev.rightItems]
      newRight[fromIndex] = null
      return { ...prev, leftItems: newLeft, rightItems: newRight }
    })
    setSelectedItem(null)
  }, [])

  const handleSelectItem = useCallback(
    (item, source, index) => {
      if (gameStatus !== 'playing' || inFeedbackMode) return
      if (source === 'right' && lockedSlots[index]) return
      setSelectedItem(prev => {
        if (prev && prev.item.id === item.id && prev.source === source && prev.index === index) {
          return null
        }
        return { item, source, index }
      })
    },
    [gameStatus, inFeedbackMode, lockedSlots],
  )

  const handleSlotClick = useCallback(
    targetIndex => {
      if (gameStatus !== 'playing' || inFeedbackMode) return
      if (lockedSlots[targetIndex]) return
      const targetItem = rightItems[targetIndex]

      if (!selectedItem) {
        if (targetItem) {
          setSelectedItem({ item: targetItem, source: 'right', index: targetIndex })
        }
        return
      }

      if (selectedItem.source === 'right' && selectedItem.index === targetIndex) {
        setSelectedItem(null)
        return
      }

      placeItem(selectedItem.item, selectedItem.source, selectedItem.index, targetIndex)
    },
    [selectedItem, rightItems, gameStatus, inFeedbackMode, lockedSlots, placeItem],
  )

  const handleDrop = useCallback(
    (targetType, targetIndex, dragData) => {
      if (gameStatus !== 'playing' || inFeedbackMode) return
      const { source, index: fromIndex, itemId } = dragData
      if (source === 'right' && lockedSlots[fromIndex]) return
      if (targetType === 'right' && lockedSlots[targetIndex]) return
      const item = basePuzzle.items.find(i => i.id === itemId)
      if (!item) return

      if (targetType === 'right') {
        if (source === 'right' && fromIndex === targetIndex) return
        placeItem(item, source, fromIndex, targetIndex)
      } else if (targetType === 'left' && source === 'right') {
        returnToLeft(item, fromIndex)
      }
    },
    [basePuzzle, gameStatus, inFeedbackMode, lockedSlots, placeItem, returnToLeft],
  )

  const handleSubmit = useCallback(() => {
    if (!isSubmittable || gameStatus !== 'playing' || inFeedbackMode) return
    if (!communityRanking.loaded) return
    if (!communityRanking.hasData && !yesterdayPuzzle.rankingPuzzle) return

    const feedback = evaluateAttempt(rightItems, puzzle)
    const won = isWin(feedback)
    const newAttempts = [...attempts, { items: [...rightItems], feedback }]
    const newAttemptCount = newAttempts.length
    const newStatus = won ? 'won' : newAttemptCount >= MAX_ATTEMPTS ? 'lost' : 'playing'

    if (newStatus !== 'playing') {
      const today = getTodayStrET()
      setStats(prev => {
        const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1, lastPlayed: today }
        if (won) {
          next.gamesWon = prev.gamesWon + 1
          next.currentStreak = prev.currentStreak + 1
          next.maxStreak = Math.max(prev.maxStreak, next.currentStreak)
          next.guessDistribution = [...prev.guessDistribution]
          next.guessDistribution[newAttemptCount - 1]++
        } else {
          next.currentStreak = 0
        }
        saveStats(next)
        return next
      })
    }

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      gameStatus: newStatus,
      lastFeedback: feedback,
    }))
    setSelectedItem(null)
  }, [isSubmittable, gameStatus, inFeedbackMode, rightItems, puzzle, attempts, communityRanking])

  const handleReset = useCallback(() => {
    setGameState(prev => {
      if (!prev.lastFeedback) return prev
      const newLeft = [...prev.leftItems]
      const newRight = [...prev.rightItems]
      const newLocked = [...prev.lockedSlots]

      prev.lastFeedback.forEach((fb, index) => {
        if (fb === 'correct') {
          newLocked[index] = true
        } else {
          const item = newRight[index]
          if (item) {
            newLeft.push(item)
            newRight[index] = null
          }
        }
      })

      return { ...prev, leftItems: newLeft, rightItems: newRight, lastFeedback: null, lockedSlots: newLocked }
    })
    setSelectedItem(null)
  }, [])

  const correctAnswer =
    gameStatus === 'lost' && communityRanking.hasData
      ? [...puzzle.items].sort((a, b) => a.correctRank - b.correctRank)
      : null

  const resetGame = useCallback(() => {
    localStorage.removeItem(gameKey)
    setGameState({
      leftItems: shuffleArray([...basePuzzle.items]),
      rightItems: Array(10).fill(null),
      attempts: [],
      gameStatus: 'playing',
      lastFeedback: null,
      lockedSlots: Array(10).fill(false),
    })
    setSelectedItem(null)
  }, [gameKey, basePuzzle])

  const resetStats = useCallback(() => {
    localStorage.removeItem(STATS_KEY)
    setStats(getDefaultStats())
  }, [])

  return {
    puzzle,
    rankingLoaded: communityRanking.loaded,
    hasData: communityRanking.hasData || !!yesterdayPuzzle.rankingPuzzle,
    leftItems,
    rightItems,
    selectedItem,
    attempts,
    gameStatus,
    lastFeedback,
    inFeedbackMode,
    lockedSlots,
    stats,
    isSubmittable,
    attemptsRemaining,
    correctAnswer,
    handleSelectItem,
    handleSlotClick,
    handleDrop,
    handleSubmit,
    handleReset,
    resetGame,
    resetStats,
  }
}
