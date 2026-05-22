'use client';

// ============================================================================
// USE LOCATION PICKER — Phase C
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/use-location-picker.ts
//
// Browser Geolocation API hook untuk quickstart location di setup wizard.
// Returns lat/lng + generates embed URL untuk iframe preview.
//
// Render priority di storefront:
//   1. contactMapUrl (embed manual — Google Business Profile)
//   2. lat/lng koordinat → generate embed URL
//   3. Tidak keduanya → hide map section
//
// Geolocation requires:
//   - HTTPS (production) or http://localhost (dev whitelist)
//   - User permission grant on first call
//
// Error states surfaced to UI:
//   - permission_denied → "Location permission denied"
//   - unavailable → "Location service unavailable"
//   - timeout → "Location request timed out"
// ============================================================================

import { useState, useCallback } from 'react';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export type LocationError =
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | null;

export interface UseLocationPickerReturn {
  coords: LocationCoords | null;
  isLoading: boolean;
  error: LocationError;
  requestLocation: () => void;
  setCoordsManually: (coords: LocationCoords) => void;
  clearLocation: () => void;
  getEmbedUrl: () => string | null;
}

export function useLocationPicker(
  initialCoords?: LocationCoords | null,
): UseLocationPickerReturn {
  const [coords, setCoords] = useState<LocationCoords | null>(
    initialCoords ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('unavailable');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('permission_denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('unavailable');
            break;
          case err.TIMEOUT:
            setError('timeout');
            break;
          default:
            setError('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  const setCoordsManually = useCallback((newCoords: LocationCoords) => {
    setCoords(newCoords);
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError(null);
  }, []);

  const getEmbedUrl = useCallback((): string | null => {
    if (!coords) return null;
    return `https://www.google.com/maps/embed?q=${coords.lat},${coords.lng}&zoom=16&output=embed`;
  }, [coords]);

  return {
    coords,
    isLoading,
    error,
    requestLocation,
    setCoordsManually,
    clearLocation,
    getEmbedUrl,
  };
}
