import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth';
import { toast } from 'sonner';

export interface VisitSession {
  id: string;
  aeoId: string;
  aeoName: string;
  schoolId?: string;
  schoolName: string;
  startTimestamp: Date;
  startLatitude?: string;
  startLongitude?: string;
  startLocationSource: string;
  endTimestamp?: Date;
  endLatitude?: string;
  endLongitude?: string;
  endLocationSource?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  monitoringVisitId?: string;
  mentoringVisitId?: string;
  createdAt: Date;
}

interface LocationData {
  latitude: string;
  longitude: string;
  source: 'auto' | 'manual';
}

interface VisitSessionContextType {
  activeSession: VisitSession | null;
  isLoading: boolean;
  currentLocation: LocationData | null;
  locationError: string | null;
  startVisit: (schoolName: string, schoolId?: string, manualLocation?: LocationData) => Promise<VisitSession | null>;
  endVisit: (manualLocation?: LocationData) => Promise<VisitSession | null>;
  cancelVisit: () => Promise<void>;
  attachFormToSession: (formType: 'monitoring' | 'mentoring', formId: string) => Promise<void>;
  refreshActiveSession: () => Promise<void>;
  requestLocationPermission: () => Promise<LocationData | null>;
}

const VisitSessionContext = createContext<VisitSessionContextType | null>(null);

export function VisitSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<VisitSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<LocationData | null> => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            source: 'auto'
          };
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          let message = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          setLocationError(message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  const refreshActiveSession = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/visit-sessions/active/${user.id}`);
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
      }
    } catch (error) {
      console.error('Failed to refresh active session:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshActiveSession();
    }
  }, [user?.id, refreshActiveSession]);

  const startVisit = useCallback(async (
    schoolName: string,
    schoolId?: string,
    manualLocation?: LocationData
  ): Promise<VisitSession | null> => {
    if (!user) {
      toast.error('You must be logged in to start a visit');
      return null;
    }

    if (activeSession) {
      toast.error('You already have an active visit. Please end it first.');
      return null;
    }

    setIsLoading(true);
    try {
      let location = manualLocation;
      if (!location) {
        location = await requestLocationPermission() || undefined;
      }

      const sessionData = {
        aeoId: user.id,
        aeoName: user.name,
        schoolId,
        schoolName,
        startLatitude: location?.latitude,
        startLongitude: location?.longitude,
        startLocationSource: location?.source || 'manual'
      };

      const response = await fetch('/api/visit-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to start visit');
      }

      const session = await response.json();
      setActiveSession(session);
      toast.success(`Visit started at ${schoolName}`);
      return session;
    } catch (error: any) {
      toast.error(error.message || 'Failed to start visit');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSession, requestLocationPermission]);

  const endVisit = useCallback(async (manualLocation?: LocationData): Promise<VisitSession | null> => {
    if (!activeSession) {
      toast.error('No active visit to end');
      return null;
    }

    setIsLoading(true);
    try {
      let location = manualLocation;
      if (!location) {
        location = await requestLocationPermission() || undefined;
      }

      const response = await fetch(`/api/visit-sessions/${activeSession.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endLatitude: location?.latitude,
          endLongitude: location?.longitude,
          endLocationSource: location?.source || 'manual'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to end visit');
      }

      const session = await response.json();
      setActiveSession(null);
      toast.success('Visit completed successfully');
      return session;
    } catch (error: any) {
      toast.error(error.message || 'Failed to end visit');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, requestLocationPermission]);

  const cancelVisit = useCallback(async () => {
    if (!activeSession) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/visit-sessions/${activeSession.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to cancel visit');
      }

      setActiveSession(null);
      toast.success('Visit cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel visit');
    } finally {
      setIsLoading(false);
    }
  }, [activeSession]);

  const attachFormToSession = useCallback(async (
    formType: 'monitoring' | 'mentoring',
    formId: string
  ) => {
    if (!activeSession) {
      return;
    }

    try {
      const updateData = formType === 'monitoring'
        ? { monitoringVisitId: formId }
        : { mentoringVisitId: formId };

      const response = await fetch(`/api/visit-sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to attach form to session');
      }

      const session = await response.json();
      setActiveSession(session);
    } catch (error: any) {
      console.error('Failed to attach form to session:', error);
    }
  }, [activeSession]);

  return (
    <VisitSessionContext.Provider
      value={{
        activeSession,
        isLoading,
        currentLocation,
        locationError,
        startVisit,
        endVisit,
        cancelVisit,
        attachFormToSession,
        refreshActiveSession,
        requestLocationPermission
      }}
    >
      {children}
    </VisitSessionContext.Provider>
  );
}

export function useVisitSession() {
  const context = useContext(VisitSessionContext);
  if (!context) {
    throw new Error('useVisitSession must be used within a VisitSessionProvider');
  }
  return context;
}
