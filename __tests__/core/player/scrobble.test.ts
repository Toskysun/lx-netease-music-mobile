/**
 * Tests for src/core/player/scrobble.ts
 *
 * Covers: scrobbleLastSong, updateScrobbleInfo, updateScrobblePlayTime,
 *         updateScrobbleTotalTime
 */

// We need to set up the store state mocks before importing the module
import playerState from '@/store/player/state'
import listState from '@/store/list/state'

// Reset state before each test
beforeEach(() => {
  playerState.playMusicInfo = { listId: null, musicInfo: null, isTempPlay: false }
  playerState.isPlay = false

  // Reset list state
  if (!listState.tempListMeta) {
    listState.tempListMeta = { id: '' }
  }
  if (!listState.userList) {
    listState.userList = []
  }

  jest.clearAllMocks()
})

// Import after mocks are set up
import {
  scrobbleLastSong,
  updateScrobbleInfo,
  updateScrobblePlayTime,
  updateScrobbleTotalTime,
  scrobbleInfo,
} from '@/core/player/scrobble'

// We need mutable access to scrobbleInfo for testing
import * as scrobbleModule from '@/core/player/scrobble'

// ---------------------------------------------------------------------------
// updateScrobbleInfo
// ---------------------------------------------------------------------------
describe('updateScrobbleInfo', () => {
  it('should set scrobbleInfo to null when no music is playing', () => {
    playerState.playMusicInfo.musicInfo = null
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo).toBeNull()
  })

  it('should set scrobbleInfo to null for non-wy source', () => {
    playerState.playMusicInfo.musicInfo = {
      id: 'kg_123',
      name: 'Test',
      singer: 'Test',
      source: 'kg',
      interval: '03:00',
      meta: { songId: '123', albumName: 'A', hash: 'h', qualitys: [], _qualitys: {} },
    } as any
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo).toBeNull()
  })

  it('should create scrobbleInfo for wy source songs', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_456',
        name: 'Test Song',
        singer: 'Test Singer',
        source: 'wy',
        interval: '04:00',
        meta: { songId: '456', albumName: 'Album', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo).not.toBeNull()
    expect(scrobbleModule.scrobbleInfo!.songId).toBe('456')
    expect(scrobbleModule.scrobbleInfo!.accumulatedPlayedTime).toBe(0)
    expect(scrobbleModule.scrobbleInfo!.totalTime).toBe(0)
  })

  it('should extract sourceId from album_ prefix list', () => {
    playerState.playMusicInfo = {
      listId: 'album_789',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo!.sourceId).toBe('789')
  })

  it('should extract sourceId from wy__ prefix list', () => {
    playerState.playMusicInfo = {
      listId: 'wy__12345',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo!.sourceId).toBe('12345')
  })

  it('should set empty sourceId for default list', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    expect(scrobbleModule.scrobbleInfo!.sourceId).toBe('')
  })
})

