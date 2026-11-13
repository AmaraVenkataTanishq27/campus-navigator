import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenType,
  RoomItem,
  FloorInfo,
  CalculatedRoute,
  UserPreferences,
  NavNode,
  QRCheckpoint,
} from '../types';
import { CampusService } from '../services/campusService';
import { NavigationService } from '../services/navigationService';
import { StorageService } from '../services/storage';

interface CampusContextType {
  currentScreen: ScreenType;
  navigate: (screen: ScreenType) => void;
  goBack: () => void;
  activeFloorLevel: string;
  setActiveFloorLevel: (level: string) => void;
  currentFloorInfo?: FloorInfo;
  selectedRoom: RoomItem | null;
  setSelectedRoom: (room: RoomItem | null) => void;
  originNode: NavNode | null;
  setOriginNode: (node: NavNode | null) => void;
  activeRoute: CalculatedRoute | null;
  setActiveRoute: (route: CalculatedRoute | null) => void;
  isNavigating: boolean;
  currentStepIndex: number;
  startNavigation: (route?: CalculatedRoute) => void;
  pauseNavigation: () => void;
  endNavigation: () => void;
  nextStep: () => void;
  prevStep: () => void;
  recalculateRoute: () => void;
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  selectRoomAndNavigate: (room: RoomItem) => void;
  startDemoRouteToAB608: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => Promise<void>;
  lastScannedCheckpoint: QRCheckpoint | null;
  setLastScannedCheckpoint: (cp: QRCheckpoint | null) => void;
}

const defaultPreferences: UserPreferences = {
  avoidStairs: false,
  wheelchairAccessible: false,
  voiceGuidance: true,
  offlineCacheReady: true,
  hapticFeedback: true,
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenStack, setScreenStack] = useState<ScreenType[]>(['home']);
  const [activeFloorLevel, setActiveFloorLevel] = useState<string>('6'); // Default to 6th floor matching reference
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [originNode, setOriginNode] = useState<NavNode | null>(null);
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [lastScannedCheckpoint, setLastScannedCheckpoint] = useState<QRCheckpoint | null>(null);

  useEffect(() => {
    // Initialize storage and load recent searches
    StorageService.init().then(() => {
      StorageService.getRecentSearches().then(setRecentSearches);
    });

    // Default origin: Southeast main lobby on floor 6
    const defOrigin = NavigationService.getNodeById('AB_F6_ENTRANCE_MAIN');
    if (defOrigin) {
      setOriginNode(defOrigin);
    }
  }, []);

  const navigate = (screen: ScreenType) => {
    setScreenStack((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setScreenStack((prev) => {
      if (prev.length <= 1) return prev;
      const newStack = [...prev];
      newStack.pop();
      const last = newStack[newStack.length - 1];
      setCurrentScreen(last);
      return newStack;
    });
  };

  const currentFloorInfo = CampusService.getFloorByLevel(activeFloorLevel);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const addRecentSearch = async (query: string) => {
    await StorageService.addRecentSearch(query);
    const updated = await StorageService.getRecentSearches();
    setRecentSearches(updated);
  };

  const selectRoomAndNavigate = (room: RoomItem) => {
    setSelectedRoom(room);
    setActiveFloorLevel(room.floorLevel);

    // Calculate route from current origin to room door
    const origin = originNode || NavigationService.getNodeById('AB_F6_ENTRANCE_MAIN');
    if (origin && room.nodeId) {
      const route = NavigationService.calculateRoute(origin.id, room.nodeId, preferences);
      if (route) {
        setActiveRoute(route);
      } else {
        // Fallback demo route if direct path not yet anchored
        const demo = NavigationService.getDemoRouteAB608();
        setActiveRoute(demo);
      }
    }
    navigate('map');
  };

  const startDemoRouteToAB608 = () => {
    const ab608 = CampusService.getRoomById('AB_608');
    if (ab608) {
      setSelectedRoom(ab608);
      setActiveFloorLevel('6');
      const route = NavigationService.getDemoRouteAB608();
      setActiveRoute(route);
      navigate('map');
    }
  };

  const startNavigation = (routeToStart?: CalculatedRoute) => {
    const route = routeToStart || activeRoute || NavigationService.getDemoRouteAB608();
    setActiveRoute(route);
    setIsNavigating(true);
    setCurrentStepIndex(0);
    navigate('guidance');
  };

  const pauseNavigation = () => {
    setIsNavigating(false);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    navigate('map');
  };

  const nextStep = () => {
    if (activeRoute && currentStepIndex < activeRoute.instructions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const recalculateRoute = () => {
    if (selectedRoom && originNode) {
      const newRoute = NavigationService.calculateRoute(
        originNode.id,
        selectedRoom.nodeId,
        preferences
      );
      if (newRoute) {
        setActiveRoute(newRoute);
        setCurrentStepIndex(0);
      }
    }
  };

  return (
    <CampusContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        activeFloorLevel,
        setActiveFloorLevel,
        currentFloorInfo,
        selectedRoom,
        setSelectedRoom,
        originNode,
        setOriginNode,
        activeRoute,
        setActiveRoute,
        isNavigating,
        currentStepIndex,
        startNavigation,
        pauseNavigation,
        endNavigation,
        nextStep,
        prevStep,
        recalculateRoute,
        preferences,
        updatePreferences,
        selectRoomAndNavigate,
        startDemoRouteToAB608,
        recentSearches,
        addRecentSearch,
        lastScannedCheckpoint,
        setLastScannedCheckpoint,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
