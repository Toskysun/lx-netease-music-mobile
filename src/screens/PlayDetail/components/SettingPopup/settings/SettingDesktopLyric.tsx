import { View } from 'react-native';
import { useSettingValue } from '@/store/setting/hook';
import { useI18n } from '@/lang';
import CheckBox from '@/components/common/CheckBox';
import DesktopLyricEnable, { type DesktopLyricEnableType } from '@/components/DesktopLyricEnable';
import styles from './style';
import { useRef } from 'react';

export default () => {
  const t = useI18n();
  const isShowDesktopLyric = useSettingValue('desktopLyric.enable');
  const desktopLyricEnableRef = useRef<DesktopLyricEnableType>(null);

  const setDesktopLyric = (enable: boolean) => {
    desktopLyricEnableRef.current?.setEnabled(enable);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.content}>
          <CheckBox
            check={isShowDesktopLyric}
            label={t('setting_player_desktop_lyric')}
            onChange={setDesktopLyric}
          />
        </View>
      </View>
      <DesktopLyricEnable ref={desktopLyricEnableRef} />
    </>
  );
};
