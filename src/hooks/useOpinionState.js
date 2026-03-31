import { useState, useCallback, useEffect } from 'react'
import { puzzles } from '../data/puzzles'
import { shuffleArray, getPuzzleIndex } from '../utils/gameLogic'
import { getSessionId } from '../utils/session'

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function getTodayPuzzle() {
  const devId = localStorage.getItem('top10_dev_puzzleId')
  if (devId !== null) {
    const found = puzzles.find(p => p.id === Number(devId))
    if (found) return found
  }
  const today = getTodayStr()
  const idx = getPuzzleIndex(today)
  return puzzles[idx % puzzles.length]
}

export function useOpinionState() {
  const dailyPuzzle = getTodayPuzzle()
  const puzzle = dailyPuzzle.opinionPuzzle
  const gameKey = `top10_opinion_${dailyPuzzle.id}`

  const initGame = () => {
    try {
      const saved = localStorage.getItem(gameKey)
      if (saved) {
        const state = JSON.parse(saved)
        const itemMap = Object.fromEntries(puzzle.items.map(i => [i.id, i]))
        return {
          leftItems: state.leftItemIds.map(id => itemMap[id]).filter(Boolean),
          rightItems: state.rightItemIds.map(id => (id != null ? itemMap[id] : null)),
          gameStatus: state.gameStatus,
          submittedRanking: state.submittedRankingIds
            ? state.submittedRankingIds.map(id => itemMap[id]).filter(Boolean)
            : null,
        }
      }
    } catch {}
    return {
      leftItems: shuffleArray([...puzzle.items]),
      rightItems: Array(10).fill(null),
      gameStatus: 'playing',
      submittedRanking: null,
    }
  }

  const [gameState, setGameState] = useState(initGame)
  const [selectedItem, setSelectedItem] = useState(null)

  const { leftItems, rightItems, gameStatus, submittedRanking } = gameState

  useEffect(() => {
    try {
      const toSave = {
        leftItemIds: gameState.leftItems.map(i => i.id),
        rightItemIds: gameState.rightItems.map(i => (i ? i.id : null)),
        gameStatus: gameState.gameStatus,
        submittedRankingIds: gameState.submittedRanking
          ? gameState.submittedRanking.map(i => i.id)
          : null,
      }
      localStorage.setItem(gameKey, JSON.stringify(toSave))
    } catch {}
  }, [gameState, gameKey])

  const isSubmittable = rightItems.every(item => item !== null)

  const placeItem = useCallback((item, fromSource, fromIndex, toIndex) => {
    setGameState(prev => {
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
      const newLeft = [...prev.leftItems, item]
      const newRight = [...prev.rightItems]
      newRight[fromIndex] = null
      return { ...prev, leftItems: newLeft, rightItems: newRight }
    })
    setSelectedItem(null)
  }, [])

  const handleSelectItem = useCallback(
    (item, source, index) => {
      if (gameStatus !== 'playing') return
      setSelectedItem(prev => {
        if (prev && prev.item.id === item.id && prev.source === source && prev.index === index) {
          return null
        }
        return { item, source, index }
      })
    },
    [gameStatus],
  )

  const handleSlotClick = useCallback(
    targetIndex => {
      if (gameStatus !== 'playing') return
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
    [selectedItem, rightItems, gameStatus, placeItem],
  )

  const handleDrop = useCallback(
    (targetType, targetIndex, dragData) => {
      if (gameStatus !== 'playing') return
      const { source, index: fromIndex, itemId } = dragData
      const item = puzzle.items.find(i => i.id === itemId)
      if (!item) return

      if (targetType === 'right') {
        if (source === 'right' && fromIndex === targetIndex) return
        placeItem(item, source, fromIndex, targetIndex)
      } else if (targetType === 'left' && source === 'right') {
        returnToLeft(item, fromIndex)
      }
    },
    [puzzle, gameStatus, placeItem, returnToLeft],
  )

  const handleSubmit = useCallback(() => {
    if (!isSubmittable || gameStatus !== 'playing') return

    const ranking = rightItems.map(item => item.id)

    // Save locally immediately — game state persists regardless of server response
    setGameState(prev => ({
      ...prev,
      gameStatus: 'submitted',
      submittedRanking: [...prev.rightItems],
    }))
    setSelectedItem(null)

    // Fire-and-forget: record the response in the database
    fetch('/api/opinion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId: dailyPuzzle.id,
        sessionId: getSessionId(),
        ranking,
      }),
    })
      .then(res => {
        if (!res.ok) res.json().then(e => console.warn('[top10] opinion submit failed:', e))
      })
      .catch(err => {
      // Server unavailable — submission is still saved locally
    })
  }, [isSubmittable, gameStatus, rightItems, dailyPuzzle.id])

  const resetGame = useCallback(() => {
    localStorage.removeItem(gameKey)
    setGameState({
      leftItems: shuffleArray([...puzzle.items]),
      rightItems: Array(10).fill(null),
      gameStatus: 'playing',
      submittedRanking: null,
    })
    setSelectedItem(null)
  }, [gameKey, puzzle])

  return {
    puzzle,
    leftItems,
    rightItems,
    selectedItem,
    gameStatus,
    submittedRanking,
    isSubmittable,
    handleSelectItem,
    handleSlotClick,
    handleDrop,
    handleSubmit,
    resetGame,
  }
}
