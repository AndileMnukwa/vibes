
import { useState, useEffect, useCallback } from 'react';
import type { LocationData, LocationPermission } from '@/types/location';

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permission, setPermission] = useState<LocationPermission>({
    granted: false,
    denied: false,
    prompt: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        });
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // Reverse geocode to get city/state
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationData.latitude}&longitude=${locationData.longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const geocodeData = await response.json();
          locationData.city = geocodeData.city;
          locationData.state = geocodeData.principalSubdivision;
          locationData.country = geocodeData.countryName;
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
      }

      setLocation(locationData);
      setPermission({ granted: true, denied: false, prompt: false });
    } catch (err) {
      const error = err as GeolocationPositionError;
      setPermission({ 
        granted: false, 
        denied: error.code === error.PERMISSION_DENIED,
        prompt: error.code !== error.PERMISSION_DENIED 
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setPermission({ granted: false, denied: false, prompt: true });
    setError(null);
  }, []);

  useEffect(() => {
    // Check if we have cached location in localStorage
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        setLocation(parsed);
        setPermission({ granted: true, denied: false, prompt: false });
      } catch (err) {
        console.warn('Failed to parse cached location');
      }
    }
  }, []);

  useEffect(() => {
    // Cache location when it changes
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location));
    }
  }, [location]);

  return {
    location,
    permission,
    loading,
    error,
    requestLocation,
    clearLocation,
  };
};
