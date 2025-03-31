import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

interface Document {
  id: string;
  name: string;
  content: string[];
  currentParagraph: number;
  bookmarks: number[];
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  addDocument: (name: string, content: string[]) => void;
  setCurrentDocument: (id: string) => void;
  setCurrentParagraph: (id: string, paragraph: number) => void;
  toggleBookmark: (id: string, paragraph: number) => void;
  loadDocuments: () => Promise<void>;
}

const STORAGE_KEY = '@speech_reader_documents';

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loadDocuments: async () => {
    try {
      const storedDocuments = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedDocuments) {
        const documents = JSON.parse(storedDocuments);
        set({ documents });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  },
  addDocument: (name, content) =>
    set((state) => {
      const newDocuments = [
        ...state.documents,
        {
          id: Date.now().toString(),
          name,
          content,
          currentParagraph: 0,
          bookmarks: [],
        },
      ];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDocuments));
      return { documents: newDocuments };
    }),
  setCurrentDocument: (id) =>
    set((state) => ({
      currentDocument: state.documents.find((doc) => doc.id === id) || null,
    })),
  setCurrentParagraph: (id, paragraph) =>
    set((state) => {
      const updatedDocuments = state.documents.map((doc) =>
        doc.id === id ? { ...doc, currentParagraph: paragraph } : doc
      );
      
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
      
      return {
        documents: updatedDocuments,
        currentDocument: updatedDocuments.find((doc) => doc.id === id) || null,
      };
    }),
  toggleBookmark: (id, paragraph) =>
    set((state) => {
      const updatedDocuments = state.documents.map((doc) => {
        if (doc.id === id) {
          const bookmarks = doc.bookmarks.includes(paragraph)
            ? doc.bookmarks.filter((b) => b !== paragraph)
            : [...doc.bookmarks, paragraph];
          return { ...doc, bookmarks };
        }
        return doc;
      });

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));

      return {
        documents: updatedDocuments,
        currentDocument: updatedDocuments.find((doc) => doc.id === id) || null,
      };
    }),
}));