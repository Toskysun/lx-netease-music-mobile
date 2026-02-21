/**
 * Tests for src/utils/index.ts -- dateFormat2 function
 *
 * dateFormat2 produces human-readable relative time strings
 * (e.g., "5 seconds ago", "3 minutes ago") using the i18n system.
 */

import { dateFormat2 } from '@/utils/index'

// ---------------------------------------------------------------------------
// dateFormat2
// ---------------------------------------------------------------------------
describe('dateFormat2', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return seconds format for differences < 60s', () => {
    const now = 1700000060000
    ;(Date.now as jest.Mock).mockReturnValue(now)

    const result = dateFormat2(now - 30000) // 30 seconds ago
    expect(result).toContain('date_format_second')
  })

  it('should return minutes format for differences between 60s and 3600s', () => {
    const now = 1700000060000
    ;(Date.now as jest.Mock).mockReturnValue(now)

    const result = dateFormat2(now - 120000) // 2 minutes ago
    expect(result).toContain('date_format_minute')
  })

  it('should return hours format for differences between 3600s and 86400s', () => {
    const now = 1700000060000
    ;(Date.now as jest.Mock).mockReturnValue(now)

    const result = dateFormat2(now - 7200000) // 2 hours ago
    expect(result).toContain('date_format_hour')
  })

  it('should return full date format for differences >= 86400s (1 day)', () => {
    const now = 1700000060000
    ;(Date.now as jest.Mock).mockReturnValue(now)

    const result = dateFormat2(now - 100000000) // > 1 day ago
    // dateFormat returns a formatted date string like "2023-11-XX XX:XX:XX"
    expect(result).toMatch(/\d{4}/)
  })

  it('should handle exactly 0 seconds difference', () => {
    const now = 1700000060000
    ;(Date.now as jest.Mock).mockReturnValue(now)

    const result = dateFormat2(now)
    expect(result).toContain('date_format_second')
  })
})
