
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  accuracy?: number;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface DistanceFilter {
  radius: number;
  unit: 'miles' | 'kilometers';
}
