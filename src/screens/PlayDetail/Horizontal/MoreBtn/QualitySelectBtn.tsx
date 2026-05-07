import { TouchableOpacity, View, Text } from 'react-native'
import { memo, useRef, useCallback } from 'react'
import { useSettingValue } from '@/store/setting/hook'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'
import QualitySelectMenu, { type QualitySelectMenuType } from '@/screens/PlayDetail/components/QualitySelectMenu'
import { type Position } from '@/components/common/Menu'

const BTN_WIDTH = scaleSizeW(36)

// 音质徽标映射
const qualityBadges: Record<string, string> = {
  '128k': 'LQ',
  '192k': 'MQ',
  '320k': 'HQ',
  'flac': 'SQ',
  'flac24bit': 'HR',
  'hires': 'HR',
  'atmos': 'AT',
  'atmos_plus': 'A+',
  'master': 'MS'
}

export default memo(() => {
  const qualitySelectMenuRef = useRef<QualitySelectMenuType>(null)
  const btnRef = useRef<TouchableOpacity>(null)
  const currentQuality = useSettingValue('player.playQuality')
  const theme = useTheme()

  const handlePress = useCallback(() => {
    btnRef.current?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
      // 让菜单在按钮右侧打开：x 坐标设为按钮右边缘
      const position: Position = {
        x: Math.ceil(px + width),  // 按钮右边缘
        y: Math.ceil(py),
        w: 0,  // 宽度设为 0，这样菜单会从 x 位置开始
        h: Math.ceil(height),
      }
      qualitySelectMenuRef.current?.show(position)
    })
  }, [])

  // 获取当前音质的徽标
  const badge = qualityBadges[currentQuality] || 'SQ'

  return (
    <>
      <TouchableOpacity
        ref={btnRef}
        style={{ ...styles.cotrolBtn, width: BTN_WIDTH, height: BTN_WIDTH }}
        activeOpacity={0.5}
        onPress={handlePress}
      >
        <View style={[styles.badge, { borderColor: theme['c-font-label'] }]}>
          <Text style={[styles.badgeText, { color: theme['c-font-label'] }]}>
            {badge}
          </Text>
        </View>
      </TouchableOpacity>
      <QualitySelectMenu ref={qualitySelectMenuRef} />
    </>
  )
})

const styles = createStyle({
  cotrolBtn: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
})
