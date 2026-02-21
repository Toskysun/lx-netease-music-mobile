/**
 * Tests for src/store/list/action.ts
 *
 * Covers: setUserLists, setActiveList, setTempListMeta, setFetchingListStatus
 */

import listActions from '@/store/list/action'
import state from '@/store/list/state'

// Reset state before each test
beforeEach(() => {
  state.userList = []
  state.activeListId = ''
  state.tempListMeta = { id: '' }
  state.fetchingListStatus = {}
  state.allList = [state.defaultList, state.loveList]

  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// setUserLists
// ---------------------------------------------------------------------------
describe('setUserLists', () => {
  it('should update userList in state', () => {
    const userList = [
      { id: 'user_1', name: 'My List' },
      { id: 'user_2', name: 'Other' },
    ] as any
    listActions.setUserLists(userList)
    expect(state.userList).toBe(userList)
    expect(state.userList).toHaveLength(2)
  })

  it('should rebuild allList with default + love + user lists', () => {
    const userList = [{ id: 'user_1', name: 'Custom' }] as any
    listActions.setUserLists(userList)
    expect(state.allList).toHaveLength(3) // default + love + 1 user
    expect(state.allList[0].id).toBe('default')
    expect(state.allList[1].id).toBe('love')
    expect(state.allList[2].id).toBe('user_1')
  })

  it('should emit mylistUpdated event', () => {
    listActions.setUserLists([])
    expect(global.state_event.mylistUpdated).toHaveBeenCalledWith(state.allList)
  })

  it('should handle empty user list', () => {
    listActions.setUserLists([])
    expect(state.allList).toHaveLength(2) // just default + love
  })
})

// ---------------------------------------------------------------------------
// setActiveList
// ---------------------------------------------------------------------------
describe('setActiveList', () => {
  it('should update activeListId', () => {
    listActions.setActiveList('user_1')
    expect(state.activeListId).toBe('user_1')
  })

  it('should emit mylistToggled event', () => {
    listActions.setActiveList('love')
    expect(global.state_event.mylistToggled).toHaveBeenCalledWith('love')
  })

  it('should handle setting to default list', () => {
    listActions.setActiveList('default')
    expect(state.activeListId).toBe('default')
  })
})

// ---------------------------------------------------------------------------
// setTempListMeta
// ---------------------------------------------------------------------------
describe('setTempListMeta', () => {
  it('should update tempListMeta', () => {
    listActions.setTempListMeta({ id: 'wy__12345' })
    expect(state.tempListMeta).toEqual({ id: 'wy__12345' })
  })

  it('should handle empty id', () => {
    listActions.setTempListMeta({ id: '' })
    expect(state.tempListMeta.id).toBe('')
  })
})

// ---------------------------------------------------------------------------
// setFetchingListStatus
// ---------------------------------------------------------------------------
describe('setFetchingListStatus', () => {
  it('should set fetching status for a list', () => {
    listActions.setFetchingListStatus('user_1', true)
    expect(state.fetchingListStatus['user_1']).toBe(true)
  })

  it('should update fetching status to false', () => {
    state.fetchingListStatus['user_1'] = true
    listActions.setFetchingListStatus('user_1', false)
    expect(state.fetchingListStatus['user_1']).toBe(false)
  })

  it('should emit fetchingListStatusUpdated event', () => {
    listActions.setFetchingListStatus('list_x', true)
    expect(global.state_event.fetchingListStatusUpdated).toHaveBeenCalled()
  })

  it('should handle multiple lists independently', () => {
    listActions.setFetchingListStatus('list_a', true)
    listActions.setFetchingListStatus('list_b', false)
    expect(state.fetchingListStatus['list_a']).toBe(true)
    expect(state.fetchingListStatus['list_b']).toBe(false)
  })
})
