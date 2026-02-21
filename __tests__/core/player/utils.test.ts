/**
 * Tests for src/core/player/utils.ts
 *
 * Covers: filterMusicList -- the core list filtering logic used
 * by playNext/playPrev to determine which songs can be played.
 */

import { filterMusicList } from '@/core/player/utils'
import { SPLIT_CHAR } from '@/config/constant'

// Helper to create a mock MusicInfo object
const createMusicInfo = (id: string, name: string = `Song ${id}`, singer: string = 'Artist') => ({
  id,
  name,
  singer,
  source: 'wy' as const,
  interval: '03:00',
  meta: {
    songId: id,
    albumName: 'Album',
    qualitys: [],
    _qualitys: {},
  },
}) as any as LX.Music.MusicInfo

// Helper to create a mock PlayMusicInfo object
const createPlayMusicInfo = (id: string, listId: string = 'default', isTempPlay = false) => ({
  musicInfo: createMusicInfo(id),
  listId,
  isTempPlay,
}) as LX.Player.PlayMusicInfo

// Empty dislike info
const emptyDislikeInfo = {
  names: new Set<string>(),
  musicNames: new Set<string>(),
  singerNames: new Set<string>(),
}

// ---------------------------------------------------------------------------
// Basic filtering
// ---------------------------------------------------------------------------
describe('filterMusicList', () => {
  describe('basic filtering', () => {
    it('should return all songs when no songs have been played', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2'), createMusicInfo('3')]
      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(3)
      expect(result.canPlayList).toHaveLength(3)
    })

    it('should filter out played songs from the same list', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2'), createMusicInfo('3')]
      const playedList = [createPlayMusicInfo('1', 'default'), createPlayMusicInfo('2', 'default')]

      const result = filterMusicList({
        playedList,
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(1)
      expect(result.filteredList[0].id).toBe('3')
    })

    it('should not filter songs played from a different list', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2')]
      const playedList = [createPlayMusicInfo('1', 'other_list')]

      const result = filterMusicList({
        playedList,
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(2)
    })

    it('should not filter temp play songs', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2')]
      const playedList = [createPlayMusicInfo('1', 'default', true)]

      const result = filterMusicList({
        playedList,
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      // isTempPlay = true should be filtered out during the played list processing
      expect(result.filteredList).toHaveLength(2)
    })

    it('should return empty filteredList when all songs played', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2')]
      const playedList = [
        createPlayMusicInfo('1', 'default'),
        createPlayMusicInfo('2', 'default'),
      ]

      const result = filterMusicList({
        playedList,
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(0)
      // canPlayList should still contain all songs
      expect(result.canPlayList).toHaveLength(2)
    })
  })

  // ---------------------------------------------------------------------------
  // playerMusicInfo index tracking
  // ---------------------------------------------------------------------------
  describe('playerIndex tracking', () => {
    it('should find the current player music info index in filtered list', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2'), createMusicInfo('3')]
      const playerMusicInfo = list[1]

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        playerMusicInfo,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.playerIndex).toBe(1)
    })

    it('should return -1 when playerMusicInfo is not provided', () => {
      const list = [createMusicInfo('1')]
      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.playerIndex).toBe(-1)
    })

    it('should return -1 when playerMusicInfo is not in list', () => {
      const list = [createMusicInfo('1'), createMusicInfo('2')]
      const playerMusicInfo = createMusicInfo('not_in_list')

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        playerMusicInfo,
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.playerIndex).toBe(-1)
    })
  })

  // ---------------------------------------------------------------------------
  // Dislike filtering
  // ---------------------------------------------------------------------------
  describe('dislike filtering', () => {
    it('should filter out songs by musicName', () => {
      const list = [
        createMusicInfo('1', 'bad song', 'Good Artist'),
        createMusicInfo('2', 'good song', 'Good Artist'),
      ]

      const dislikeInfo = {
        names: new Set<string>(),
        musicNames: new Set<string>(['bad song']),
        singerNames: new Set<string>(),
      }

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        dislikeInfo,
        isNext: true,
      })
      // 'bad song' should be excluded from canPlayList
      expect(result.canPlayList).toHaveLength(1)
      expect(result.canPlayList[0].id).toBe('2')
    })

    it('should filter out songs by singerName', () => {
      const list = [
        createMusicInfo('1', 'Song A', 'Bad Singer'),
        createMusicInfo('2', 'Song B', 'Good Singer'),
      ]

      const dislikeInfo = {
        names: new Set<string>(),
        musicNames: new Set<string>(),
        singerNames: new Set<string>(['bad singer']),
      }

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        dislikeInfo,
        isNext: true,
      })
      expect(result.canPlayList).toHaveLength(1)
    })

    it('should filter by full name+singer combo', () => {
      const list = [
        createMusicInfo('1', 'Love Song', 'Bad Singer'),
        createMusicInfo('2', 'Love Song', 'Good Singer'),
      ]

      const nameKey = `love song${SPLIT_CHAR.DISLIKE_NAME}bad singer`
      const dislikeInfo = {
        names: new Set<string>([nameKey]),
        musicNames: new Set<string>(),
        singerNames: new Set<string>(),
      }

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        dislikeInfo,
        isNext: true,
      })
      expect(result.canPlayList).toHaveLength(1)
      expect(result.canPlayList[0].id).toBe('2')
    })

    it('should keep disliked song if it is the current playerMusicInfo', () => {
      const list = [
        createMusicInfo('1', 'Disliked Song', 'Artist'),
        createMusicInfo('2', 'Normal Song', 'Artist'),
      ]

      const dislikeInfo = {
        names: new Set<string>(),
        musicNames: new Set<string>(['disliked song']),
        singerNames: new Set<string>(),
      }

      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        playerMusicInfo: list[0], // currently playing the disliked song
        dislikeInfo,
        isNext: true,
      })
      // The disliked song should still appear in canPlayList since it is currently playing
      expect(result.canPlayList).toHaveLength(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Download items filtering
  // ---------------------------------------------------------------------------
  describe('download items', () => {
    it('should filter out incomplete download items', () => {
      const downloadItem = {
        id: 'd1',
        name: 'Download Song',
        singer: 'Artist',
        source: 'wy' as const,
        interval: '03:00',
        progress: 50,
        isComplate: false,
        metadata: {
          musicInfo: createMusicInfo('d1'),
        },
        meta: { songId: 'd1', albumName: '' },
      } as any

      const result = filterMusicList({
        playedList: [],
        listId: 'download',
        list: [downloadItem],
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(0)
      expect(result.canPlayList).toHaveLength(0)
    })

    it('should include complete download items', () => {
      const downloadItem = {
        id: 'd1',
        name: 'Download Song',
        singer: 'Artist',
        source: 'wy' as const,
        interval: '03:00',
        progress: 100,
        isComplate: true,
        metadata: {
          musicInfo: createMusicInfo('d1'),
        },
        meta: { songId: 'd1', albumName: '' },
      } as any

      const result = filterMusicList({
        playedList: [],
        listId: 'download',
        list: [downloadItem],
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(1)
      expect(result.canPlayList).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle empty list', () => {
      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list: [],
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(0)
      expect(result.canPlayList).toHaveLength(0)
      expect(result.playerIndex).toBe(-1)
    })

    it('should handle single-song list', () => {
      const list = [createMusicInfo('1')]
      const result = filterMusicList({
        playedList: [],
        listId: 'default',
        list,
        playerMusicInfo: list[0],
        dislikeInfo: emptyDislikeInfo,
        isNext: true,
      })
      expect(result.filteredList).toHaveLength(1)
      expect(result.playerIndex).toBe(0)
    })
  })
})
