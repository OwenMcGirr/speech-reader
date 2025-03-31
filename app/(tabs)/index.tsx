import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Upload, Book, Type, X } from 'lucide-react-native';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function LibraryScreen() {
  const router = useRouter();
  const { documents, addDocument } = useDocumentStore();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [documentName, setDocumentName] = useState('');

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
      });

      if (result.assets && result.assets[0]) {
        const { uri, name } = result.assets[0];
        const content = await FileSystem.readAsStringAsync(uri);
        const paragraphs = content.split('\n\n').filter(Boolean);
        addDocument(name, paragraphs);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  }, [addDocument]);

  const handleTextSubmit = () => {
    if (textContent.trim() && documentName.trim()) {
      const paragraphs = textContent.split('\n\n').filter(Boolean);
      addDocument(documentName, paragraphs);
      setTextContent('');
      setDocumentName('');
      setShowTextInput(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>My Documents</Text>
      
      <ScrollView style={styles.documentList}>
        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.documentItem, isDarkMode && styles.darkDocumentItem]}
            onPress={() => router.push(`/reader/${doc.id}`)}>
            <Book size={24} color={isDarkMode ? '#fff' : '#000'} />
            <Text style={[styles.documentName, isDarkMode && styles.darkText]}>
              {doc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, styles.importButton]} 
          onPress={pickDocument}>
          <Upload size={24} color="#fff" />
          <Text style={styles.addButtonText}>Import File</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, styles.pasteButton]} 
          onPress={() => setShowTextInput(true)}>
          <Type size={24} color="#fff" />
          <Text style={styles.addButtonText}>Paste Text</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTextInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTextInput(false)}>
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            isDarkMode && styles.darkModalContent
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode && styles.darkText
              ]}>Add Text Document</Text>
              <TouchableOpacity
                onPress={() => setShowTextInput(false)}
                style={styles.closeButton}>
                <X size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.nameInput,
                isDarkMode && styles.darkInput,
                isDarkMode && styles.darkText
              ]}
              placeholder="Document name"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={documentName}
              onChangeText={setDocumentName}
            />

            <TextInput
              style={[
                styles.textInput,
                isDarkMode && styles.darkInput,
                isDarkMode && styles.darkText
              ]}
              multiline
              placeholder="Paste your text here..."
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={textContent}
              onChangeText={setTextContent}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!textContent.trim() || !documentName.trim()) && styles.disabledButton
              ]}
              onPress={handleTextSubmit}
              disabled={!textContent.trim() || !documentName.trim()}>
              <Text style={styles.submitButtonText}>Create Document</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  darkText: {
    color: '#fff',
  },
  documentList: {
    flex: 1,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  darkDocumentItem: {
    backgroundColor: '#2a2a2a',
  },
  documentName: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  importButton: {
    backgroundColor: '#007AFF',
  },
  pasteButton: {
    backgroundColor: '#34C759',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 5,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  textInput: {
    height: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  darkInput: {
    borderColor: '#404040',
    backgroundColor: '#1a1a1a',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});