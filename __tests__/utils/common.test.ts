/**
 * Tests for src/utils/common.ts
 *
 * Covers: getRandom, sizeFormate, toDateObj, dateFormat, formatPlayTime,
 *         formatPlayTime2, isUrl, parseUrlParams, filterFileName,
 *         similar, sortInsert, arrPush, arrUnshift, arrPushByPosition, arrShuffle
 */

import {
  getRandom,
  sizeFormate,
  toDateObj,
  dateFormat,
  formatPlayTime,
  formatPlayTime2,
  isUrl,
  parseUrlParams,
  filterFileName,
  similar,
  sortInsert,
  arrPush,
  arrUnshift,
  arrPushByPosition,
  arrShuffle,
  throttle,
  debounce,
  b64DecodeUnicode,
} from '@/utils/common'

// ---------------------------------------------------------------------------
// getRandom
// ---------------------------------------------------------------------------
describe('getRandom', () => {
  it('should return a number >= min and < max', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandom(0, 10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(10)
    }
  })

  it('should return min when min == max - 1', () => {
    expect(getRandom(5, 6)).toBe(5)
  })

  it('should return min when min == max (edge case, range is 0)', () => {
    // Math.floor(Math.random() * 0) + 3 === 3
    expect(getRandom(3, 3)).toBe(3)
  })

  it('should work with negative numbers', () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandom(-5, 5)
      expect(result).toBeGreaterThanOrEqual(-5)
      expect(result).toBeLessThan(5)
    }
  })
})

// ---------------------------------------------------------------------------
// sizeFormate
// ---------------------------------------------------------------------------
describe('sizeFormate', () => {
  it('should return "0 B" for size 0', () => {
    expect(sizeFormate(0)).toBe('0 B')
  })

  it('should format bytes correctly', () => {
    expect(sizeFormate(500)).toBe('500.00 B')
  })

  it('should format kilobytes correctly', () => {
    expect(sizeFormate(1024)).toBe('1.00 KB')
    expect(sizeFormate(1536)).toBe('1.50 KB')
  })

  it('should format megabytes correctly', () => {
    expect(sizeFormate(1048576)).toBe('1.00 MB')
  })

  it('should format gigabytes correctly', () => {
    expect(sizeFormate(1073741824)).toBe('1.00 GB')
  })
})

// ---------------------------------------------------------------------------
// toDateObj
// ---------------------------------------------------------------------------
describe('toDateObj', () => {
  it('should return empty string for falsy input', () => {
    expect(toDateObj(undefined)).toBe('')
    expect(toDateObj(0)).toBe('')
    expect(toDateObj('')).toBe('')
  })

  it('should handle numeric timestamps', () => {
    const ts = 1700000000000
    const result = toDateObj(ts)
    expect(result).toBeInstanceOf(Date)
    expect((result as Date).getTime()).toBe(ts)
  })

  it('should handle Date objects', () => {
    const d = new Date(2023, 5, 15)
    expect(toDateObj(d)).toBe(d)
  })

  it('should handle string dates', () => {
    const result = toDateObj('2023-06-15 12:30:00')
    expect(result).toBeInstanceOf(Date)
  })
})

