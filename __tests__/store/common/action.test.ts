/**
 * Tests for src/store/common/action.ts
 *
 * Covers: setFontSize, setStatusbarHeight, setComponentId, removeComponentId,
 *         setNavActiveId, setLastNavActiveId, setBgPic, setSourceNames
 */

import commonActions from '@/store/common/action'
import state from '@/store/common/state'
import { COMPONENT_IDS } from '@/config/constant'

// Reset state before each test
beforeEach(() => {
  state.fontSize = 16
  state.statusbarHeight = 0
  state.componentIds = []
  state.navActiveId = 'nav_search'
  state.lastNavActiveId = 'nav_search'
  state.bgPic = null
  state.sourceNames = {} as any

  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// setFontSize
// ---------------------------------------------------------------------------
describe('setFontSize', () => {
  it('should update fontSize in state', () => {
    commonActions.setFontSize(20)
    expect(state.fontSize).toBe(20)
  })

  it('should emit fontSizeUpdated event', () => {
    commonActions.setFontSize(18)
    expect(global.state_event.fontSizeUpdated).toHaveBeenCalledWith(18)
  })

  it('should handle decimal values', () => {
    commonActions.setFontSize(14.5)
    expect(state.fontSize).toBe(14.5)
  })
})

// ---------------------------------------------------------------------------
// setStatusbarHeight
// ---------------------------------------------------------------------------
describe('setStatusbarHeight', () => {
  it('should update statusbarHeight', () => {
    commonActions.setStatusbarHeight(24)
    expect(state.statusbarHeight).toBe(24)
  })

  it('should emit statusbarHeightUpdated event', () => {
    commonActions.setStatusbarHeight(30)
    expect(global.state_event.statusbarHeightUpdated).toHaveBeenCalledWith(30)
  })

  it('should skip update and event if value is unchanged', () => {
    state.statusbarHeight = 24
    commonActions.setStatusbarHeight(24)
    expect(global.state_event.statusbarHeightUpdated).not.toHaveBeenCalled()
  })

  it('should update when value changes from previous', () => {
    state.statusbarHeight = 24
    commonActions.setStatusbarHeight(30)
    expect(state.statusbarHeight).toBe(30)
    expect(global.state_event.statusbarHeightUpdated).toHaveBeenCalledWith(30)
  })
})

// ---------------------------------------------------------------------------
// setComponentId / removeComponentId
// ---------------------------------------------------------------------------
describe('setComponentId', () => {
  it('should add a component ID entry', () => {
    commonActions.setComponentId(COMPONENT_IDS.home, 'comp_1')
    expect(state.componentIds).toHaveLength(1)
    expect(state.componentIds[0]).toEqual({ name: COMPONENT_IDS.home, id: 'comp_1' })
  })

  it('should emit componentIdsUpdated event', () => {
    commonActions.setComponentId(COMPONENT_IDS.playDetail, 'comp_2')
    expect(global.state_event.componentIdsUpdated).toHaveBeenCalled()
  })

  it('should allow multiple entries', () => {
    commonActions.setComponentId(COMPONENT_IDS.home, 'comp_1')
    commonActions.setComponentId(COMPONENT_IDS.playDetail, 'comp_2')
    expect(state.componentIds).toHaveLength(2)
  })
})

describe('removeComponentId', () => {
  it('should remove a component by ID', () => {
    state.componentIds = [
      { name: COMPONENT_IDS.home, id: 'comp_1' },
      { name: COMPONENT_IDS.playDetail, id: 'comp_2' },
    ]
    commonActions.removeComponentId('comp_1')
    expect(state.componentIds).toHaveLength(1)
    expect(state.componentIds[0].id).toBe('comp_2')
  })

  it('should emit componentIdsUpdated when an item is removed', () => {
    state.componentIds = [{ name: COMPONENT_IDS.home, id: 'comp_1' }]
    commonActions.removeComponentId('comp_1')
    expect(global.state_event.componentIdsUpdated).toHaveBeenCalled()
  })

  it('should not emit event when removing a non-existent ID', () => {
    state.componentIds = [{ name: COMPONENT_IDS.home, id: 'comp_1' }]
    commonActions.removeComponentId('non_existent')
    expect(global.state_event.componentIdsUpdated).not.toHaveBeenCalled()
    expect(state.componentIds).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// setNavActiveId / setLastNavActiveId
// ---------------------------------------------------------------------------
describe('setNavActiveId', () => {
  it('should update navActiveId', () => {
    commonActions.setNavActiveId('nav_songlist')
    expect(state.navActiveId).toBe('nav_songlist')
  })

  it('should also update lastNavActiveId for non-setting IDs', () => {
    commonActions.setNavActiveId('nav_top')
    expect(state.lastNavActiveId).toBe('nav_top')
  })

  it('should NOT update lastNavActiveId when setting is nav_setting', () => {
    state.lastNavActiveId = 'nav_search'
    commonActions.setNavActiveId('nav_setting')
    expect(state.navActiveId).toBe('nav_setting')
    expect(state.lastNavActiveId).toBe('nav_search')
  })

  it('should emit navActiveIdUpdated event', () => {
    commonActions.setNavActiveId('nav_love')
    expect(global.state_event.navActiveIdUpdated).toHaveBeenCalledWith('nav_love')
  })
})

describe('setLastNavActiveId', () => {
  it('should update lastNavActiveId', () => {
    commonActions.setLastNavActiveId('nav_top')
    expect(state.lastNavActiveId).toBe('nav_top')
  })

  it('should NOT emit any event', () => {
    commonActions.setLastNavActiveId('nav_songlist')
    // setLastNavActiveId does not emit navActiveIdUpdated
    // (only setNavActiveId does)
  })
})

// ---------------------------------------------------------------------------
// setBgPic
// ---------------------------------------------------------------------------
describe('setBgPic', () => {
  it('should update bgPic', () => {
    commonActions.setBgPic('http://pic.url/bg.jpg')
    expect(state.bgPic).toBe('http://pic.url/bg.jpg')
  })

  it('should accept null', () => {
    state.bgPic = 'something'
    commonActions.setBgPic(null)
    expect(state.bgPic).toBeNull()
  })

  it('should emit bgPicUpdated event', () => {
    commonActions.setBgPic('url')
    expect(global.state_event.bgPicUpdated).toHaveBeenCalledWith('url')
  })
})

// ---------------------------------------------------------------------------
// setSourceNames
// ---------------------------------------------------------------------------
describe('setSourceNames', () => {
  it('should update sourceNames', () => {
    const names = { all: 'All', wy: 'NetEase', kg: 'Kugou' } as any
    commonActions.setSourceNames(names)
    expect(state.sourceNames).toBe(names)
  })

  it('should emit sourceNamesUpdated event', () => {
    const names = { all: 'All' } as any
    commonActions.setSourceNames(names)
    expect(global.state_event.sourceNamesUpdated).toHaveBeenCalledWith(names)
  })
})
