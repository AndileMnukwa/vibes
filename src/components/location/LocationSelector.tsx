
import React, { useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLocation } from './LocationProvider';

export function LocationSelector() {
  const {
    userLocation,
    distanceFilter,
    setDistanceFilter,
    requestLocation,
    clearLocation,
    locationLoading,
    locationError,
  } = useLocation();

  const [manualLocation, setManualLocation] = useState('');

  const handleDistanceChange = (radius: number) => {
    setDistanceFilter({ ...distanceFilter, radius });
  };

  const formatLocationDisplay = () => {
    if (!userLocation) return 'Location not set';
    
    if (userLocation.city && userLocation.state) {
      return `${userLocation.city}, ${userLocation.state}`;
    }
    
    return `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">{formatLocationDisplay()}</span>
          {userLocation && (
            <Badge variant="secondary" className="ml-1">
              {distanceFilter.radius} {distanceFilter.unit}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Location Settings</h4>
            
            {!userLocation ? (
              <div className="space-y-3">
                <Button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="w-full"
                  size="sm"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {locationLoading ? 'Getting location...' : 'Use current location'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Enter city, state"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!manualLocation.trim()}
                  >
                    Set Location
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatLocationDisplay()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLocation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Radius</label>
                  <div className="flex gap-2">
                    {[5, 10, 25, 50, 100].map((radius) => (
                      <Button
                        key={radius}
                        variant={distanceFilter.radius === radius ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDistanceChange(radius)}
                      >
                        {radius}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={distanceFilter.unit === 'miles' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDistanceFilter({ ...distanceFilter, unit: 'miles' })}
                    >
                      Miles
                    </Button>
                    <Button
                      variant={distanceFilter.unit === 'kilometers' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDistanceFilter({ ...distanceFilter, unit: 'kilometers' })}
                    >
                      KM
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {locationError && (
              <p className="text-sm text-destructive">{locationError}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
