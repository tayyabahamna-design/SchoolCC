import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useVisitSession } from '@/contexts/visit-session';
import { useAuth } from '@/contexts/auth';
import { MapPin, Navigation, Clock, School, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { realSchools } from '@/data/realData';

const getAllSchools = () => realSchools.map(school => `${school.name.toUpperCase()} (${school.emisNumber})`);

interface StartVisitModalProps {
  open: boolean;
  onClose: () => void;
  onVisitStarted?: () => void;
}

export function StartVisitModal({ open, onClose, onVisitStarted }: StartVisitModalProps) {
  const { user } = useAuth();
  const { startVisit, isLoading, currentLocation, locationError, requestLocationPermission } = useVisitSession();
  
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');

  const getSchools = (): string[] => {
    const allSchools = getAllSchools();
    if (user?.role === 'AEO' && user?.assignedSchools && user.assignedSchools.length > 0) {
      return allSchools.filter((schoolDisplay: string) => 
        user.assignedSchools!.some((assignedName: string) => 
          schoolDisplay.toUpperCase().trim().startsWith(assignedName.toUpperCase().trim())
        )
      );
    }
    return allSchools;
  };

  const schools = getSchools();
  const filteredSchools = schools.filter((school: string) =>
    school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setGpsStatus('checking');
      requestLocationPermission().then((location) => {
        if (location) {
          setGpsStatus('available');
        } else {
          setGpsStatus('unavailable');
        }
      });
    }
  }, [open, requestLocationPermission]);

  useEffect(() => {
    if (locationError) {
      setGpsStatus('error');
    }
  }, [locationError]);

  const handleStartVisit = async () => {
    if (!selectedSchool) return;

    const manualLocation = showManualLocation && manualLatitude && manualLongitude
      ? { latitude: manualLatitude, longitude: manualLongitude, source: 'manual' as const }
      : undefined;

    const session = await startVisit(selectedSchool, undefined, manualLocation);
    if (session) {
      onVisitStarted?.();
      onClose();
    }
  };

  const handleSelectSchool = (school: string) => {
    setSelectedSchool(school);
    setSearchQuery(school);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Start School Visit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select School</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a school..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedSchool !== e.target.value) {
                    setSelectedSchool('');
                  }
                }}
                className="pl-10"
                data-testid="input-search-school"
              />
            </div>
            {searchQuery && !selectedSchool && filteredSchools.length > 0 && (
              <Card className="mt-2 max-h-40 overflow-y-auto">
                {filteredSchools.slice(0, 5).map((school: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSchool(school)}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                    data-testid={`option-school-${index}`}
                  >
                    {school}
                  </button>
                ))}
              </Card>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                GPS Location
              </span>
              {gpsStatus === 'checking' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking...
                </span>
              )}
              {gpsStatus === 'available' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Available
                </span>
              )}
              {(gpsStatus === 'unavailable' || gpsStatus === 'error') && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unavailable
                </span>
              )}
            </div>

            {currentLocation && gpsStatus === 'available' && (
              <div className="text-xs text-muted-foreground">
                Lat: {parseFloat(currentLocation.latitude).toFixed(6)}, 
                Lng: {parseFloat(currentLocation.longitude).toFixed(6)}
              </div>
            )}

            {(gpsStatus === 'unavailable' || gpsStatus === 'error') && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {locationError || 'GPS is not available. You can enter location manually.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualLocation(!showManualLocation)}
                  data-testid="button-toggle-manual-location"
                >
                  {showManualLocation ? 'Hide Manual Entry' : 'Enter Manually'}
                </Button>
              </div>
            )}

            {showManualLocation && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <label className="text-xs text-muted-foreground">Latitude</label>
                  <Input
                    type="text"
                    placeholder="e.g., 33.6844"
                    value={manualLatitude}
                    onChange={(e) => setManualLatitude(e.target.value)}
                    data-testid="input-manual-latitude"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Longitude</label>
                  <Input
                    type="text"
                    placeholder="e.g., 73.0479"
                    value={manualLongitude}
                    onChange={(e) => setManualLongitude(e.target.value)}
                    data-testid="input-manual-longitude"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Visit will start tracking when you click "Start Visit"</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-start-visit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartVisit}
              disabled={!selectedSchool || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-start-visit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Visit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
