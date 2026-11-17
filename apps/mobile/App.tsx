import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CampusProvider, useCampus } from './src/context/CampusContext';
import { THEME } from './src/constants/theme';
import { BottomTabBar } from './src/components/BottomTabBar';

import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LocationDetailScreen } from './src/screens/LocationDetailScreen';
import { MapScreen } from './src/screens/MapScreen';
import { GuidanceScreen } from './src/screens/GuidanceScreen';
import { ArCameraScreen } from './src/screens/ArCameraScreen';
import { QrScannerScreen } from './src/screens/QrScannerScreen';
import { DirectoryScreen } from './src/screens/DirectoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const MainNavigator: React.FC = () => {
  const { currentScreen, navigate } = useCampus();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'location_detail':
        return <LocationDetailScreen />;
      case 'map':
        return <MapScreen />;
      case 'guidance':
        return <GuidanceScreen />;
      case 'ar_camera':
        return <ArCameraScreen />;
      case 'qr_scanner':
        return <QrScannerScreen />;
      case 'directory':
        return <DirectoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isTabScreen = ['home', 'map', 'search', 'directory', 'profile'].includes(currentScreen);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderActiveScreen()}</View>
      {isTabScreen ? (
        <BottomTabBar
          currentScreen={currentScreen}
          onTabSelect={(tab) => navigate(tab)}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <CampusProvider>
        <MainNavigator />
      </CampusProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
  },
});
