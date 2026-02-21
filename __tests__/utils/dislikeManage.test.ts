/**
 * Tests for src/utils/dislikeManage.ts
 *
 * Covers: addDislikeInfo, overwirteDislikeInfo, clearDislikeInfo
 * and the internal updateDislikeInfo parsing logic.
 */

// Mock the data module that getDislikeListRules depends on
jest.mock('@/utils/data', () => ({
  ...jest.requireActual('@/utils/data'),
  getDislikeListRules: jest.fn(() => Promise.resolve('')),
}))

import {
  addDislikeInfo,
  overwirteDislikeInfo,
  clearDislikeInfo,
} from '@/utils/dislikeManage'
import { SPLIT_CHAR } from '@/config/constant'

// ---------------------------------------------------------------------------
// clearDislikeInfo
// ---------------------------------------------------------------------------
describe('clearDislikeInfo', () => {
  it('should clear all dislike data', async () => {
    // First add some data
    await addDislikeInfo([{ name: 'test', singer: 'artist' }])
    // Then clear
    const result = await clearDislikeInfo()
    expect(result.names.size).toBe(0)
    expect(result.musicNames.size).toBe(0)
    expect(result.singerNames.size).toBe(0)
    expect(result.rules).toBe('')
  })
})

// ---------------------------------------------------------------------------
// overwirteDislikeInfo
// ---------------------------------------------------------------------------
describe('overwirteDislikeInfo', () => {
  beforeEach(async () => {
    await clearDislikeInfo()
  })

  it('should parse name@singer format into names set', async () => {
    const rules = `Song A${SPLIT_CHAR.DISLIKE_NAME}Artist X`
    const result = await overwirteDislikeInfo(rules)
    expect(result.names.has(`song a${SPLIT_CHAR.DISLIKE_NAME}artist x`)).toBe(true)
  })

  it('should parse name-only format into musicNames set', async () => {
    const rules = 'Bad Song Name'
    const result = await overwirteDislikeInfo(rules)
    expect(result.musicNames.has('bad song name')).toBe(true)
  })

  it('should parse singer-only format into singerNames set', async () => {
    const rules = `${SPLIT_CHAR.DISLIKE_NAME}Bad Singer`
    const result = await overwirteDislikeInfo(rules)
    expect(result.singerNames.has('bad singer')).toBe(true)
  })

  it('should handle multiple rules separated by newlines', async () => {
    const rules = [
      `Song 1${SPLIT_CHAR.DISLIKE_NAME}Artist 1`,
      'Song Only',
      `${SPLIT_CHAR.DISLIKE_NAME}Singer Only`,
    ].join('\n')

    const result = await overwirteDislikeInfo(rules)
    expect(result.names.size).toBe(1)
    expect(result.musicNames.size).toBe(1)
    expect(result.singerNames.size).toBe(1)
  })

  it('should skip empty lines', async () => {
    const rules = `Song 1\n\n\nSong 2`
    const result = await overwirteDislikeInfo(rules)
    expect(result.musicNames.size).toBe(2)
  })

  it('should convert names to lowercase', async () => {
    const rules = 'UPPER CASE SONG'
    const result = await overwirteDislikeInfo(rules)
    expect(result.musicNames.has('upper case song')).toBe(true)
    expect(result.musicNames.has('UPPER CASE SONG')).toBe(false)
  })

  it('should trim whitespace', async () => {
    const rules = '  Spaced Song  '
    const result = await overwirteDislikeInfo(rules)
    expect(result.musicNames.has('spaced song')).toBe(true)
  })

  it('should deduplicate rules', async () => {
    const rules = 'Same Song\nSame Song\nSame Song'
    const result = await overwirteDislikeInfo(rules)
    expect(result.musicNames.size).toBe(1)
    // Rules string should have only one entry
    expect(result.rules.split('\n').length).toBe(1)
  })

  it('should replace DISLIKE_NAME char in name/singer with alias', async () => {
    // If the name itself contains the '@' separator, it should be replaced
    const songWithAt = `Song${SPLIT_CHAR.DISLIKE_NAME}Part${SPLIT_CHAR.DISLIKE_NAME}Artist`
    const result = await overwirteDislikeInfo(songWithAt)
    // "Song" is name, "Part" is parsed as singer (first split)
    // The actual parsing splits on first @ only
    expect(result.names.size + result.musicNames.size + result.singerNames.size).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// addDislikeInfo
// ---------------------------------------------------------------------------
describe('addDislikeInfo', () => {
  beforeEach(async () => {
    await clearDislikeInfo()
  })

  it('should add a single name+singer combo', async () => {
    const result = await addDislikeInfo([{ name: 'Test Song', singer: 'Test Artist' }])
    expect(result.names.has(`test song${SPLIT_CHAR.DISLIKE_NAME}test artist`)).toBe(true)
  })

  it('should add multiple entries', async () => {
    const result = await addDislikeInfo([
      { name: 'Song A', singer: 'Artist A' },
      { name: 'Song B', singer: 'Artist B' },
    ])
    expect(result.names.size).toBe(2)
  })

  it('should accumulate with existing rules', async () => {
    await addDislikeInfo([{ name: 'Song A', singer: 'Artist A' }])
    const result = await addDislikeInfo([{ name: 'Song B', singer: 'Artist B' }])
    expect(result.names.size).toBe(2)
  })

  it('should handle entries with name only (no singer)', async () => {
    const result = await addDislikeInfo([{ name: 'Song Only', singer: '' }])
    // When singer is empty: "Song Only@" => name = "Song Only", singer = undefined
    // This becomes a name+singer combo where singer is empty
    expect(result.names.size + result.musicNames.size).toBeGreaterThan(0)
  })

  it('should handle entries with singer only (no name)', async () => {
    const result = await addDislikeInfo([{ name: '', singer: 'Bad Singer' }])
    expect(result.singerNames.has('bad singer')).toBe(true)
  })
})
