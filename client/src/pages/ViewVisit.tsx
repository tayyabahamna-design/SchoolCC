import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivities, MonitoringVisitData, MentoringVisitData, OfficeVisitData } from '@/contexts/activities';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle, Mic, Camera, Clock, FileText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { analytics } from '@/lib/analytics';

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

  const renderMonitoringDetails = (data: MonitoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Monitoring Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.headTeacherStatus && (
          <div>
            <p className="text-sm text-muted-foreground">Head Teacher Status</p>
            <p className="font-medium text-foreground capitalize">{data.headTeacherStatus.replace(/_/g, ' ')}</p>
          </div>
        )}
        {data.teacherPresent !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Teachers Present</p>
            <p className="font-medium text-foreground">{data.teacherPresent} / {data.teacherTotal || 'N/A'}</p>
          </div>
        )}
        {data.studentPresent !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Students Present</p>
            <p className="font-medium text-foreground">{data.studentPresent} / {data.studentTotal || 'N/A'}</p>
          </div>
        )}
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
        {data.classroomObservation && (
          <div>
            <p className="text-sm text-muted-foreground">Classroom Observation</p>
            <p className="font-medium text-foreground capitalize">{data.classroomObservation.replace(/_/g, ' ')}</p>
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

  const renderMentoringDetails = (data: MentoringVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Mentoring Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
      
      {data.indicators && data.indicators.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">HOTS Indicators</p>
          <div className="space-y-2">
            {data.indicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
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
        </div>
      )}

      {data.generalFeedback && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">General Feedback</p>
          <p className="text-foreground">{data.generalFeedback}</p>
        </div>
      )}
    </Card>
  );

  const renderOfficeDetails = (data: OfficeVisitData) => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Office Visit Details</h2>
      {data.purpose && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Purpose</p>
          <p className="font-medium text-foreground">{data.purpose}</p>
        </div>
      )}
      {data.activitiesCompleted && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {Object.entries(data.activitiesCompleted).map(([key, value]) => (
            key !== 'otherDescription' && value && (
              <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )
          ))}
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
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            visit.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {visit.status === 'submitted' ? 'Completed' : visit.status}
          </span>
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

        {visit.type === 'monitoring' && renderMonitoringDetails(visit.rawData as MonitoringVisitData)}
        {visit.type === 'mentoring' && renderMentoringDetails(visit.rawData as MentoringVisitData)}
        {visit.type === 'office' && renderOfficeDetails(visit.rawData as OfficeVisitData)}

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
      </div>
    </div>
  );
}