// ---------------------------------------------------------------------------
// updateScrobblePlayTime
// ---------------------------------------------------------------------------
describe('updateScrobblePlayTime', () => {
  beforeEach(() => {
    // Set up a valid scrobble info state
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    playerState.isPlay = true
    updateScrobbleInfo()
  })

  it('should not update when scrobbleInfo is null', () => {
    // Force null
    (scrobbleModule as any).scrobbleInfo = null
    // Should not throw
    updateScrobblePlayTime(1)
  })

  it('should not accumulate time when not playing', () => {
    playerState.isPlay = false
    scrobbleModule.scrobbleInfo!.lastReportedTime = 0
    updateScrobblePlayTime(1)
    expect(scrobbleModule.scrobbleInfo!.accumulatedPlayedTime).toBe(0)
  })

  it('should accumulate time for continuous playback (delta < 2s)', () => {
    scrobbleModule.scrobbleInfo!.lastReportedTime = 10
    updateScrobblePlayTime(11)
    expect(scrobbleModule.scrobbleInfo!.accumulatedPlayedTime).toBe(1)
    expect(scrobbleModule.scrobbleInfo!.lastReportedTime).toBe(11)
  })

  it('should not accumulate time for large jumps (delta >= 2s)', () => {
    scrobbleModule.scrobbleInfo!.lastReportedTime = 10
    updateScrobblePlayTime(15) // delta = 5, > 2
    expect(scrobbleModule.scrobbleInfo!.accumulatedPlayedTime).toBe(0)
    // lastReportedTime should still be updated
    expect(scrobbleModule.scrobbleInfo!.lastReportedTime).toBe(15)
  })

  it('should not accumulate negative time deltas', () => {
    scrobbleModule.scrobbleInfo!.lastReportedTime = 10
    updateScrobblePlayTime(8) // delta = -2, negative
    expect(scrobbleModule.scrobbleInfo!.accumulatedPlayedTime).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// updateScrobbleTotalTime
// ---------------------------------------------------------------------------
describe('updateScrobbleTotalTime', () => {
  it('should update totalTime when scrobbleInfo exists', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    updateScrobbleTotalTime(240)
    expect(scrobbleModule.scrobbleInfo!.totalTime).toBe(240)
  })

  it('should do nothing when scrobbleInfo is null', () => {
    (scrobbleModule as any).scrobbleInfo = null
    // Should not throw
    updateScrobbleTotalTime(100)
  })
})

// ---------------------------------------------------------------------------
// scrobbleLastSong
// ---------------------------------------------------------------------------
describe('scrobbleLastSong', () => {
  const wyApi = require('@/utils/musicSdk/wy/user').default

  beforeEach(() => {
    wyApi.scrobble.mockClear()
  })

  it('should not scrobble when scrobbleInfo is null', () => {
    (scrobbleModule as any).scrobbleInfo = null
    scrobbleLastSong()
    expect(wyApi.scrobble).not.toHaveBeenCalled()
  })

  it('should not scrobble when played time is less than 1 second', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    scrobbleModule.scrobbleInfo!.accumulatedPlayedTime = 0.5
    scrobbleModule.scrobbleInfo!.totalTime = 200

    scrobbleLastSong()
    expect(wyApi.scrobble).not.toHaveBeenCalled()
  })

  it('should not scrobble when played < 120s and < 50% of total', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    scrobbleModule.scrobbleInfo!.accumulatedPlayedTime = 50 // 50 seconds
    scrobbleModule.scrobbleInfo!.totalTime = 300 // 5 min song, 50/300 = 16.7%

    scrobbleLastSong()
    expect(wyApi.scrobble).not.toHaveBeenCalled()
  })

  it('should scrobble when played >= 120s', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    scrobbleModule.scrobbleInfo!.songId = '999'
    scrobbleModule.scrobbleInfo!.sourceId = 'src1'
    scrobbleModule.scrobbleInfo!.accumulatedPlayedTime = 130
    scrobbleModule.scrobbleInfo!.totalTime = 300

    scrobbleLastSong()
    expect(wyApi.scrobble).toHaveBeenCalledWith('999', 'src1', 130)
  })

  it('should scrobble when played >= 50% of total even if < 120s', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    scrobbleModule.scrobbleInfo!.songId = '888'
    scrobbleModule.scrobbleInfo!.sourceId = ''
    scrobbleModule.scrobbleInfo!.accumulatedPlayedTime = 60
    scrobbleModule.scrobbleInfo!.totalTime = 100 // 60/100 = 60% > 50%

    scrobbleLastSong()
    expect(wyApi.scrobble).toHaveBeenCalledWith('888', '', 60)
  })

  it('should reset scrobbleInfo to null after scrobbling', () => {
    playerState.playMusicInfo = {
      listId: 'default',
      musicInfo: {
        id: 'wy_1',
        source: 'wy',
        meta: { songId: '1', albumName: 'A', qualitys: [], _qualitys: {} },
      } as any,
      isTempPlay: false,
    }
    updateScrobbleInfo()
    scrobbleModule.scrobbleInfo!.accumulatedPlayedTime = 200
    scrobbleModule.scrobbleInfo!.totalTime = 300

    scrobbleLastSong()
    expect(scrobbleModule.scrobbleInfo).toBeNull()
  })
})
