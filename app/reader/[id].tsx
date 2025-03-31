import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { ChevronLeft, ChevronRight, Play, Pause, Store as Stop, Bookmark, List } from 'lucide-react-native';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showParagraphList, setShowParagraphList] = useState(false);
  const isPlayingRef = useRef(false);
  const currentParagraphRef = useRef(0);
  
  const {
    documents,
    currentDocument,
    setCurrentDocument,
    setCurrentParagraph,
    toggleBookmark,
  } = useDocumentStore();
  
  const {
    fontSize,
    isDarkMode,
    autoAdvance,
  } = useSettingsStore();

  useEffect(() => {
    setCurrentDocument(id as string);
    return () => {
      if (Platform.OS === 'web') {
        window.speechSynthesis?.cancel();
      } else {
        Speech.stop();
      }
    };
  }, [id, setCurrentDocument]);

  const handleParagraphDone = async () => {
    if (!currentDocument) return;

    if (autoAdvance && currentParagraphRef.current < currentDocument.content.length - 1 && isPlayingRef.current) {
      currentParagraphRef.current += 1;
      setCurrentParagraph(currentDocument.id, currentParagraphRef.current);
      speakParagraph();
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const speakParagraph = async () => {
    if (!currentDocument) return;
    
    const paragraph = currentDocument.content[currentParagraphRef.current];

    if (Platform.OS === 'web') {
      // Use Web Speech API for web platform
      const utterance = new SpeechSynthesisUtterance(paragraph);
      
      utterance.onend = () => {
        handleParagraphDone();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Use Expo Speech API for native platforms
      try {
        await Speech.speak(paragraph, {
          onDone: () => {
            handleParagraphDone();
          }
        });
      } catch (error) {
        console.error('Speech error:', error);
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      if (Platform.OS === 'web') {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      if (!currentDocument) return;
      setIsPlaying(true);
      isPlayingRef.current = true;
      currentParagraphRef.current = currentDocument.currentParagraph;
      speakParagraph();
    }
  };

  const stopPlayback = async () => {
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
    } else {
      await Speech.stop();
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const handlePrevious = () => {
    if (!currentDocument || currentDocument.currentParagraph === 0) return;
    const newParagraph = currentDocument.currentParagraph - 1;
    setCurrentParagraph(currentDocument.id, newParagraph);
    currentParagraphRef.current = newParagraph;
    stopPlayback();
  };

  const handleNext = () => {
    if (!currentDocument || currentDocument.currentParagraph === currentDocument.content.length - 1) return;
    const newParagraph = currentDocument.currentParagraph + 1;
    setCurrentParagraph(currentDocument.id, newParagraph);
    currentParagraphRef.current = newParagraph;
    stopPlayback();
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Stack.Screen 
        options={{
          title: currentDocument.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleBookmark(currentDocument.id, currentDocument.currentParagraph)}
              style={{ marginRight: 15 }}>
              <Bookmark
                size={24}
                color={
                  currentDocument.bookmarks.includes(currentDocument.currentParagraph)
                    ? '#007AFF'
                    : isDarkMode
                    ? '#fff'
                    : '#000'
                }
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}>
        <Text
          style={[
            styles.paragraph,
            { fontSize },
            isDarkMode && styles.darkText,
          ]}>
          {currentDocument.content[currentDocument.currentParagraph]}
        </Text>
        
        <Text style={[styles.progress, isDarkMode && styles.darkText]}>
          {currentDocument.currentParagraph + 1} of {currentDocument.content.length}
        </Text>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentDocument.currentParagraph === 0 && styles.disabledButton,
            isDarkMode && styles.darkButton
          ]}
          disabled={currentDocument.currentParagraph === 0}
          onPress={handlePrevious}>
          <ChevronLeft
            size={32}
            color={
              currentDocument.currentParagraph === 0
                ? '#8E8E93'
                : isDarkMode
                ? '#fff'
                : '#000'
            }
          />
        </TouchableOpacity>

        <View style={styles.playbackControls}>
          <TouchableOpacity 
            style={[styles.playButton, isDarkMode && styles.darkButton]} 
            onPress={togglePlayback}>
            {isPlaying ? (
              <Pause size={32} color={isDarkMode ? '#fff' : '#000'} />
            ) : (
              <Play size={32} color={isDarkMode ? '#fff' : '#000'} />
            )}
          </TouchableOpacity>
          
          {isPlaying && (
            <TouchableOpacity 
              style={[styles.stopButton, isDarkMode && styles.darkButton]}
              onPress={stopPlayback}>
              <Stop size={32} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentDocument.currentParagraph === currentDocument.content.length - 1 && styles.disabledButton,
            isDarkMode && styles.darkButton
          ]}
          disabled={currentDocument.currentParagraph === currentDocument.content.length - 1}
          onPress={handleNext}>
          <ChevronRight
            size={32}
            color={
              currentDocument.currentParagraph === currentDocument.content.length - 1
                ? '#8E8E93'
                : isDarkMode
                ? '#fff'
                : '#000'
            }
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.listButton, isDarkMode && styles.darkButton]}
        onPress={() => setShowParagraphList(!showParagraphList)}>
        <List size={24} color={isDarkMode ? '#fff' : '#000'} />
      </TouchableOpacity>

      {showParagraphList && (
        <ScrollView
          style={[styles.paragraphList, isDarkMode && styles.darkParagraphList]}>
          {currentDocument.content.map((paragraph, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paragraphItem,
                currentDocument.currentParagraph === index && styles.activeParagraph,
                isDarkMode && styles.darkParagraphItem,
              ]}
              onPress={() => {
                setCurrentParagraph(currentDocument.id, index);
                setShowParagraphList(false);
              }}>
              <Text
                style={[
                  styles.paragraphItemText,
                  isDarkMode && styles.darkText,
                ]}
                numberOfLines={2}>
                {paragraph}
              </Text>
              {currentDocument.bookmarks.includes(index) && (
                <Bookmark size={16} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  paragraph: {
    fontFamily: 'Inter_400Regular',
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 20,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  progress: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  disabledButton: {
    opacity: 0.5,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  stopButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  darkButton: {
    backgroundColor: '#2a2a2a',
  },
  listButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
  },
  paragraphList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 20,
  },
  darkParagraphList: {
    backgroundColor: '#1a1a1a',
  },
  paragraphItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkParagraphItem: {
    borderBottomColor: '#2a2a2a',
  },
  activeParagraph: {
    backgroundColor: '#f5f5f5',
  },
  paragraphItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginRight: 10,
  },
  darkText: {
    color: '#fff',
  },
});