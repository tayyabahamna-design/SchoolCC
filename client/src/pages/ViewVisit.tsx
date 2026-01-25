import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivities, MonitoringVisitData, MentoringVisitData, OfficeVisitData } from '@/contexts/activities';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle, Mic, Camera, Clock, FileText, Navigation, Edit } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { analytics } from '@/lib/analytics';
import type { GpsTrackingPoint } from '@shared/schema';

type VisitType = 'monitoring' | 'mentoring' | 'office';

interface NormalizedVisit {
  id: string;
  type: VisitType;
  schoolName: string;
  aeoName: string;
  aeoId: string;
  visitDate: string;
  arrivalTime?: string;
  departureTime?: string;
  status: string;
  evidence: { id: string; name: string; type: string; url: string }[];
  rawData: MonitoringVisitData | MentoringVisitData | OfficeVisitData;
}

export default function ViewVisit() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { monitoringVisits, mentoringVisits, officeVisits } = useActivities();
  const [loading, setLoading] = useState(true);
  const [gpsTrail, setGpsTrail] = useState<GpsTrackingPoint[]>([]);
  const [loadingGps, setLoadingGps] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const visit = useMemo(() => {
    let found: NormalizedVisit | null = null;

    const monitoringVisit = monitoringVisits.find(v => v.id === id);
    if (monitoringVisit) {
      found = {
        id: monitoringVisit.id,
        type: 'monitoring',
        schoolName: monitoringVisit.schoolName,
        aeoName: monitoringVisit.aeoName,
        aeoId: monitoringVisit.aeoId,
        visitDate: monitoringVisit.visitDate,
        arrivalTime: monitoringVisit.arrivalTime,
        departureTime: monitoringVisit.departureTime,
        status: monitoringVisit.status,
        evidence: monitoringVisit.evidence || [],
        rawData: monitoringVisit,
      };
    }

    if (!found) {
      const mentoringVisit = mentoringVisits.find(v => v.id === id);
      if (mentoringVisit) {
        found = {
          id: mentoringVisit.id,
          type: 'mentoring',
          schoolName: mentoringVisit.schoolName,
          aeoName: mentoringVisit.aeoName,
          aeoId: mentoringVisit.aeoId,
          visitDate: mentoringVisit.visitDate,
          arrivalTime: mentoringVisit.arrivalTime,
          departureTime: mentoringVisit.departureTime,
          status: mentoringVisit.status,
          evidence: mentoringVisit.evidence || [],
          rawData: mentoringVisit,
        };
      }
    }

    if (!found) {
      const officeVisit = officeVisits.find(v => v.id === id);
      if (officeVisit) {
        found = {
          id: officeVisit.id,
          type: 'office',
          schoolName: 'Office Visit',
          aeoName: officeVisit.aeoName,
          aeoId: officeVisit.aeoId,
          visitDate: officeVisit.visitDate,
          arrivalTime: officeVisit.arrivalTime,
          departureTime: officeVisit.departureTime,
          status: officeVisit.status,
          evidence: officeVisit.evidence || [],
          rawData: officeVisit,
        };
      }
    }

    return found;
  }, [id, monitoringVisits, mentoringVisits, officeVisits]);

  useEffect(() => {
    if (monitoringVisits.length > 0 || mentoringVisits.length > 0 || officeVisits.length > 0) {
      setLoading(false);
    }
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [monitoringVisits, mentoringVisits, officeVisits]);

  // Track visit viewed
  useEffect(() => {
    if (visit && id) {
      analytics.navigation.pageViewed(`view_visit_${visit.type}`, user?.role);
    }
  }, [visit?.id, visit?.type, user?.role]);

  // Fetch GPS trail for DEO/DDEO users
  useEffect(() => {
    const fetchGpsTrail = async () => {
      if (!visit || !user) return;
      if (user.role !== 'DEO' && user.role !== 'DDEO' && user.role !== 'CEO') return;

      setLoadingGps(true);
      try {
        const response = await fetch(`/api/gps-trail/${visit.id}`);
        if (response.ok) {
          const data = await response.json();
          setGpsTrail(data.points || []);
          console.log(`Loaded ${data.pointCount} GPS points for visit ${visit.id}`);
        }
      } catch (error) {
        console.error('Failed to fetch GPS trail:', error);
      } finally {
        setLoadingGps(false);
      }
    };

    fetchGpsTrail();
  }, [visit?.id, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/school-visits')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground ml-4">Visit Not Found</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">This visit could not be found.</p>
            <Button className="mt-4" onClick={() => navigate('/school-visits')}>
              Back to Visits
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const photoCount = visit.evidence.filter(e => e.type === 'photo').length;
  const voiceNotesCount = visit.evidence.filter(e => e.type === 'voice').length;

  // Check if user is DEO/DDEO/CEO (comprehensive view) or AEO (section view)
  const isManager = user?.role === 'DEO' || user?.role === 'DDEO' || user?.role === 'CEO';

  // Monitoring Visit Sections
  const renderMonitoringBasicInfo = (data: MonitoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">School Name</p>
          <p className="font-medium text-foreground">{data.schoolName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Visit Date</p>
          <p className="font-medium text-foreground">{new Date(data.visitDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Arrival Time</p>
          <p className="font-medium text-foreground">{data.arrivalTime || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Departure Time</p>
          <p className="font-medium text-foreground">{data.departureTime || 'N/A'}</p>
        </div>
        {data.headTeacherStatus && (
          <div>
            <p className="text-sm text-muted-foreground">Head Teacher Status</p>
            <p className="font-medium text-foreground capitalize">{data.headTeacherStatus.replace(/_/g, ' ')}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderMonitoringAttendance = (data: MonitoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Attendance Data</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.teacherPresent !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Teachers Present</p>
            <p className="font-medium text-foreground">{data.teacherPresent} / {data.teacherTotal || 'N/A'}</p>
            {data.teacherPercentage !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">{data.teacherPercentage}%</p>
            )}
          </div>
        )}
        {data.studentPresent !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Students Present</p>
            <p className="font-medium text-foreground">{data.studentPresent} / {data.studentTotal || 'N/A'}</p>
            {data.studentPercentage !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">{data.studentPercentage}%</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  const renderMonitoringFacilities = (data: MonitoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Facilities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.toiletTotal !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Toilets</p>
            <p className="font-medium text-foreground">{data.toiletTotal} (Required: {data.toiletRequired || 'N/A'})</p>
          </div>
        )}
        {data.drinkingWater && (
          <div>
            <p className="text-sm text-muted-foreground">Drinking Water</p>
            <p className="font-medium text-foreground capitalize">{data.drinkingWater.replace(/_/g, ' ')}</p>
          </div>
        )}
        {data.hygieneClassrooms && (
          <div>
            <p className="text-sm text-muted-foreground">Hygiene (Classrooms)</p>
            <p className="font-medium text-foreground capitalize">{data.hygieneClassrooms}</p>
          </div>
        )}
        {data.furnitureWith !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Furniture</p>
            <p className="font-medium text-foreground">{data.furnitureWith} with / {data.furnitureWithout} without</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderMonitoringLearning = (data: MonitoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Learning Environment</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.classroomObservation && (
          <div>
            <p className="text-sm text-muted-foreground">Classroom Observation</p>
            <p className="font-medium text-foreground capitalize">{data.classroomObservation.replace(/_/g, ' ')}</p>
          </div>
        )}
        {data.teachingQuality && (
          <div>
            <p className="text-sm text-muted-foreground">Teaching Quality</p>
            <p className="font-medium text-foreground capitalize">{data.teachingQuality.replace(/_/g, ' ')}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderVoiceNotesSection = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-green-600" />
        Voice Notes ({voiceNotesCount})
      </h2>
      {voiceNotesCount > 0 ? (
        <div className="space-y-2">
          {visit.evidence.filter(e => e.type === 'voice').map((note) => (
            <div key={note.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              <Mic className="w-4 h-4 text-green-600" />
              <span className="text-sm text-foreground">{note.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No voice notes recorded</p>
      )}
    </Card>
  );

  const renderPhotosSection = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-600" />
        Photos ({photoCount})
      </h2>
      {photoCount > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visit.evidence.filter(e => e.type === 'photo').map((photo) => (
            <div key={photo.id} className="aspect-square bg-muted/30 rounded flex items-center justify-center">
              {photo.url ? (
                <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded" />
              ) : (
                <div className="text-center">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto" />
                  <span className="text-xs text-muted-foreground mt-1 block">{photo.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No photos uploaded</p>
      )}
    </Card>
  );

  const renderMonitoringDetails = (data: MonitoringVisitData) => {
    // For managers: show all sections in sequence
    if (isManager) {
      return (
        <>
          {renderMonitoringBasicInfo(data)}
          {renderMonitoringAttendance(data)}
          {renderMonitoringFacilities(data)}
          {renderMonitoringLearning(data)}
        </>
      );
    }

    // For AEO: show section by section with evidence
    const sections = [
      { label: 'Basic Info', component: renderMonitoringBasicInfo(data) },
      { label: 'Attendance', component: renderMonitoringAttendance(data) },
      { label: 'Facilities', component: renderMonitoringFacilities(data) },
      { label: 'Learning', component: renderMonitoringLearning(data) },
      { label: 'Voice Notes', component: renderVoiceNotesSection() },
      { label: 'Photos', component: renderPhotosSection() },
    ];

    return (
      <>
        {/* Section navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              {sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSection(idx)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSection === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Current section content */}
        {sections[currentSection].component}

        {/* Navigation buttons */}
        <Card className="p-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
              disabled={currentSection === sections.length - 1}
            >
              Next
            </Button>
          </div>
        </Card>
      </>
    );
  };

  // Mentoring Visit Sections
  const renderMentoringBasicInfo = (data: MentoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">School Name</p>
          <p className="font-medium text-foreground">{data.schoolName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Visit Date</p>
          <p className="font-medium text-foreground">{new Date(data.visitDate).toLocaleDateString()}</p>
        </div>
        {data.teacherName && (
          <div>
            <p className="text-sm text-muted-foreground">Teacher Name</p>
            <p className="font-medium text-foreground">{data.teacherName}</p>
          </div>
        )}
        {data.subject && (
          <div>
            <p className="text-sm text-muted-foreground">Subject</p>
            <p className="font-medium text-foreground">{data.subject}</p>
          </div>
        )}
        {data.classObserved && (
          <div>
            <p className="text-sm text-muted-foreground">Class Observed</p>
            <p className="font-medium text-foreground">{data.classObserved}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderMentoringIndicators = (data: MentoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">HOTS Indicators</h2>
      {data.indicators && data.indicators.length > 0 ? (
        <div className="space-y-2">
          {data.indicators.map((indicator, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <span className="text-sm text-foreground">{indicator.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                indicator.rating === 'proficient' ? 'bg-green-100 text-green-700' :
                indicator.rating === 'developing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {indicator.rating || 'Not Rated'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No indicators recorded</p>
      )}
    </Card>
  );

  const renderMentoringFeedback = (data: MentoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Feedback</h2>
      {data.generalFeedback && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">General Feedback</p>
          <p className="text-foreground">{data.generalFeedback}</p>
        </div>
      )}
      {data.strengthsObserved && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Strengths Observed</p>
          <p className="text-foreground">{data.strengthsObserved}</p>
        </div>
      )}
      {data.areasForImprovement && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Areas for Improvement</p>
          <p className="text-foreground">{data.areasForImprovement}</p>
        </div>
      )}
      {data.actionItems && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Action Items</p>
          <p className="text-foreground">{data.actionItems}</p>
        </div>
      )}
    </Card>
  );

  const renderMentoringDetails = (data: MentoringVisitData) => {
    // For managers: show all sections in sequence
    if (isManager) {
      return (
        <>
          {renderMentoringBasicInfo(data)}
          {renderMentoringIndicators(data)}
          {renderMentoringFeedback(data)}
        </>
      );
    }

    // For AEO: show section by section with evidence
    const sections = [
      { label: 'Basic Info', component: renderMentoringBasicInfo(data) },
      { label: 'HOTS Indicators', component: renderMentoringIndicators(data) },
      { label: 'Feedback', component: renderMentoringFeedback(data) },
      { label: 'Evidence', component: renderPhotosSection() },
    ];

    return (
      <>
        {/* Section navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              {sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSection(idx)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSection === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Current section content */}
        {sections[currentSection].component}

        {/* Navigation buttons */}
        <Card className="p-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
              disabled={currentSection === sections.length - 1}
            >
              Next
            </Button>
          </div>
        </Card>
      </>
    );
  };

  const renderOfficeDetails = (data: OfficeVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Office Visit Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Visit Date</p>
          <p className="font-medium text-foreground">{new Date(data.visitDate).toLocaleDateString()}</p>
        </div>
        {data.arrivalTime && (
          <div>
            <p className="text-sm text-muted-foreground">Arrival Time</p>
            <p className="font-medium text-foreground">{data.arrivalTime}</p>
          </div>
        )}
        {data.departureTime && (
          <div>
            <p className="text-sm text-muted-foreground">Departure Time</p>
            <p className="font-medium text-foreground">{data.departureTime}</p>
          </div>
        )}
      </div>
      {data.purpose && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Purpose</p>
          <p className="font-medium text-foreground">{data.purpose}</p>
        </div>
      )}
      {data.activitiesCompleted && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Activities Completed</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(data.activitiesCompleted).map(([key, value]) => (
              key !== 'otherDescription' && value && (
                <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )
            ))}
          </div>
        </div>
      )}
      {data.comments && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Comments</p>
          <p className="text-foreground">{data.comments}</p>
        </div>
      )}
    </Card>
  );

  const renderGpsTrail = () => {
    // Only show GPS trail to DEO/DDEO/CEO
    if (user?.role !== 'DEO' && user?.role !== 'DDEO' && user?.role !== 'CEO') {
      return null;
    }

    if (loadingGps) {
      return (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            GPS Tracking Trail
          </h2>
          <p className="text-sm text-muted-foreground">Loading GPS data...</p>
        </Card>
      );
    }

    if (gpsTrail.length === 0) {
      return (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            GPS Tracking Trail
          </h2>
          <p className="text-sm text-muted-foreground">No GPS tracking data available for this visit.</p>
        </Card>
      );
    }

    const startPoint = gpsTrail[0];
    const endPoint = gpsTrail[gpsTrail.length - 1];
    const duration = new Date(endPoint.timestamp).getTime() - new Date(startPoint.timestamp).getTime();
    const durationMinutes = Math.round(duration / 60000);

    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          GPS Tracking Trail ({gpsTrail.length} points)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Location</p>
            <p className="font-medium text-foreground text-xs">
              {parseFloat(startPoint.latitude).toFixed(6)}, {parseFloat(startPoint.longitude).toFixed(6)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(startPoint.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">End Location</p>
            <p className="font-medium text-foreground text-xs">
              {parseFloat(endPoint.latitude).toFixed(6)}, {parseFloat(endPoint.longitude).toFixed(6)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(endPoint.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{durationMinutes} minutes</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tracking Points</p>
            <p className="font-medium text-foreground">{gpsTrail.length} locations</p>
          </div>
        </div>

        {/* Google Maps link */}
        <div className="flex gap-2 mt-4">
          <a
            href={`https://www.google.com/maps?q=${startPoint.latitude},${startPoint.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              View Start on Map
            </Button>
          </a>
          <a
            href={`https://www.google.com/maps?q=${endPoint.latitude},${endPoint.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              View End on Map
            </Button>
          </a>
        </div>

        {/* GPS Points List (collapsed by default) */}
        <details className="mt-4 pt-4 border-t border-border">
          <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
            View All GPS Points ({gpsTrail.length})
          </summary>
          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
            {gpsTrail.map((point, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                <span className="text-muted-foreground">#{idx + 1}</span>
                <span className="font-mono text-foreground">
                  {parseFloat(point.latitude).toFixed(6)}, {parseFloat(point.longitude).toFixed(6)}
                </span>
                <span className="text-muted-foreground">
                  {new Date(point.timestamp).toLocaleTimeString()}
                </span>
                {point.accuracy && (
                  <span className="text-muted-foreground">±{point.accuracy}m</span>
                )}
              </div>
            ))}
          </div>
        </details>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/school-visits')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground ml-4 uppercase">{visit.schoolName}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Edit button - only for AEO viewing their own visit */}
            {user.role === 'AEO' && visit.aeoId === user.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to edit form based on visit type
                  if (visit.type === 'monitoring') {
                    navigate(`/edit-monitoring-visit/${visit.id}`);
                  } else if (visit.type === 'mentoring') {
                    navigate(`/edit-mentoring-visit/${visit.id}`);
                  } else if (visit.type === 'office') {
                    navigate(`/edit-office-visit/${visit.id}`);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Visit
              </Button>
            )}
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              visit.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {visit.status === 'submitted' ? 'Completed' : visit.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Visit Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Conducted by</p>
              <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                {visit.aeoName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Visit Date</p>
              <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(visit.visitDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Visit Type</p>
              <p className="font-medium text-foreground capitalize">
                <FileText className="w-4 h-4 inline mr-1" />
                {visit.type.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {visit.arrivalTime || 'N/A'} - {visit.departureTime || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* GPS Trail - only visible to DEO/DDEO/CEO */}
        {renderGpsTrail()}

        {visit.type === 'monitoring' && renderMonitoringDetails(visit.rawData as MonitoringVisitData)}
        {visit.type === 'mentoring' && renderMentoringDetails(visit.rawData as MentoringVisitData)}
        {visit.type === 'office' && renderOfficeDetails(visit.rawData as OfficeVisitData)}

        {/* Evidence sections only shown to managers (DEO/DDEO/CEO) - AEO sees them in section navigation */}
        {isManager && (
          <>
            {renderVoiceNotesSection()}
            {renderPhotosSection()}
          </>
        )}
      </div>
    </div>
  );
}
