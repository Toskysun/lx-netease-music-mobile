/**
 * Tests for src/core/player/timeoutExit.ts
 *
 * Covers: startTimeoutExit, stopTimeoutExit, getTimeoutExitTime,
 *         cancelTimeoutExit, onTimeUpdate
 *
 * This module manages the "timeout exit" feature, which automatically
 * exits the app or stops playback after a configured time period.
 */

// Mock dependencies before importing the module under test
jest.mock('@/store/setting/state', () => ({
  default: {
    setting: {
      'player.timeoutExitPlayed': false,
    },
  },
}))

import {
  startTimeoutExit,
  stopTimeoutExit,
  getTimeoutExitTime,
  cancelTimeoutExit,
  onTimeUpdate,
} from '@/core/player/timeoutExit'
import settingState from '@/store/setting/state'
import playerState from '@/store/player/state'

beforeEach(() => {
  jest.useFakeTimers()
  stopTimeoutExit() // clean up any running timers
  global.lx.isPlayedStop = false
  playerState.isPlay = false
  settingState.setting['player.timeoutExitPlayed'] = false
  jest.clearAllMocks()
})

afterEach(() => {
  stopTimeoutExit()
  jest.useRealTimers()
})

// ---------------------------------------------------------------------------
// getTimeoutExitTime
// ---------------------------------------------------------------------------
describe('getTimeoutExitTime', () => {
  it('should return -1 when no timeout is active', () => {
    expect(getTimeoutExitTime()).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// startTimeoutExit / stopTimeoutExit
// ---------------------------------------------------------------------------
describe('startTimeoutExit', () => {
  it('should set a positive time value', () => {
    startTimeoutExit(300)
    // getTimeoutExitTime internally checks elapsed time.
    // Right after start (no time elapsed), it should return ~300.
    const time = getTimeoutExitTime()
    expect(time).toBeGreaterThanOrEqual(299)
    expect(time).toBeLessThanOrEqual(300)
  })

  it('should call time hooks with the current time', () => {
    const hook = jest.fn()
    onTimeUpdate(hook)

    // The hook is called once during addTimeHook with current state
    expect(hook).toHaveBeenCalledWith(-1, false)

    hook.mockClear()
    startTimeoutExit(60)

    // After start, the 1-second interval should fire hooks
    jest.advanceTimersByTime(1000)
    expect(hook).toHaveBeenCalled()
  })
})

describe('stopTimeoutExit', () => {
  it('should reset time to -1', () => {
    startTimeoutExit(120)
    stopTimeoutExit()
    expect(getTimeoutExitTime()).toBe(-1)
  })

  it('should call hooks with -1 when stopped', () => {
    const hook = jest.fn()
    startTimeoutExit(60)
    onTimeUpdate(hook)
    hook.mockClear()

    stopTimeoutExit()
    expect(hook).toHaveBeenCalledWith(-1, false)
  })
})

// ---------------------------------------------------------------------------
// onTimeUpdate
// ---------------------------------------------------------------------------
describe('onTimeUpdate', () => {
  it('should register a hook and call it immediately with current state', () => {
    const hook = jest.fn()
    onTimeUpdate(hook)
    expect(hook).toHaveBeenCalledTimes(1)
    expect(hook).toHaveBeenCalledWith(-1, false)
  })

  it('should return an unsubscribe function', () => {
    const hook = jest.fn()
    const unsubscribe = onTimeUpdate(hook)
    hook.mockClear()

    unsubscribe()

    // After unsubscribing, starting a timeout should NOT call the hook
    startTimeoutExit(60)
    jest.advanceTimersByTime(1000)
    expect(hook).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// cancelTimeoutExit
// ---------------------------------------------------------------------------
describe('cancelTimeoutExit', () => {
  it('should reset isPlayedStop to false', () => {
    global.lx.isPlayedStop = true
    cancelTimeoutExit()
    expect(global.lx.isPlayedStop).toBe(false)
  })

  it('should call all hooks with isPlayedStop=false', () => {
    global.lx.isPlayedStop = true
    const hook = jest.fn()
    onTimeUpdate(hook)
    hook.mockClear()

    cancelTimeoutExit()
    expect(hook).toHaveBeenCalledWith(expect.any(Number), false)
  })
})

// ---------------------------------------------------------------------------
// Exit behavior (timeout fires)
// ---------------------------------------------------------------------------
describe('timeout expiration', () => {
  it('should call exitApp when timeoutExitPlayed is false', () => {
    const exitApp = require('@/core/common').exitApp
    exitApp.mockClear()

    settingState.setting['player.timeoutExitPlayed'] = false
    startTimeoutExit(1) // 1 second timeout

    jest.advanceTimersByTime(1500)
    expect(exitApp).toHaveBeenCalledWith('Timeout Exit')
  })

  it('should set isPlayedStop instead of exiting when timeoutExitPlayed is true and playing', () => {
    const exitApp = require('@/core/common').exitApp
    exitApp.mockClear()

    settingState.setting['player.timeoutExitPlayed'] = true
    playerState.isPlay = true
    startTimeoutExit(1)

    jest.advanceTimersByTime(1500)
    expect(exitApp).not.toHaveBeenCalled()
    expect(global.lx.isPlayedStop).toBe(true)
  })

  it('should call exitApp when timeoutExitPlayed is true but not playing', () => {
    const exitApp = require('@/core/common').exitApp
    exitApp.mockClear()

    settingState.setting['player.timeoutExitPlayed'] = true
    playerState.isPlay = false
    startTimeoutExit(1)

    jest.advanceTimersByTime(1500)
    expect(exitApp).toHaveBeenCalledWith('Timeout Exit')
  })
})
