/**
 * Tests for src/utils/index.ts -- toNewMusicInfo and toOldMusicInfo
 *
 * Covers: music info format conversion between old (v0.x) and new (v1.x+) formats.
 * Also covers fixNewMusicInfoQuality for quality type migration.
 */

import {
  toNewMusicInfo,
  toOldMusicInfo,
  fixNewMusicInfoQuality,
} from '@/utils/index'

// ---------------------------------------------------------------------------
// toNewMusicInfo
// ---------------------------------------------------------------------------
describe('toNewMusicInfo', () => {
  it('should convert basic wy source info', () => {
    const oldInfo = {
      name: 'Test Song',
      alias: 'TS',
      singer: 'Test Artist',
      source: 'wy',
      songmid: '12345',
      interval: '03:30',
      albumName: 'Test Album',
      img: 'http://pic.url/cover.jpg',
      types: [{ type: '128k', size: '3MB' }],
      _types: { '128k': { size: '3MB' } },
      albumId: 'album_1',
    }
    const result = toNewMusicInfo(oldInfo)

    expect(result.id).toBe('wy_12345')
    expect(result.name).toBe('Test Song')
    expect(result.singer).toBe('Test Artist')
    expect(result.source).toBe('wy')
    expect(result.meta.songId).toBe('12345')
    expect(result.meta.albumName).toBe('Test Album')
    expect(result.meta.picUrl).toBe('http://pic.url/cover.jpg')
  })

  it('should handle kg source with hash', () => {
    const oldInfo = {
      name: 'KG Song',
      singer: 'KG Artist',
      source: 'kg',
      songmid: '67890',
      hash: 'abcdef',
      interval: '04:00',
      albumName: 'KG Album',
      img: '',
      types: [],
      _types: {},
      albumId: '',
    }
    const result = toNewMusicInfo(oldInfo)

    // kg uses songmid_hash as id
    expect(result.id).toBe('67890_abcdef')
    expect(result.meta.hash).toBe('abcdef')
  })

  it('should handle tx source with strMediaMid', () => {
    const oldInfo = {
      name: 'TX Song',
      singer: 'TX Artist',
      source: 'tx',
      songmid: 'mid_123',
      songId: 999,
      strMediaMid: 'media_mid',
      albumMid: 'album_mid',
      interval: '03:00',
      albumName: 'TX Album',
      img: '',
      types: [],
      _types: {},
      albumId: '',
    }
    const result = toNewMusicInfo(oldInfo)

    expect(result.id).toBe('tx_mid_123')
    expect(result.meta.strMediaMid).toBe('media_mid')
    expect(result.meta.albumMid).toBe('album_mid')
    expect(result.meta.id).toBe(999)
  })

  it('should handle mg source with copyrightId', () => {
    const oldInfo = {
      name: 'MG Song',
      singer: 'MG Artist',
      source: 'mg',
      songmid: 'mg_mid',
      copyrightId: 'copy_1',
      lrcUrl: 'http://lrc.url',
      mrcUrl: 'http://mrc.url',
      trcUrl: 'http://trc.url',
      interval: '03:00',
      albumName: 'MG Album',
      img: '',
      types: [],
      _types: {},
      albumId: '',
    }
    const result = toNewMusicInfo(oldInfo)

    expect(result.meta.copyrightId).toBe('copy_1')
    expect(result.meta.lrcUrl).toBe('http://lrc.url')
  })

  it('should handle local source with filePath', () => {
    const oldInfo = {
      name: 'Local Song',
      singer: 'Local Artist',
      source: 'local',
      songmid: '/path/to/song.mp3',
      interval: '02:30',
      albumName: 'Local Album',
      img: '',
      filePath: '/path/to/song.mp3',
      ext: 'mp3',
    }
    const result = toNewMusicInfo(oldInfo)

    expect(result.id).toBe('local_/path/to/song.mp3')
    expect(result.meta.filePath).toBe('/path/to/song.mp3')
    expect(result.meta.ext).toBe('mp3')
  })

  it('should rename flac32bit quality to hires', () => {
    const oldInfo = {
      name: 'Quality Song',
      singer: 'Artist',
      source: 'wy',
      songmid: 'q1',
      interval: '03:00',
      albumName: 'Album',
      img: '',
      types: [{ type: 'flac32bit', size: '50MB' }],
      _types: { flac32bit: { size: '50MB' } },
      albumId: '',
    }
    const result = toNewMusicInfo(oldInfo)

    expect(result.meta._qualitys.hires).toEqual({ size: '50MB' })
    expect(result.meta._qualitys.flac32bit).toBeUndefined()
    expect(result.meta.qualitys[0].type).toBe('hires')
  })
})

