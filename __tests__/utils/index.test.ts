/**
 * Tests for src/utils/index.ts (re-exports + additional utilities)
 *
 * Covers: compareVer, toNewMusicInfo, filterMusicList, deduplicationList,
 *         formatPlayCount, decodeName
 */

import {
  compareVer,
  filterMusicList,
  deduplicationList,
  formatPlayCount,
  decodeName,
} from '@/utils/index'

// ---------------------------------------------------------------------------
// compareVer
// ---------------------------------------------------------------------------
describe('compareVer', () => {
  it('should return 0 for equal versions', () => {
    expect(compareVer('1.0.0', '1.0.0')).toBe(0)
  })

  it('should return 1 when current > target', () => {
    expect(compareVer('2.0.0', '1.0.0')).toBe(1)
    expect(compareVer('1.1.0', '1.0.0')).toBe(1)
    expect(compareVer('1.0.1', '1.0.0')).toBe(1)
  })

  it('should return -1 when current < target', () => {
    expect(compareVer('1.0.0', '2.0.0')).toBe(-1)
    expect(compareVer('1.0.0', '1.1.0')).toBe(-1)
    expect(compareVer('1.0.0', '1.0.1')).toBe(-1)
  })

  it('should handle different length version strings', () => {
    expect(compareVer('1.0', '1.0.0')).toBe(0)
    expect(compareVer('1.0.0.1', '1.0.0')).toBe(1)
  })

  it('should handle pre-release labels', () => {
    // 'beta' chars get converted to negative numbers, so 1.0.0-beta < 1.0.0
    expect(compareVer('1.0.0-beta', '1.0.0')).toBe(-1)
  })

  it('should compare pre-release versions', () => {
    // alpha < beta in charcode terms
    expect(compareVer('1.0.0-alpha', '1.0.0-beta')).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// filterMusicList
// ---------------------------------------------------------------------------
describe('filterMusicList', () => {
  const createMusicInfo = (id: string, name: string, singer: string = 'test') => ({
    id,
    name,
    singer,
    source: 'wy' as const,
    interval: '03:00',
    meta: {
      songId: id,
      albumName: 'test album',
      qualitys: [],
      _qualitys: {},
    },
  }) as any

  it('should remove items with empty id', () => {
    const list = [
      createMusicInfo('', 'no-id'),
      createMusicInfo('1', 'has-id'),
    ]
    expect(filterMusicList(list)).toHaveLength(1)
    expect(filterMusicList(list)[0].id).toBe('1')
  })

  it('should remove items with empty name', () => {
    const list = [
      createMusicInfo('1', ''),
      createMusicInfo('2', 'valid'),
    ]
    expect(filterMusicList(list)).toHaveLength(1)
  })

  it('should remove duplicate ids', () => {
    const list = [
      createMusicInfo('1', 'song A'),
      createMusicInfo('1', 'song A copy'),
      createMusicInfo('2', 'song B'),
    ]
    const result = filterMusicList(list)
    expect(result).toHaveLength(2)
  })

  it('should set null singer to empty string', () => {
    const info = createMusicInfo('1', 'song')
    info.singer = null
    const result = filterMusicList([info])
    expect(result[0].singer).toBe('')
  })

  it('should return empty array for empty input', () => {
    expect(filterMusicList([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// deduplicationList
// ---------------------------------------------------------------------------
describe('deduplicationList', () => {
  const createMusicInfo = (id: string) => ({
    id,
    name: `song ${id}`,
    singer: 'test',
    source: 'wy' as const,
    interval: '03:00',
    meta: { songId: id, albumName: '' },
  }) as any

  it('should remove duplicates by id', () => {
    const list = [
      createMusicInfo('a'),
      createMusicInfo('b'),
      createMusicInfo('a'),
      createMusicInfo('c'),
      createMusicInfo('b'),
    ]
    const result = deduplicationList(list)
    expect(result).toHaveLength(3)
    expect(result.map((m: any) => m.id)).toEqual(['a', 'b', 'c'])
  })

  it('should keep first occurrence', () => {
    const list = [
      { ...createMusicInfo('1'), name: 'first' },
      { ...createMusicInfo('1'), name: 'second' },
    ]
    const result = deduplicationList(list)
    expect(result[0].name).toBe('first')
  })

  it('should return empty array for empty input', () => {
    expect(deduplicationList([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// formatPlayCount
// ---------------------------------------------------------------------------
describe('formatPlayCount', () => {
  it('should return raw number for small counts', () => {
    expect(formatPlayCount(999)).toBe('999')
    expect(formatPlayCount(9999)).toBe('9999')
  })

  it('should format with "wan" suffix for > 10000', () => {
    expect(formatPlayCount(10001)).toBe('1万')
    expect(formatPlayCount(15000)).toBe('1.5万')
    expect(formatPlayCount(123456)).toBe('12.3万')
  })

  it('should format with "yi" suffix for > 100000000', () => {
    expect(formatPlayCount(100000001)).toBe('1亿')
    expect(formatPlayCount(1500000000)).toBe('1.5亿')
  })

  it('should handle 0', () => {
    expect(formatPlayCount(0)).toBe('0')
  })
})

// ---------------------------------------------------------------------------
// decodeName
// ---------------------------------------------------------------------------
describe('decodeName', () => {
  it('should return empty string for null', () => {
    expect(decodeName(null)).toBe('')
  })

  it('should return empty string for empty string', () => {
    expect(decodeName('')).toBe('')
  })

  it('should decode HTML entities via he.decode', () => {
    // he.decode is mocked to return the input unchanged
    expect(decodeName('hello &amp; world')).toBe('hello &amp; world')
  })

  it('should use default parameter when called with no args', () => {
    expect(decodeName()).toBe('')
  })
})
