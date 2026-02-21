/**
 * Tests for src/core/player/progress.ts
 *
 * Covers: setNowPlayTime, setMaxplayTime, setProgress
 *
 * These are thin wrappers that delegate to playerActions.
 */

import { setNowPlayTime, setMaxplayTime, setProgress } from '@/core/player/progress'
import playerActions from '@/store/player/action'
import playerState from '@/store/player/state'

jest.spyOn(playerActions, 'setNowPlayTime')
jest.spyOn(playerActions, 'setMaxplayTime')
jest.spyOn(playerActions, 'setProgress')

beforeEach(() => {
  playerState.progress = {
    nowPlayTime: 0,
    maxPlayTime: 0,
    progress: 0,
    nowPlayTimeStr: '00:00',
    maxPlayTimeStr: '00:00',
  }
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// setNowPlayTime
// ---------------------------------------------------------------------------
describe('setNowPlayTime', () => {
  it('should delegate to playerActions.setNowPlayTime', () => {
    setNowPlayTime(42)
    expect(playerActions.setNowPlayTime).toHaveBeenCalledWith(42)
  })

  it('should handle 0', () => {
    setNowPlayTime(0)
    expect(playerActions.setNowPlayTime).toHaveBeenCalledWith(0)
  })

  it('should handle large values', () => {
    setNowPlayTime(3600)
    expect(playerActions.setNowPlayTime).toHaveBeenCalledWith(3600)
  })
})

// ---------------------------------------------------------------------------
// setMaxplayTime
// ---------------------------------------------------------------------------
describe('setMaxplayTime', () => {
  it('should delegate to playerActions.setMaxplayTime', () => {
    setMaxplayTime(240)
    expect(playerActions.setMaxplayTime).toHaveBeenCalledWith(240)
  })
})

// ---------------------------------------------------------------------------
// setProgress
// ---------------------------------------------------------------------------
describe('setProgress', () => {
  it('should delegate to playerActions.setProgress with both args', () => {
    setProgress(60, 300)
    expect(playerActions.setProgress).toHaveBeenCalledWith(60, 300)
  })

  it('should handle zero values', () => {
    setProgress(0, 0)
    expect(playerActions.setProgress).toHaveBeenCalledWith(0, 0)
  })
})
