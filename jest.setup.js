/**
 * Jest global setup file.
 *
 * Provides mocks for React Native native modules and global objects
 * that are expected by the application code at runtime.
 */

// ============================================================
// Global objects expected by the application
// ============================================================

global.lx = {
  isPlayedStop: false,
  playerError: false,
  gettingUrlId: '',
  restorePlayInfo: null,
}

global.i18n = {
  t: (key, params) => {
    if (params) {
      let result = key
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v))
      }
      return result
    }
    return key
  },
}

global.app_event = {
  error: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setProgress: jest.fn(),
  picUpdated: jest.fn(),
  lyricUpdated: jest.fn(),
  musicToggled: jest.fn(),
}

global.state_event = {
  playInfoChanged: jest.fn(),
  playMusicInfoChanged: jest.fn(),
  playerMusicInfoChanged: jest.fn(),
  playStateChanged: jest.fn(),
  playStateTextChanged: jest.fn(),
  playProgressChanged: jest.fn(),
  playPlayedListChanged: jest.fn(),
  playTempPlayListChanged: jest.fn(),
}

// ============================================================
// Performance API (used by timeoutExit.ts)
// ============================================================

if (typeof performance === 'undefined') {
  global.performance = {
    now: jest.fn(() => Date.now()),
  }
}

// ============================================================
// React Native module mocks
// ============================================================

jest.mock('react-native', () => ({
  Platform: { OS: 'android', select: jest.fn((obj) => obj.android) },
  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  })),
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
  },
}), { virtual: true })

jest.mock('react-native-background-timer', () => ({
  setTimeout: jest.fn((fn, delay) => setTimeout(fn, delay)),
  clearTimeout: jest.fn((id) => clearTimeout(id)),
  setInterval: jest.fn((fn, delay) => setInterval(fn, delay)),
  clearInterval: jest.fn((id) => clearInterval(id)),
}))

jest.mock('react-native-track-player', () => ({
  default: {},
  Event: {},
  State: { Playing: 'playing', Paused: 'paused', Stopped: 'stopped' },
  usePlaybackState: jest.fn(),
  useProgress: jest.fn(),
}))

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  ExternalDirectoryPath: '/mock/external',
  exists: jest.fn(() => Promise.resolve(true)),
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
}))

jest.mock('react-native-navigation', () => ({
  Navigation: {
    registerComponent: jest.fn(),
    setRoot: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    events: jest.fn(() => ({
      registerAppLaunchedListener: jest.fn(),
    })),
  },
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}))

jest.mock('@react-native-clipboard/clipboard', () => ({
  default: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
  },
}))

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')
jest.mock('react-native-svg', () => ({}))
jest.mock('react-native-pager-view', () => ({}))
jest.mock('react-native-video', () => ({}))
jest.mock('react-native-webview', () => ({}))
jest.mock('react-native-udp', () => ({}))
jest.mock('rn-fetch-blob', () => ({ default: {} }))
jest.mock('react-native-quick-base64', () => ({
  btoa: jest.fn((str) => Buffer.from(str).toString('base64')),
  atob: jest.fn((str) => Buffer.from(str, 'base64').toString()),
}))
jest.mock('react-native-quick-md5', () => ({
  md5: jest.fn(() => 'mock-md5-hash'),
}))

jest.mock('he', () => ({
  decode: jest.fn((str) => str),
}))

jest.mock('message2call', () => ({
  default: jest.fn(),
}))

jest.mock('lrc-file-parser', () => ({
  default: jest.fn(),
}))

// ============================================================
// Application module mocks (plugins / data layer)
// ============================================================

jest.mock('@/plugins/player', () => ({
  isInitialized: jest.fn(() => true),
  initial: jest.fn(() => Promise.resolve()),
  isEmpty: jest.fn(() => false),
  setPause: jest.fn(() => Promise.resolve()),
  setPlay: jest.fn(() => Promise.resolve()),
  setResource: jest.fn(),
  setStop: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/utils/tools', () => ({
  checkNotificationPermission: jest.fn(() => Promise.resolve()),
  checkIgnoringBatteryOptimization: jest.fn(() => Promise.resolve()),
  debounceBackgroundTimer: jest.fn((fn) => fn),
  toast: jest.fn(),
}))

