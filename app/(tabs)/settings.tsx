import { View, Text, StyleSheet, Switch, Slider } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const {
    fontSize,
    isDarkMode,
    autoAdvance,
    setFontSize,
    setDarkMode,
    setAutoAdvance,
  } = useSettingsStore();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Display</Text>
        
        <View style={styles.setting}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Font Size: {fontSize}pt
          </Text>
          <Slider
            style={styles.slider}
            value={fontSize}
            minimumValue={16}
            maximumValue={32}
            step={1}
            onValueChange={setFontSize}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Reading</Text>
        
        <View style={styles.setting}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Auto-advance</Text>
          <Switch value={autoAdvance} onValueChange={setAutoAdvance} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 30,
  },
  darkText: {
    color: '#fff',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 15,
  },
  setting: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});