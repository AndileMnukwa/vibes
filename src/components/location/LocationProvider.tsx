
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { LocationData, DistanceFilter } from '@/types/location';

interface LocationContextType {
  userLocation: LocationData | null;
  distanceFilter: DistanceFilter;
  setDistanceFilter: (filter: DistanceFilter) => void;
  requestLocation: () => void;
  clearLocation: () => void;
  locationLoading: boolean;
  locationError: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { 
    location, 
    loading, 
    error, 
    requestLocation, 
    clearLocation 
  } = useGeolocation();
  
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>({
    radius: 25,
    unit: 'miles',
  });

  return (
    <LocationContext.Provider
      value={{
        userLocation: location,
        distanceFilter,
        setDistanceFilter,
        requestLocation,
        clearLocation,
        locationLoading: loading,
        locationError: error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
