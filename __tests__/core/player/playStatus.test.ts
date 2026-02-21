/**
 * Tests for src/core/player/playStatus.ts
 *
 * Covers: setIsPlay, setStatusText
 *
 * These are thin wrappers around playerActions that add
 * deduplication logic (skip update if value is unchanged).
 */

import { setIsPlay, setStatusText } from '@/core/player/playStatus'
import playerState from '@/store/player/state'
import playerActions from '@/store/player/action'

// Spy on playerActions to verify calls
jest.spyOn(playerActions, 'setIsPlay')
jest.spyOn(playerActions, 'setStatusText')

beforeEach(() => {
  playerState.isPlay = false
  playerState.statusText = ''
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// setIsPlay
// ---------------------------------------------------------------------------
describe('setIsPlay', () => {
  it('should call playerActions.setIsPlay when value changes', () => {
    playerState.isPlay = false
    setIsPlay(true)
    expect(playerActions.setIsPlay).toHaveBeenCalledWith(true)
    expect(playerState.isPlay).toBe(true)
  })

  it('should NOT call playerActions.setIsPlay when value is unchanged', () => {
    playerState.isPlay = true
    setIsPlay(true)
    expect(playerActions.setIsPlay).not.toHaveBeenCalled()
  })

  it('should update from true to false', () => {
    playerState.isPlay = true
    setIsPlay(false)
    expect(playerActions.setIsPlay).toHaveBeenCalledWith(false)
  })
})

// ---------------------------------------------------------------------------
// setStatusText
// ---------------------------------------------------------------------------
describe('setStatusText', () => {
  it('should call playerActions.setStatusText when value changes', () => {
    playerState.statusText = ''
    setStatusText('Loading...')
    expect(playerActions.setStatusText).toHaveBeenCalledWith('Loading...')
    expect(playerState.statusText).toBe('Loading...')
  })

  it('should NOT call playerActions.setStatusText when value is unchanged', () => {
    playerState.statusText = 'Playing'
    setStatusText('Playing')
    expect(playerActions.setStatusText).not.toHaveBeenCalled()
  })

  it('should update from one string to another', () => {
    playerState.statusText = 'Loading...'
    setStatusText('Playing')
    expect(playerActions.setStatusText).toHaveBeenCalledWith('Playing')
  })

  it('should handle empty string transition', () => {
    playerState.statusText = 'Something'
    setStatusText('')
    expect(playerActions.setStatusText).toHaveBeenCalledWith('')
  })
})
