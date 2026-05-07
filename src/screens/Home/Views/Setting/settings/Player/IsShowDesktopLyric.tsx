import { memo } from 'react'
import CheckBoxItem from '../../components/CheckBoxItem'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import DesktopLyricEnable, { type DesktopLyricEnableType } from '@/components/DesktopLyricEnable'
import { useRef } from 'react'

export default memo(() => {
  const t = useI18n()
  const enabledLyric = useSettingValue('desktopLyric.enable')
  const desktopLyricEnableRef = useRef<DesktopLyricEnableType>(null)

  const handleChange = () => {
    desktopLyricEnableRef.current?.setEnabled(!enabledLyric)
  }

  return (
    <>
      <CheckBoxItem
        check={enabledLyric}
        label={t('setting_player_desktop_lyric')}
        onChange={handleChange}
      />
      <DesktopLyricEnable ref={desktopLyricEnableRef} />
    </>
  )
})