// ---------------------------------------------------------------------------
// toOldMusicInfo
// ---------------------------------------------------------------------------
describe('toOldMusicInfo', () => {
  it('should convert new info back to old format for wy source', () => {
    const newInfo = {
      id: 'wy_12345',
      name: 'Test Song',
      singer: 'Test Artist',
      source: 'wy' as const,
      interval: '03:30',
      meta: {
        songId: '12345',
        albumName: 'Test Album',
        picUrl: 'http://pic.url',
        qualitys: [{ type: '128k', size: '3MB' }],
        _qualitys: { '128k': { size: '3MB' } },
        albumId: 'album_1',
      },
    } as any
    const result = toOldMusicInfo(newInfo)

    expect(result.name).toBe('Test Song')
    expect(result.songmid).toBe('12345')
    expect(result.albumName).toBe('Test Album')
    expect(result.img).toBe('http://pic.url')
    expect(result.source).toBe('wy')
  })

  it('should convert local source correctly', () => {
    const newInfo = {
      id: 'local_/path/song.mp3',
      name: 'Local',
      singer: 'Artist',
      source: 'local' as const,
      interval: '02:00',
      meta: {
        songId: '/path/song.mp3',
        albumName: '',
        filePath: '/path/song.mp3',
        ext: 'mp3',
      },
    } as any
    const result = toOldMusicInfo(newInfo)

    expect(result.filePath).toBe('/path/song.mp3')
    expect(result.ext).toBe('mp3')
    expect(result.types).toEqual([])
    expect(result._types).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// fixNewMusicInfoQuality
// ---------------------------------------------------------------------------
describe('fixNewMusicInfoQuality', () => {
  it('should rename flac32bit to hires', () => {
    const info = {
      source: 'wy',
      meta: {
        qualitys: [{ type: 'flac32bit', size: '50MB' }],
        _qualitys: { flac32bit: { size: '50MB' } },
      },
    } as any
    const result = fixNewMusicInfoQuality(info)

    expect(result.meta._qualitys.hires).toBeDefined()
    expect(result.meta._qualitys.flac32bit).toBeUndefined()
    expect(result.meta.qualitys[0].type).toBe('hires')
  })

  it('should rename flac24bit to hires', () => {
    const info = {
      source: 'wy',
      meta: {
        qualitys: [{ type: 'flac24bit', size: '40MB' }],
        _qualitys: { flac24bit: { size: '40MB' } },
      },
    } as any
    const result = fixNewMusicInfoQuality(info)

    expect(result.meta._qualitys.hires).toBeDefined()
    expect(result.meta._qualitys.flac24bit).toBeUndefined()
  })

  it('should rename effect to atmos', () => {
    const info = {
      source: 'wy',
      meta: {
        qualitys: [{ type: 'effect', size: '60MB' }],
        _qualitys: { effect: { size: '60MB' } },
      },
    } as any
    const result = fixNewMusicInfoQuality(info)

    expect(result.meta._qualitys.atmos).toBeDefined()
    expect(result.meta._qualitys.effect).toBeUndefined()
  })

  it('should not rename flac32bit if hires already exists', () => {
    const info = {
      source: 'wy',
      meta: {
        qualitys: [{ type: 'flac32bit', size: '50MB' }, { type: 'hires', size: '55MB' }],
        _qualitys: { flac32bit: { size: '50MB' }, hires: { size: '55MB' } },
      },
    } as any
    const result = fixNewMusicInfoQuality(info)

    // Both should still exist since hires was already there
    expect(result.meta._qualitys.flac32bit).toBeDefined()
    expect(result.meta._qualitys.hires).toBeDefined()
  })

  it('should return local source info unchanged', () => {
    const info = {
      source: 'local',
      meta: { filePath: '/path/song.mp3', ext: 'mp3' },
    } as any
    const result = fixNewMusicInfoQuality(info)
    expect(result).toBe(info)
  })
})
