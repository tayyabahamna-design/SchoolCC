import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useActivities } from '@/contexts/activities';
import { useVisitSession } from '@/contexts/visit-session';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin, CheckCircle, Clock, Eye, Search, X, Navigation, Plus, ClipboardList, Users2, Building2, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StartVisitModal } from '@/components/StartVisitModal';
import { ActiveVisitBanner } from '@/components/ActiveVisitBanner';
import MonitoringVisitForm from './MonitoringVisitForm';
import MentoringVisitForm from './MentoringVisitForm';
import OfficeVisitForm from './OfficeVisitForm';
import OtherActivityForm from './OtherActivityForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analytics } from '@/lib/analytics';

interface NormalizedVisit {
  id: string;
  schoolName: string;
  visitType: 'monitoring' | 'mentoring' | 'office';
  visitDate: Date;
  status: 'planned' | 'in_progress' | 'completed';
  photoCount: number;
  voiceNotesCount: number;
  gpsLocation?: { lat: number; lng: number };
  gpsStartLocation?: { lat: number; lng: number };
  gpsEndLocation?: { lat: number; lng: number };
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export default function SchoolVisits() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { monitoringVisits, mentoringVisits, officeVisits } = useActivities();
  const { activeSession, endVisit } = useVisitSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartVisitModal, setShowStartVisitModal] = useState(false);
  const [showFormType, setShowFormType] = useState<'monitoring' | 'mentoring' | 'office' | 'other' | null>(null);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);

  // Track page view
  useEffect(() => {
    if (user) {
      analytics.navigation.pageViewed('school_visits', user.role);
    }
  }, [user?.role]);

  // Combine and normalize all visits from the activities context
  // MUST call useMemo before any conditional returns to satisfy Rules of Hooks
  const userVisits = useMemo(() => {
    if (!user) return [];
    const visits: NormalizedVisit[] = [];

    // Filter by user for AEO role, show all for leadership
    const filterByUser = user.role === 'AEO';

    // Normalize monitoring visits (cast to any to access API fields)
    (monitoringVisits as any[])
      .filter(v => !filterByUser || v.aeoId === user.id)
      .forEach(v => {
        visits.push({
          id: v.id,
          schoolName: v.schoolName,
          visitType: 'monitoring',
          visitDate: new Date(v.visitDate),
          status: v.status === 'submitted' ? 'completed' : 'planned',
          photoCount: v.evidence?.filter((e: any) => e.type === 'photo').length || 0,
          voiceNotesCount: v.evidence?.filter((e: any) => e.type === 'voice').length || 0,
          startTime: v.arrivalTime,
          endTime: v.departureTime,
        });
      });

    // Normalize mentoring visits
    (mentoringVisits as any[])
      .filter(v => !filterByUser || v.aeoId === user.id)
      .forEach(v => {
        visits.push({
          id: v.id,
          schoolName: v.schoolName,
          visitType: 'mentoring',
          visitDate: new Date(v.visitDate),
          status: v.status === 'submitted' ? 'completed' : 'planned',
          photoCount: v.evidence?.filter((e: any) => e.type === 'photo').length || 0,
          voiceNotesCount: v.evidence?.filter((e: any) => e.type === 'voice').length || 0,
          startTime: v.arrivalTime,
          endTime: v.departureTime,
        });
      });

    // Normalize office visits
    (officeVisits as any[])
      .filter(v => !filterByUser || v.aeoId === user.id)
      .forEach(v => {
        visits.push({
          id: v.id,
          schoolName: 'Office Visit',
          visitType: 'office',
          visitDate: new Date(v.visitDate),
          status: v.status === 'submitted' ? 'completed' : 'planned',
          photoCount: v.evidence?.filter((e: any) => e.type === 'photo').length || 0,
          voiceNotesCount: v.evidence?.filter((e: any) => e.type === 'voice').length || 0,
          startTime: v.arrivalTime,
          endTime: v.departureTime,
        });
      });

    // Sort by date descending
    return visits.sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime());
  }, [monitoringVisits, mentoringVisits, officeVisits, user.id, user.role]);
  
  const filteredVisits = userVisits.filter((visit) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      visit.schoolName.toLowerCase().includes(query) ||
      visit.visitType.toLowerCase().includes(query) ||
      visit.status.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planned':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'monitoring':
        return 'bg-purple-100 text-purple-700';
      case 'mentoring':
        return 'bg-blue-100 text-blue-700';
      case 'office':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Early returns AFTER all hooks are called
  if (!user) return null;

  // Show embedded form based on selected type
  if (showFormType === 'monitoring') {
    return <MonitoringVisitForm />;
  }
  if (showFormType === 'mentoring') {
    return <MentoringVisitForm />;
  }
  if (showFormType === 'office') {
    return <OfficeVisitForm />;
  }
  if (showFormType === 'other') {
    return <OtherActivityForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Active Visit Banner for AEOs */}
      {user.role === 'AEO' && activeSession && (
        <ActiveVisitBanner 
          onOpenMonitoringForm={() => setShowFormType('monitoring')}
          onOpenMentoringForm={() => setShowFormType('mentoring')}
        />
      )}
      
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(user.role === 'CEO' ? '/ceo-dashboard' : '/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Visit History</h1>
              <p className="text-sm text-muted-foreground">View all your completed school visits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* New Visit Button for AEOs */}
            {user.role === 'AEO' && (
              <Button
                onClick={() => setShowNewVisitModal(true)}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                data-testid="button-new-visit"
              >
                <Plus className="w-4 h-4" />
                New Visit
              </Button>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground hidden lg:inline">Theme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by school, type, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              data-testid="input-search-visits"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {filteredVisits.length === 0 && searchQuery ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No visits match your search</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </Card>
        ) : userVisits.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No visits recorded yet</p>
            <p className="text-sm text-muted-foreground mt-2">Your completed visits will appear here</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVisits.map((visit) => (
              <Card
                key={visit.id}
                className="p-6 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/visit/${visit.id}`)}
                data-testid={`card-visit-${visit.id}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">School</p>
                    <p className="font-semibold text-foreground uppercase">{visit.schoolName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Visit Type</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getVisitTypeColor(visit.visitType)}`}>
                      {visit.visitType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-foreground">{visit.visitDate.toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {visit.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                      <span className={`text-xs font-medium capitalize px-2 py-1 rounded ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evidence</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{visit.photoCount} photos</span>
                      <span>•</span>
                      <span>{visit.voiceNotesCount} notes</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      data-testid={`button-view-visit-${visit.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {/* GPS Location for completed visits */}
                {visit.status === 'completed' && visit.gpsLocation && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-foreground">GPS Tracked Location:</span>
                      <span>
                        {visit.gpsLocation.lat.toFixed(6)}, {visit.gpsLocation.lng.toFixed(6)}
                      </span>
                      {visit.gpsStartLocation && visit.gpsEndLocation && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    {visit.startTime && visit.endTime && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Start: {new Date(visit.startTime).toLocaleTimeString()}</span>
                        <span>End: {new Date(visit.endTime).toLocaleTimeString()}</span>
                        {visit.duration && <span>Duration: {visit.duration} mins</span>}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Visit Type Selection Modal */}
      <Dialog open={showNewVisitModal} onOpenChange={setShowNewVisitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Visit Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              onClick={() => {
                setShowNewVisitModal(false);
                setShowStartVisitModal(true);
                setShowFormType('monitoring');
              }}
              className="justify-start gap-3 h-auto py-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              variant="outline"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Monitoring Visit</div>
                <div className="text-xs text-muted-foreground">Comprehensive school inspection and evaluation</div>
              </div>
            </Button>

            <Button
              onClick={() => {
                setShowNewVisitModal(false);
                setShowStartVisitModal(true);
                setShowFormType('mentoring');
              }}
              className="justify-start gap-3 h-auto py-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              variant="outline"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Mentoring Visit</div>
                <div className="text-xs text-muted-foreground">Teacher support and professional guidance</div>
              </div>
            </Button>

            <Button
              onClick={() => {
                setShowNewVisitModal(false);
                setShowFormType('office');
              }}
              className="justify-start gap-3 h-auto py-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              variant="outline"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Office Visit</div>
                <div className="text-xs text-muted-foreground">Administrative meetings and office work</div>
              </div>
            </Button>

            <Button
              onClick={() => {
                setShowNewVisitModal(false);
                setShowFormType('other');
              }}
              className="justify-start gap-3 h-auto py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              variant="outline"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Log Other Activity</div>
                <div className="text-xs text-muted-foreground">Record meetings, training, or other activities</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Start Visit Modal (for GPS-based visits) */}
      <StartVisitModal
        open={showStartVisitModal}
        onOpenChange={setShowStartVisitModal}
        onVisitStarted={() => {
          setShowStartVisitModal(false);
        }}
      />
    </div>
  );
}
