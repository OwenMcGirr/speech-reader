import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

type WebVoice = {
  identifier: string;
  name: string;
  language: string;
  quality: 1;
  isNetworkConnectionRequired: boolean;
};

const DEMO_TEXT = "This is a demo of the selected voice. You can listen to how it sounds before using it.";

export default function SettingsScreen() {
  const {
    fontSize,
    isDarkMode,
    autoAdvance,
    selectedVoice,
    setFontSize,
    setDarkMode,
    setAutoAdvance,
    setSelectedVoice,
  } = useSettingsStore();

  const [availableVoices, setAvailableVoices] = useState<(Speech.Voice | WebVoice)[]>([]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    if (Platform.OS === 'web') {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.map(voice => ({
        identifier: voice.voiceURI,
        name: voice.name,
        language: voice.lang,
        quality: 1,
        isNetworkConnectionRequired: false,
      })));
    } else {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
    }
  };

  const playDemo = async (voiceId: string) => {
    if (Platform.OS === 'web') {
      const utterance = new SpeechSynthesisUtterance(DEMO_TEXT);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.voiceURI === voiceId);
      if (voice) {
        utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        await Speech.speak(DEMO_TEXT, {
          voice: voiceId,
        });
      } catch (error) {
        console.error('Speech error:', error);
      }
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setShowVoicePicker(false);
    playDemo(voiceId);
  };

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

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Voice</Text>
          <TouchableOpacity
            style={[styles.voiceButton, isDarkMode && styles.darkButton]}
            onPress={() => setShowVoicePicker(!showVoicePicker)}>
            <Text style={[styles.voiceButtonText, isDarkMode && styles.darkText]}>
              {selectedVoice ? availableVoices.find(v => v.identifier === selectedVoice)?.name || 'Select Voice' : 'Select Voice'}
            </Text>
          </TouchableOpacity>

          {showVoicePicker && (
            <View style={[styles.voiceList, isDarkMode && styles.darkVoiceList]}>
              {availableVoices.map((voice) => (
                <TouchableOpacity
                  key={voice.identifier}
                  style={[
                    styles.voiceItem,
                    selectedVoice === voice.identifier && styles.selectedVoice,
                    isDarkMode && styles.darkVoiceItem,
                  ]}
                  onPress={() => handleVoiceSelect(voice.identifier)}>
                  <Text style={[styles.voiceItemText, isDarkMode && styles.darkText]}>
                    {voice.name} ({voice.language})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  voiceButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
  },
  darkButton: {
    backgroundColor: '#2a2a2a',
  },
  voiceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  voiceList: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxHeight: 200,
  },
  darkVoiceList: {
    backgroundColor: '#2a2a2a',
  },
  voiceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkVoiceItem: {
    borderBottomColor: '#3a3a3a',
  },
  selectedVoice: {
    backgroundColor: '#e0e0e0',
  },
  voiceItemText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});