jest.mock('@/utils/data', () => ({
  getUserLists: jest.fn(() => Promise.resolve([])),
  getListMusics: jest.fn(() => Promise.resolve([])),
  overwriteListPosition: jest.fn(() => Promise.resolve()),
  overwriteListUpdateInfo: jest.fn(() => Promise.resolve()),
  removeListPosition: jest.fn(() => Promise.resolve()),
  removeListUpdateInfo: jest.fn(() => Promise.resolve()),
  getDislikeListRules: jest.fn(() => Promise.resolve('')),
}))

jest.mock('@/utils/fs', () => ({
  existsFile: jest.fn(() => Promise.resolve(true)),
}))

jest.mock('@/utils/musicSdk/wy/user', () => ({
  default: {
    scrobble: jest.fn(() => Promise.resolve()),
  },
}))

// ============================================================
// Additional application module mocks
// ============================================================

jest.mock('@/core/common', () => ({
  exitApp: jest.fn(),
}))

jest.mock('@/utils/listManage', () => ({
  getListMusicSync: jest.fn(() => []),
  setMusicList: jest.fn(),
  removeMusicList: jest.fn(),
  getUserLists: jest.fn(() => []),
  setUserLists: jest.fn(),
}))

jest.mock('@/config/setting', () => ({
  updateSetting: jest.fn((newSetting) => ({
    setting: { ...newSetting },
    updatedSettingKeys: Object.keys(newSetting),
    updatedSetting: newSetting,
  })),
}))

jest.mock('@/config/defaultSetting', () => ({
  default: {
    'player.togglePlayMethod': 'listLoop',
    'player.isAutoCleanPlayedList': false,
    'player.timeoutExitPlayed': false,
    'player.volume': 1,
    'player.playbackRate': 1,
    'player.cacheSize': '0',
    'player.isHandleAudioFocus': true,
    'player.isEnableAudioOffload': false,
    'player.isPlayHighQuality': false,
    'player.isSavePlayTime': true,
    'list.addMusicLocationType': 'top',
  },
}))

jest.mock('@/store/dislikeList', () => ({
  state: {
    dislikeInfo: {
      names: new Set(),
      musicNames: new Set(),
      singerNames: new Set(),
      rules: '',
    },
  },
  action: {
    hasDislike: jest.fn(() => false),
    setDislikeInfo: jest.fn(),
  },
}))

jest.mock('@/store/dislikeList/event', () => ({
  event: {
    dislike_changed: jest.fn(),
  },
}))

jest.mock('@/event/Event', () => {
  return class Event {
    constructor() {
      this._listeners = {}
    }
    emit(name, ...args) {
      const listeners = this._listeners[name] || []
      listeners.forEach((fn) => fn(...args))
    }
    on(name, fn) {
      if (!this._listeners[name]) this._listeners[name] = []
      this._listeners[name].push(fn)
    }
    off(name, fn) {
      if (!this._listeners[name]) return
      this._listeners[name] = this._listeners[name].filter((f) => f !== fn)
    }
  }
})

// Additional global state event mocks for store modules
if (!global.state_event.fontSizeUpdated) {
  Object.assign(global.state_event, {
    fontSizeUpdated: jest.fn(),
    statusbarHeightUpdated: jest.fn(),
    componentIdsUpdated: jest.fn(),
    navActiveIdUpdated: jest.fn(),
    bgPicUpdated: jest.fn(),
    sourceNamesUpdated: jest.fn(),
    configUpdated: jest.fn(),
    mylistUpdated: jest.fn(),
    mylistToggled: jest.fn(),
    fetchingListStatusUpdated: jest.fn(),
  })
}
