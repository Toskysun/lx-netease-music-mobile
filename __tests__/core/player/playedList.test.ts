/**
 * Tests for src/core/player/playedList.ts
 *
 * Covers: addPlayedList, removePlayedList, clearPlayedList
 *
 * These are thin wrappers that delegate to playerActions.
 * Tests verify the delegation is correct.
 */

import { addPlayedList, removePlayedList, clearPlayedList } from '@/core/player/playedList'
import playerActions from '@/store/player/action'
import playerState from '@/store/player/state'

jest.spyOn(playerActions, 'addPlayedList')
jest.spyOn(playerActions, 'removePlayedList')
jest.spyOn(playerActions, 'clearPlayedList')

beforeEach(() => {
  playerState.playedList = []
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// addPlayedList
// ---------------------------------------------------------------------------
describe('addPlayedList', () => {
  it('should delegate to playerActions.addPlayedList', () => {
    const playMusicInfo = {
      musicInfo: { id: 'song_1', name: 'Song 1' },
      listId: 'default',
      isTempPlay: false,
    } as any
    addPlayedList(playMusicInfo)
    expect(playerActions.addPlayedList).toHaveBeenCalledWith(playMusicInfo)
  })

  it('should pass through isTempPlay flag', () => {
    const info = {
      musicInfo: { id: 'song_2', name: 'Song 2' },
      listId: 'default',
      isTempPlay: true,
    } as any
    addPlayedList(info)
    expect(playerActions.addPlayedList).toHaveBeenCalledWith(
      expect.objectContaining({ isTempPlay: true })
    )
  })
})

// ---------------------------------------------------------------------------
// removePlayedList
// ---------------------------------------------------------------------------
describe('removePlayedList', () => {
  it('should delegate to playerActions.removePlayedList with index', () => {
    removePlayedList(2)
    expect(playerActions.removePlayedList).toHaveBeenCalledWith(2)
  })

  it('should handle index 0', () => {
    removePlayedList(0)
    expect(playerActions.removePlayedList).toHaveBeenCalledWith(0)
  })
})

// ---------------------------------------------------------------------------
// clearPlayedList
// ---------------------------------------------------------------------------
describe('clearPlayedList', () => {
  it('should delegate to playerActions.clearPlayedList', () => {
    clearPlayedList()
    expect(playerActions.clearPlayedList).toHaveBeenCalled()
  })
})
