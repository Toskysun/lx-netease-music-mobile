/**
 * Tests for src/store/player/action.ts
 *
 * Tests the player store action methods which directly mutate
 * the player state and emit events.
 */

import playerActions from '@/store/player/action'
import state from '@/store/player/state'

// Reset state before each test
beforeEach(() => {
  state.playInfo = { playIndex: -1, playerListId: null, playerPlayIndex: -1 }
  state.playMusicInfo = { listId: null, musicInfo: null, isTempPlay: false }
  state.musicInfo = {
    id: null, pic: null, lrc: null, tlrc: null, rlrc: null,
    lxlrc: null, rawlrc: null, name: '', alias: '', singer: '', album: '',
  }
  state.isPlay = false
  state.volume = 1
  state.playRate = 1
  state.statusText = ''
  state.loadErrorPicUrl = ''
  state.playedList = []
  state.tempPlayList = []
  state.progress = {
    nowPlayTime: 0, maxPlayTime: 0, progress: 0,
    nowPlayTimeStr: '00:00', maxPlayTimeStr: '00:00',
  }
  state.lastLyric = undefined

  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// updatePlayIndex
// ---------------------------------------------------------------------------
describe('updatePlayIndex', () => {
  it('should update playIndex and playerPlayIndex', () => {
    playerActions.updatePlayIndex(3, 5)
    expect(state.playInfo.playIndex).toBe(3)
    expect(state.playInfo.playerPlayIndex).toBe(5)
  })

  it('should emit playInfoChanged event', () => {
    playerActions.updatePlayIndex(1, 2)
    expect(global.state_event.playInfoChanged).toHaveBeenCalledWith(
      expect.objectContaining({ playIndex: 1, playerPlayIndex: 2 })
    )
  })
})

// ---------------------------------------------------------------------------
// setPlayListId
// ---------------------------------------------------------------------------
describe('setPlayListId', () => {
  it('should update playerListId', () => {
    playerActions.setPlayListId('list_123')
    expect(state.playInfo.playerListId).toBe('list_123')
  })

  it('should accept null', () => {
    playerActions.setPlayListId('something')
    playerActions.setPlayListId(null)
    expect(state.playInfo.playerListId).toBeNull()
  })

  it('should emit playInfoChanged event', () => {
    playerActions.setPlayListId('test')
    expect(global.state_event.playInfoChanged).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// setPlayMusicInfo
// ---------------------------------------------------------------------------
describe('setPlayMusicInfo', () => {
  it('should set play music info with default isTempPlay=false', () => {
    const musicInfo = { id: 'song_1', name: 'Song 1' } as any
    playerActions.setPlayMusicInfo('list_1', musicInfo)
    expect(state.playMusicInfo.listId).toBe('list_1')
    expect(state.playMusicInfo.musicInfo).toBe(musicInfo)
    expect(state.playMusicInfo.isTempPlay).toBe(false)
  })

  it('should set isTempPlay when provided', () => {
    playerActions.setPlayMusicInfo('list_1', { id: 'x' } as any, true)
    expect(state.playMusicInfo.isTempPlay).toBe(true)
  })

  it('should set null values', () => {
    playerActions.setPlayMusicInfo(null, null)
    expect(state.playMusicInfo.listId).toBeNull()
    expect(state.playMusicInfo.musicInfo).toBeNull()
  })

  it('should emit playMusicInfoChanged event', () => {
    playerActions.setPlayMusicInfo('list_1', null)
    expect(global.state_event.playMusicInfoChanged).toHaveBeenCalledWith(state.playMusicInfo)
  })
})

// ---------------------------------------------------------------------------
// setMusicInfo
// ---------------------------------------------------------------------------
describe('setMusicInfo', () => {
  it('should update specific fields only', () => {
    playerActions.setMusicInfo({ name: 'New Song', singer: 'Artist' })
    expect(state.musicInfo.name).toBe('New Song')
    expect(state.musicInfo.singer).toBe('Artist')
    // Other fields should remain unchanged
    expect(state.musicInfo.id).toBeNull()
    expect(state.musicInfo.album).toBe('')
  })

  it('should handle partial updates', () => {
    playerActions.setMusicInfo({ pic: 'http://pic.url' })
    expect(state.musicInfo.pic).toBe('http://pic.url')
    expect(state.musicInfo.name).toBe('')
  })

  it('should emit playerMusicInfoChanged event', () => {
    playerActions.setMusicInfo({ name: 'test' })
    expect(global.state_event.playerMusicInfoChanged).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// setIsPlay
// ---------------------------------------------------------------------------
describe('setIsPlay', () => {
  it('should update isPlay state', () => {
    playerActions.setIsPlay(true)
    expect(state.isPlay).toBe(true)
    playerActions.setIsPlay(false)
    expect(state.isPlay).toBe(false)
  })

  it('should emit playStateChanged event', () => {
    playerActions.setIsPlay(true)
    expect(global.state_event.playStateChanged).toHaveBeenCalledWith(true)
  })
})

// ---------------------------------------------------------------------------
// setStatusText
// ---------------------------------------------------------------------------
describe('setStatusText', () => {
  it('should update status text', () => {
    playerActions.setStatusText('Loading...')
    expect(state.statusText).toBe('Loading...')
  })

  it('should emit playStateTextChanged event', () => {
    playerActions.setStatusText('Playing')
    expect(global.state_event.playStateTextChanged).toHaveBeenCalledWith('Playing')
  })
})

// ---------------------------------------------------------------------------
// Progress actions
// ---------------------------------------------------------------------------
describe('setNowPlayTime', () => {
  it('should update now play time and format string', () => {
    state.progress.maxPlayTime = 300
    playerActions.setNowPlayTime(65)
    expect(state.progress.nowPlayTime).toBe(65)
    expect(state.progress.nowPlayTimeStr).toBe('01:05')
  })

  it('should calculate progress ratio', () => {
    state.progress.maxPlayTime = 200
    playerActions.setNowPlayTime(100)
    expect(state.progress.progress).toBe(0.5)
  })

  it('should set progress to 0 when maxPlayTime is 0', () => {
    state.progress.maxPlayTime = 0
    playerActions.setNowPlayTime(50)
    expect(state.progress.progress).toBe(0)
  })
})

describe('setMaxplayTime', () => {
  it('should update max play time and format string', () => {
    playerActions.setMaxplayTime(300)
    expect(state.progress.maxPlayTime).toBe(300)
    expect(state.progress.maxPlayTimeStr).toBe('05:00')
  })

  it('should calculate progress ratio based on current time', () => {
    state.progress.nowPlayTime = 60
    playerActions.setMaxplayTime(120)
    expect(state.progress.progress).toBe(0.5)
  })
})

describe('setProgress', () => {
  it('should update both current and total time', () => {
    playerActions.setProgress(30, 120)
    expect(state.progress.nowPlayTime).toBe(30)
    expect(state.progress.maxPlayTime).toBe(120)
    expect(state.progress.nowPlayTimeStr).toBe('00:30')
    expect(state.progress.maxPlayTimeStr).toBe('02:00')
  })

  it('should emit playProgressChanged event', () => {
    playerActions.setProgress(10, 100)
    expect(global.state_event.playProgressChanged).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// PlayedList actions
// ---------------------------------------------------------------------------
describe('addPlayedList', () => {
  const createPlayMusicInfo = (id: string) => ({
    musicInfo: { id, name: `Song ${id}` },
    listId: 'default',
    isTempPlay: false,
  }) as any

  it('should add item to played list', () => {
    playerActions.addPlayedList(createPlayMusicInfo('1'))
    expect(state.playedList).toHaveLength(1)
    expect(state.playedList[0].musicInfo.id).toBe('1')
  })

  it('should not add duplicate items', () => {
    playerActions.addPlayedList(createPlayMusicInfo('1'))
    playerActions.addPlayedList(createPlayMusicInfo('1'))
    expect(state.playedList).toHaveLength(1)
  })

  it('should add different items', () => {
    playerActions.addPlayedList(createPlayMusicInfo('1'))
    playerActions.addPlayedList(createPlayMusicInfo('2'))
    expect(state.playedList).toHaveLength(2)
  })
})

describe('removePlayedList', () => {
  it('should remove item at specified index', () => {
    state.playedList = [
      { musicInfo: { id: '1' }, listId: 'default', isTempPlay: false },
      { musicInfo: { id: '2' }, listId: 'default', isTempPlay: false },
      { musicInfo: { id: '3' }, listId: 'default', isTempPlay: false },
    ] as any
    playerActions.removePlayedList(1)
    expect(state.playedList).toHaveLength(2)
    expect(state.playedList.map((m: any) => m.musicInfo.id)).toEqual(['1', '3'])
  })
})

describe('clearPlayedList', () => {
  it('should clear the played list', () => {
    state.playedList = [
      { musicInfo: { id: '1' }, listId: 'default', isTempPlay: false },
    ] as any
    playerActions.clearPlayedList()
    expect(state.playedList).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// TempPlayList actions
// ---------------------------------------------------------------------------
describe('addTempPlayList', () => {
  it('should add bottom items to the end', () => {
    const items = [
      { musicInfo: { id: '1' } as any, listId: 'default' },
      { musicInfo: { id: '2' } as any, listId: 'default' },
    ]
    playerActions.addTempPlayList(items)
    expect(state.tempPlayList).toHaveLength(2)
    expect(state.tempPlayList[0].musicInfo.id).toBe('1')
    expect(state.tempPlayList[1].musicInfo.id).toBe('2')
  })

  it('should add isTop items to the beginning', () => {
    state.tempPlayList = [
      { musicInfo: { id: 'existing' } as any, listId: 'default', isTempPlay: true },
    ]
    const items = [
      { musicInfo: { id: 'top1' } as any, listId: 'default', isTop: true },
    ]
    playerActions.addTempPlayList(items)
    expect(state.tempPlayList[0].musicInfo.id).toBe('top1')
    expect(state.tempPlayList[1].musicInfo.id).toBe('existing')
  })

  it('should set isTempPlay to true for all added items', () => {
    playerActions.addTempPlayList([
      { musicInfo: { id: '1' } as any, listId: 'default' },
    ])
    expect(state.tempPlayList[0].isTempPlay).toBe(true)
  })
})

describe('removeTempPlayList', () => {
  it('should remove item at specified index', () => {
    state.tempPlayList = [
      { musicInfo: { id: '1' } as any, listId: 'default', isTempPlay: true },
      { musicInfo: { id: '2' } as any, listId: 'default', isTempPlay: true },
    ]
    playerActions.removeTempPlayList(0)
    expect(state.tempPlayList).toHaveLength(1)
    expect(state.tempPlayList[0].musicInfo.id).toBe('2')
  })
})

describe('clearTempPlayeList', () => {
  it('should clear the temp play list', () => {
    state.tempPlayList = [
      { musicInfo: { id: '1' } as any, listId: 'default', isTempPlay: true },
    ]
    playerActions.clearTempPlayeList()
    expect(state.tempPlayList).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Misc actions
// ---------------------------------------------------------------------------
describe('setLoadErrorPicUrl', () => {
  it('should update loadErrorPicUrl', () => {
    playerActions.setLoadErrorPicUrl('http://error.pic')
    expect(state.loadErrorPicUrl).toBe('http://error.pic')
  })
})

describe('setLastLyric', () => {
  it('should update lastLyric', () => {
    playerActions.setLastLyric('some lyric line')
    expect(state.lastLyric).toBe('some lyric line')
  })

  it('should accept undefined', () => {
    playerActions.setLastLyric('something')
    playerActions.setLastLyric(undefined)
    expect(state.lastLyric).toBeUndefined()
  })
})