// ---------------------------------------------------------------------------
// dateFormat
// ---------------------------------------------------------------------------
describe('dateFormat', () => {
  it('should format date with default format', () => {
    const result = dateFormat(new Date(2023, 0, 5, 9, 8, 7))
    expect(result).toBe('2023-01-05 09:08:07')
  })

  it('should format date with custom format', () => {
    const result = dateFormat(new Date(2023, 11, 25, 14, 30, 0), 'Y/M/D')
    expect(result).toBe('2023/12/25')
  })

  it('should return empty string for falsy input', () => {
    expect(dateFormat(0)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// formatPlayTime
// ---------------------------------------------------------------------------
describe('formatPlayTime', () => {
  it('should return "--/--" for 0', () => {
    expect(formatPlayTime(0)).toBe('--/--')
  })

  it('should format seconds correctly', () => {
    expect(formatPlayTime(65)).toBe('01:05')
  })

  it('should format minutes correctly', () => {
    expect(formatPlayTime(600)).toBe('10:00')
  })

  it('should handle large values', () => {
    expect(formatPlayTime(3661)).toBe('61:01')
  })
})

// ---------------------------------------------------------------------------
// formatPlayTime2
// ---------------------------------------------------------------------------
describe('formatPlayTime2', () => {
  it('should return "00:00" for 0', () => {
    expect(formatPlayTime2(0)).toBe('00:00')
  })

  it('should format seconds correctly', () => {
    expect(formatPlayTime2(65)).toBe('01:05')
  })

  it('should format with truncation (no rounding)', () => {
    expect(formatPlayTime2(65.9)).toBe('01:05')
  })
})

// ---------------------------------------------------------------------------
// isUrl
// ---------------------------------------------------------------------------
describe('isUrl', () => {
  it('should return true for http URLs', () => {
    expect(isUrl('http://example.com')).toBe(true)
  })

  it('should return true for https URLs', () => {
    expect(isUrl('https://example.com/path')).toBe(true)
  })

  it('should return false for non-URL strings', () => {
    expect(isUrl('/local/path/file.mp3')).toBe(false)
    expect(isUrl('file:///something')).toBe(false)
    expect(isUrl('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// parseUrlParams
// ---------------------------------------------------------------------------
describe('parseUrlParams', () => {
  it('should parse simple key-value pairs', () => {
    expect(parseUrlParams('a=1&b=2')).toEqual({ a: '1', b: '2' })
  })

  it('should handle single param', () => {
    expect(parseUrlParams('key=value')).toEqual({ key: 'value' })
  })

  it('should return empty object for non-string input', () => {
    // @ts-expect-error testing invalid input
    expect(parseUrlParams(123)).toEqual({})
  })

  it('should handle missing values', () => {
    const result = parseUrlParams('key=')
    expect(result).toEqual({ key: '' })
  })
})

// ---------------------------------------------------------------------------
// filterFileName
// ---------------------------------------------------------------------------
describe('filterFileName', () => {
  it('should remove illegal file name characters', () => {
    expect(filterFileName('song:name*test?.mp3')).toBe('songnametest.mp3')
  })

  it('should remove backslash, slash, colon, asterisk, question, hash, quotes, angle brackets, pipe', () => {
    expect(filterFileName('a\\b/c:d*e?f#g"h<i>j|k')).toBe('abcdefghijk')
  })

  it('should return empty string for all-illegal characters', () => {
    expect(filterFileName(':\\*?"<>|')).toBe('')
  })

  it('should keep normal characters intact', () => {
    expect(filterFileName('hello world.txt')).toBe('hello world.txt')
  })
})

// ---------------------------------------------------------------------------
// similar (Levenshtein similarity)
// ---------------------------------------------------------------------------
describe('similar', () => {
  it('should return 1 for identical strings', () => {
    expect(similar('hello', 'hello')).toBe(1)
  })

  it('should return 0 for empty strings', () => {
    expect(similar('', 'hello')).toBe(0)
    expect(similar('hello', '')).toBe(0)
    expect(similar('', '')).toBe(0)
  })

  it('should return a value between 0 and 1 for different strings', () => {
    const result = similar('kitten', 'sitting')
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('should be symmetric (order should not matter)', () => {
    expect(similar('abc', 'def')).toBe(similar('def', 'abc'))
  })
})

// ---------------------------------------------------------------------------
// sortInsert (binary insertion into sorted array)
// ---------------------------------------------------------------------------
describe('sortInsert', () => {
  it('should insert into empty array', () => {
    const arr: Array<{ num: number; data: string }> = []
    sortInsert(arr, { num: 5, data: 'a' })
    expect(arr).toEqual([{ num: 5, data: 'a' }])
  })

  it('should maintain sorted order', () => {
    const arr: Array<{ num: number; data: string }> = []
    sortInsert(arr, { num: 3, data: 'c' })
    sortInsert(arr, { num: 1, data: 'a' })
    sortInsert(arr, { num: 5, data: 'e' })
    sortInsert(arr, { num: 2, data: 'b' })
    expect(arr.map((i) => i.num)).toEqual([1, 2, 3, 5])
  })

  it('should handle duplicate keys', () => {
    const arr: Array<{ num: number; data: string }> = []
    sortInsert(arr, { num: 1, data: 'first' })
    sortInsert(arr, { num: 1, data: 'second' })
    expect(arr.length).toBe(2)
    // Both items with num=1 should be adjacent
    expect(arr[0].num).toBe(1)
    expect(arr[1].num).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// arrPush
// ---------------------------------------------------------------------------
describe('arrPush', () => {
  it('should append items to the list', () => {
    const list = [1, 2, 3]
    arrPush(list, [4, 5, 6])
    expect(list).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle empty newList', () => {
    const list = [1, 2]
    arrPush(list, [])
    expect(list).toEqual([1, 2])
  })

  it('should handle large arrays (batched in chunks of 1000)', () => {
    const list: number[] = []
    const newList = Array.from({ length: 2500 }, (_, i) => i)
    arrPush(list, newList)
    expect(list.length).toBe(2500)
    expect(list[0]).toBe(0)
    expect(list[2499]).toBe(2499)
  })
})

// ---------------------------------------------------------------------------
// arrUnshift
// ---------------------------------------------------------------------------
describe('arrUnshift', () => {
  it('should prepend items to the list', () => {
    const list = [4, 5, 6]
    arrUnshift(list, [1, 2, 3])
    expect(list).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle empty newList', () => {
    const list = [1]
    arrUnshift(list, [])
    expect(list).toEqual([1])
  })
})

// ---------------------------------------------------------------------------
// arrPushByPosition
// ---------------------------------------------------------------------------
describe('arrPushByPosition', () => {
  it('should insert items at specified position', () => {
    const list = [1, 2, 5, 6]
    arrPushByPosition(list, [3, 4], 2)
    expect(list).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should insert at position 0', () => {
    const list = [3, 4]
    arrPushByPosition(list, [1, 2], 0)
    expect(list).toEqual([1, 2, 3, 4])
  })

  it('should insert at end when position >= length', () => {
    const list = [1, 2]
    arrPushByPosition(list, [3, 4], 10)
    expect(list).toEqual([1, 2, 3, 4])
  })
})

// ---------------------------------------------------------------------------
// arrShuffle
// ---------------------------------------------------------------------------
describe('arrShuffle', () => {
  it('should return the same array reference', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = arrShuffle(arr)
    expect(result).toBe(arr)
  })

  it('should maintain the same length', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    arrShuffle(arr)
    expect(arr.length).toBe(10)
  })

  it('should contain the same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const copy = [...arr]
    arrShuffle(arr)
    expect(arr.sort()).toEqual(copy.sort())
  })

  it('should handle single-element array', () => {
    const arr = [42]
    arrShuffle(arr)
    expect(arr).toEqual([42])
  })

  it('should handle empty array', () => {
    const arr: number[] = []
    arrShuffle(arr)
    expect(arr).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------
describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('should call the function after delay', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)

    throttled('a')
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('should use the latest args when called multiple times within delay', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled('third')

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })
})

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------
describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('should delay function execution', () => {
    const fn = jest.fn()
    const debounced = debounce(fn, 200)

    debounced('a')
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('should reset timer on subsequent calls', () => {
    const fn = jest.fn()
    const debounced = debounce(fn, 200)

    debounced('first')
    jest.advanceTimersByTime(100)
    debounced('second')
    jest.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })
})

// ---------------------------------------------------------------------------
// b64DecodeUnicode
// ---------------------------------------------------------------------------
describe('b64DecodeUnicode', () => {
  it('should decode base64 string', () => {
    const encoded = Buffer.from('hello world').toString('base64')
    expect(b64DecodeUnicode(encoded)).toBe('hello world')
  })

  it('should decode empty string', () => {
    expect(b64DecodeUnicode('')).toBe('')
  })
})
