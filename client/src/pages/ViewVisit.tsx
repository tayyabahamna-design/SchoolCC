import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockVisits, VisitIndicator } from '@/hooks/useMockVisits';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle, Mic, Camera, Plus, Play, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const INDICATOR_TYPES = ['boolean', 'count', 'scale', 'text'];

export default function ViewVisit() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getVisit, updateVisit, updateVisitIndicators, addVoiceNote, addPhoto, completeVisit } = useMockVisits();
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState('');
  const [editedIndicators, setEditedIndicators] = useState<VisitIndicator[]>([]);
  const [visitDate, setVisitDate] = useState('');
  const [visitStatus, setVisitStatus] = useState<'planned' | 'in_progress' | 'completed'>('in_progress');
  const [recording, setRecording] = useState(false);
  const [newIndicatorName, setNewIndicatorName] = useState('');
  const [newIndicatorType, setNewIndicatorType] = useState<any>('text');

  const visit = getVisit(id || '');

  useEffect(() => {
    if (visit && editedIndicators.length === 0) {
      setEditedIndicators(visit.indicators.map(ind => ({ ...ind })));
      setComments(visit.comments);
      setVisitDate(visit.visitDate.toISOString().split('T')[0]);
      setVisitStatus(visit.status);
    }
  }, [visit]);

  if (!visit || !user) {
    return null;
  }

  const canEdit = user.role === 'AEO' && visit.conductedBy === user.id;
  const displayIndicators = editing ? editedIndicators : visit.indicators;

  const handleIndicatorChange = (indicatorId: string, value: any) => {
    setEditedIndicators((prev) =>
      prev.map((ind) => (ind.id === indicatorId ? { ...ind, value } : ind))
    );
  };

  const handleAddIndicator = () => {
    if (!newIndicatorName.trim()) return;
    const newIndicator: VisitIndicator = {
      id: `ind-${Date.now()}`,
      name: newIndicatorName,
      type: newIndicatorType,
    };
    setEditedIndicators([...editedIndicators, newIndicator]);
    setNewIndicatorName('');
    setNewIndicatorType('text');
  };

  const handleRemoveIndicator = (indicatorId: string) => {
    setEditedIndicators((prev) => prev.filter((ind) => ind.id !== indicatorId));
  };

  const handleAddVoiceNote = () => {
    setRecording(!recording);
    if (recording) {
      addVoiceNote(visit.id, `Voice Note ${(visit.voiceNotes?.length || 0) + 1}`);
    }
  };

  const handleAddPhoto = () => {
    addPhoto(visit.id, `Photo ${visit.photoCount + 1}`);
  };

  const handleSaveChanges = () => {
    updateVisit(visit.id, {
      visitDate: new Date(visitDate),
      status: visitStatus,
      comments,
      indicators: editedIndicators,
    });
    setEditing(false);
  };

  const handleCompleteVisit = () => {
    updateVisit(visit.id, {
      visitDate: new Date(visitDate),
      status: visitStatus,
      indicators: editedIndicators,
    });
    completeVisit(visit.id, comments);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {canEdit && !editing && (
            <Button onClick={() => setEditing(true)} data-testid="button-edit">
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Visit Info - Editable */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Visit Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Conducted by</p>
                <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" />
                  {visit.conductedByName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Visit Date</p>
                {editing ? (
                  <Input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1"
                    data-testid="input-visit-date"
                  />
                ) : (
                  <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(visitDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Visit Type</p>
                <p className="font-medium text-foreground capitalize">{visit.visitType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                {editing ? (
                  <select
                    value={visitStatus}
                    onChange={(e) => setVisitStatus(e.target.value as any)}
                    className="mt-1 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
                    data-testid="select-visit-status"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <p className="font-medium text-foreground capitalize flex items-center gap-2 mt-1">
                    <CheckCircle className={`w-4 h-4 ${visit.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                    {visit.status}
                  </p>
                )}
              </div>
            </div>

            {visit.gpsLocation && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  GPS: {visit.gpsLocation.lat.toFixed(4)}, {visit.gpsLocation.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Indicators */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Visit Indicators</h2>
          <div className="space-y-4">
            {displayIndicators.map((indicator) => (
              <div key={indicator.id} className="p-3 border border-border rounded-lg relative">
                {editing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveIndicator(indicator.id)}
                    data-testid={`button-remove-indicator-${indicator.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <p className="font-medium text-foreground mb-2">{indicator.name}</p>

                {indicator.type === 'boolean' && (
                  <div className="flex gap-2">
                    <Button
                      variant={indicator.value === true ? 'default' : 'outline'}
                      size="sm"
                      disabled={!editing}
                      onClick={() => handleIndicatorChange(indicator.id, true)}
                      data-testid={`button-yes-${indicator.id}`}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={indicator.value === false ? 'default' : 'outline'}
                      size="sm"
                      disabled={!editing}
                      onClick={() => handleIndicatorChange(indicator.id, false)}
                      data-testid={`button-no-${indicator.id}`}
                    >
                      No
                    </Button>
                  </div>
                )}

                {indicator.type === 'count' && (
                  <Input
                    type="number"
                    placeholder="Enter count"
                    value={(indicator.value as number) || ''}
                    onChange={(e) => handleIndicatorChange(indicator.id, e.target.value ? parseInt(e.target.value) : '')}
                    disabled={!editing}
                    className="max-w-24"
                    data-testid={`input-count-${indicator.id}`}
                  />
                )}

                {indicator.type === 'scale' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <Button
                        key={level}
                        variant={indicator.value === level ? 'default' : 'outline'}
                        size="sm"
                        disabled={!editing}
                        onClick={() => handleIndicatorChange(indicator.id, level)}
                        data-testid={`button-scale-${level}-${indicator.id}`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                )}

                {indicator.type === 'text' && (
                  <Input
                    type="text"
                    placeholder="Enter observation"
                    value={(indicator.value as string) || ''}
                    onChange={(e) => handleIndicatorChange(indicator.id, e.target.value)}
                    disabled={!editing}
                    data-testid={`input-text-${indicator.id}`}
                  />
                )}
              </div>
            ))}

            {editing && (
              <div className="p-4 border-2 border-dashed border-border rounded-lg space-y-3">
                <h3 className="font-medium text-foreground">Add Indicator</h3>
                <Input
                  placeholder="Indicator name"
                  value={newIndicatorName}
                  onChange={(e) => setNewIndicatorName(e.target.value)}
                  data-testid="input-new-indicator-name"
                />
                <select
                  value={newIndicatorType}
                  onChange={(e) => setNewIndicatorType(e.target.value)}
                  className="w-full px-2 py-2 rounded border border-border bg-background text-foreground"
                  data-testid="select-new-indicator-type"
                >
                  {INDICATOR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddIndicator} size="sm" data-testid="button-add-indicator">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Indicator
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Evidence - Voice Notes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-green-600" />
            Voice Notes ({visit.voiceNotesCount})
          </h2>
          {editing && (
            <Button
              onClick={handleAddVoiceNote}
              variant={recording ? 'default' : 'outline'}
              size="sm"
              className="mb-4"
              data-testid="button-record-voice"
            >
              {recording ? '⏹ Stop Recording' : '🎙 Record Voice Note'}
            </Button>
          )}
          <div className="space-y-2">
            {visit.voiceNotes?.map((note) => (
              <div key={note.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Play className="w-4 h-4 text-green-600" />
                <span className="text-sm text-foreground">{note.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{note.duration}s</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Evidence - Photos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Photos ({visit.photoCount})
          </h2>
          {editing && (
            <Button
              onClick={handleAddPhoto}
              size="sm"
              variant="outline"
              className="mb-4"
              data-testid="button-upload-photo"
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          )}
          <div className="space-y-2">
            {visit.photos?.map((photo) => (
              <div key={photo.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-foreground">{photo.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Comments */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Comments & Observations</h2>
          <textarea
            placeholder="Add detailed observations, findings, and recommendations..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24 disabled:opacity-50"
            data-testid="textarea-comments"
          />
        </Card>

        {/* Actions */}
        {editing && (
          <div className="flex gap-2">
            <Button onClick={handleSaveChanges} data-testid="button-save">
              Save Changes
            </Button>
            {visitStatus === 'in_progress' && (
              <Button variant="default" onClick={handleCompleteVisit} data-testid="button-complete">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Visit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setEditedIndicators(visit.indicators.map(ind => ({ ...ind })));
                setComments(visit.comments);
                setVisitDate(visit.visitDate.toISOString().split('T')[0]);
                setVisitStatus(visit.status);
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
