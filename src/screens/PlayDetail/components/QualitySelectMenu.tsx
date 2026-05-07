import { useMemo, useRef, useImperativeHandle, forwardRef, useState, useEffect, useCallback } from 'react'
import Menu, { type MenuType, type Position } from '@/components/common/Menu'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import playerState from '@/store/player/state'
import { useWindowSize } from '@/utils/hooks'

// 音质显示名称
const qualityNames: Record<string, string> = {
  '128k': '普通音质 128K',
  '192k': '中等音质 192K',
  '320k': '高品音质 320K',
  'flac': '无损音质 FLAC',
  'flac24bit': '高解析度 FLAC 24bit',
  'hires': '高解析度 Hires',
  'atmos': '臻品全景声 Atmos',
  'atmos_plus': '臻品全景声 Atmos 2.0',
  'master': '臻品母带 Master'
}

// 音质分组：标准音质 vs 高级音质（需要 AI 升频分隔）
const standardQualities = ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires']
const advancedQualities = ['atmos', 'atmos_plus', 'master']
const MENU_HORIZONTAL_PADDING = 20
const MENU_MIN_WIDTH = 220
const MENU_MAX_MARGIN = 24

export interface QualitySelectMenuType {
  show: (position: Position) => void
}

export interface QualitySelectMenuProps {
  onQualityChange?: (quality: LX.Quality) => void
}

export default forwardRef<QualitySelectMenuType, QualitySelectMenuProps>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const menuRef = useRef<MenuType>(null)
  const currentQuality = useSettingValue('player.playQuality')
  const [musicInfo, setMusicInfo] = useState(playerState.playMusicInfo?.musicInfo)
  const windowSize = useWindowSize()

  // 监听歌曲变化
  useEffect(() => {
    const handleMusicChange = () => {
      setMusicInfo(playerState.playMusicInfo?.musicInfo)
    }
    global.state_event.on('playerMusicInfoChanged', handleMusicChange)
    return () => {
      global.state_event.off('playerMusicInfoChanged', handleMusicChange)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    show(position) {
      if (visible) {
        menuRef.current?.show(position)
      } else {
        setVisible(true)
        requestAnimationFrame(() => {
          menuRef.current?.show(position)
        })
      }
    },
  }))

  // 获取当前播放歌曲的可用音质列表
  const availableQualities = useMemo(() => {
    if (!musicInfo || musicInfo.source === 'local') return []

    // 从 musicInfo.meta.qualitys 获取可用音质
    // qualitys 是数组格式: [{type: '128k', size: '4.95 MB'}, ...]
    const qualitys = (musicInfo as any).meta?.qualitys || []
    const available = qualitys.map((q: any) => q.type)
    return available
  }, [musicInfo])

  // 获取音质文件大小
  const getQualitySize = useCallback((quality: string): string => {
    if (!musicInfo || musicInfo.source === 'local') return ''

    // qualitys 是数组格式
    const qualitys = (musicInfo as any).meta?.qualitys || []
    const qualityInfo = qualitys.find((q: any) => q.type === quality)
    return qualityInfo?.size || ''
  }, [musicInfo])

  // 构建菜单项
  const menus = useMemo(() => {
    const menuItems: Array<{ action: string; label: string; disabled?: boolean }> = []

    // 如果没有可用音质，显示提示
    if (availableQualities.length === 0) {
      menuItems.push({
        action: 'no-quality',
        label: '当前歌曲无可用音质',
        disabled: true
      })
      return menuItems
    }

    // 标准音质
    standardQualities.forEach(quality => {
      if (availableQualities.includes(quality)) {
        const name = qualityNames[quality] || quality
        const size = getQualitySize(quality)
        menuItems.push({
          action: quality,
          label: `${name}${size ? ` (${size})` : ''}`,
        })
      }
    })

    // AI 升频分隔线
    const hasAdvanced = advancedQualities.some(q => availableQualities.includes(q))
    if (hasAdvanced && menuItems.length > 0) {
      menuItems.push({ action: 'divider', label: '─── AI 升频 ───', disabled: true })
    }

    // 高级音质
    advancedQualities.forEach(quality => {
      if (availableQualities.includes(quality)) {
        const name = qualityNames[quality] || quality
        const size = getQualitySize(quality)
        menuItems.push({
          action: quality,
          label: `${name}${size ? ` (${size})` : ''}`,
        })
      }
    })

    return menuItems
  }, [availableQualities, getQualitySize])

  const menuWidth = useMemo(() => {
    const maxLabelLength = menus.reduce((max, menu) => Math.max(max, menu.label.length), 0)
    const estimatedTextWidth = Math.ceil(maxLabelLength * 8.5) + MENU_HORIZONTAL_PADDING
    return Math.min(Math.max(MENU_MIN_WIDTH, estimatedTextWidth), windowSize.width - MENU_MAX_MARGIN)
  }, [menus, windowSize.width])

  const handleMenuPress = ({ action }: { action: string }) => {
    if (action === 'divider' || action === 'no-quality') return

    updateSetting({ 'player.playQuality': action as LX.Quality })
    props.onQualityChange?.(action as LX.Quality)
  }

  const handleHide = () => {
    // 菜单隐藏时的回调
  }

  return visible ? (
    <Menu
      ref={menuRef}
      menus={menus}
      onPress={handleMenuPress}
      onHide={handleHide}
      activeId={currentQuality}
      width={menuWidth}
      fontSize={14}
    />
  ) : null
})
