import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDocumentStore } from '@/store/useDocumentStore';

export default function RootLayout() {
  useFrameworkReady();
  const loadDocuments = useDocumentStore(state => state.loadDocuments);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      loadDocuments();
    }
  }, [fontsLoaded, loadDocuments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="reader/[id]" 
          options={{
            headerShown: true,
            presentation: 'card',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}