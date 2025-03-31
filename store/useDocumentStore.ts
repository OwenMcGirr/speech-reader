import { create } from 'zustand';

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
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  currentDocument: null,
  addDocument: (name, content) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          id: Date.now().toString(),
          name,
          content,
          currentParagraph: 0,
          bookmarks: [],
        },
      ],
    })),
  setCurrentDocument: (id) =>
    set((state) => ({
      currentDocument: state.documents.find((doc) => doc.id === id) || null,
    })),
  setCurrentParagraph: (id, paragraph) =>
    set((state) => {
      const updatedDocuments = state.documents.map((doc) =>
        doc.id === id ? { ...doc, currentParagraph: paragraph } : doc
      );
      
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

      return {
        documents: updatedDocuments,
        currentDocument: updatedDocuments.find((doc) => doc.id === id) || null,
      };
    }),
}));