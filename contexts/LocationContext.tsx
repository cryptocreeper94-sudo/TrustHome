import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface LocationContextValue {
  permissionStatus: Location.PermissionStatus | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  currentLocation: LocationCoords | null;
  isTracking: boolean;
  safetyModeActive: boolean;
  startSafetyMode: (reason?: string) => void;
  stopSafetyMode: () => void;
  toggleSafetyMode: () => void;
  refreshLocation: () => Promise<LocationCoords | null>;
  safetyReason: string;
  locationEnabled: boolean;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const SAFETY_MODE_KEY = 'trusthome_safety_mode';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [safetyModeActive, setSafetyModeActive] = useState(false);
  const [safetyReason, setSafetyReason] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const hasPermission = permissionStatus === Location.PermissionStatus.GRANTED;
  const locationEnabled = hasPermission && Platform.OS !== 'web' || (Platform.OS === 'web' && !!navigator?.geolocation);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (navigator?.geolocation) {
        setPermissionStatus(Location.PermissionStatus.UNDETERMINED);
      }
    } else {
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        setPermissionStatus(status);
      }).catch(() => {});
    }

    AsyncStorage.getItem(SAFETY_MODE_KEY).then((val) => {
      if (val === 'true') {
        setSafetyModeActive(true);
      }
    }).catch(() => {});
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissionStatus(Location.PermissionStatus.GRANTED);
              resolve(true);
            },
            () => {
              setPermissionStatus(Location.PermissionStatus.DENIED);
              resolve(false);
            }
          );
        });
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === Location.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  }, []);

  const refreshLocation = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: LocationCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              };
              setCurrentLocation(coords);
              setPermissionStatus(Location.PermissionStatus.GRANTED);
              resolve(coords);
            },
            () => resolve(null)
          );
        });
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      };
      setCurrentLocation(coords);
      return coords;
    } catch {
      return null;
    }
  }, [hasPermission, requestPermission]);

  const startTracking = useCallback(async () => {
    if (watchRef.current) return;

    try {
      if (Platform.OS === 'web') {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
        watchRef.current = { remove: () => navigator.geolocation.clearWatch(watchId) } as any;
        setIsTracking(true);
        return;
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
        (loc) => {
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            timestamp: loc.timestamp,
          });
        }
      );

      watchRef.current = sub;
      setIsTracking(true);
    } catch {}
  }, [hasPermission, requestPermission]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startSafetyMode = useCallback(async (reason?: string) => {
    setSafetyModeActive(true);
    setSafetyReason(reason || 'Showing / Open House');
    AsyncStorage.setItem(SAFETY_MODE_KEY, 'true').catch(() => {});

    const granted = await requestPermission();
    if (granted) {
      await refreshLocation();
      await startTracking();
    }
  }, [requestPermission, refreshLocation, startTracking]);

  const stopSafetyMode = useCallback(() => {
    setSafetyModeActive(false);
    setSafetyReason('');
    AsyncStorage.setItem(SAFETY_MODE_KEY, 'false').catch(() => {});
    stopTracking();
  }, [stopTracking]);

  const toggleSafetyMode = useCallback(() => {
    if (safetyModeActive) {
      stopSafetyMode();
    } else {
      startSafetyMode();
    }
  }, [safetyModeActive, startSafetyMode, stopSafetyMode]);

  useEffect(() => {
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
      }
    };
  }, []);

  const value = useMemo(() => ({
    permissionStatus,
    hasPermission,
    requestPermission,
    currentLocation,
    isTracking,
    safetyModeActive,
    startSafetyMode,
    stopSafetyMode,
    toggleSafetyMode,
    refreshLocation,
    safetyReason,
    locationEnabled,
  }), [permissionStatus, hasPermission, requestPermission, currentLocation, isTracking, safetyModeActive, startSafetyMode, stopSafetyMode, toggleSafetyMode, refreshLocation, safetyReason, locationEnabled]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
