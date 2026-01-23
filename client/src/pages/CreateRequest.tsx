import { useState, useEffect } from 'react';
import { useAuth, VALID_ASSIGNEES, type UserRole } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMockDataRequests, DataField } from '@/hooks/useMockDataRequests';
import { useMockCollaborativeForms, FormField } from '@/hooks/useMockCollaborativeForms';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useLocation } from 'wouter';
import { Plus, X, ArrowLeft, Mic, Square, Play } from 'lucide-react';
import { realAEOs, realSchools, realHeadmasters } from '@/data/realData';
import { analytics } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

const FIELD_TYPES = ['text', 'number', 'file', 'photo', 'voice_note'];

interface UserOption {
  id: string;
  name: string;
  role: UserRole;
  school: string;
}

const getValidAssigneesForUser = (allUsers: UserOption[], userRole: UserRole): UserOption[] => {
  const validRoles = VALID_ASSIGNEES[userRole] || [];
  return allUsers.filter(u => validRoles.includes(u.role));
};

export default function CreateRequest() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { createRequest } = useMockDataRequests();
  const { createForm } = useMockCollaborativeForms();
  const { getSchoolById } = useMockTeacherData();
  const { startRecording, stopRecording, playRecording, deleteRecording, hasRecording } = useVoiceRecorder();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<DataField[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<Record<string, boolean>>({});
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');

        const users = await response.json();
        const formattedUsers: UserOption[] = users.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role as UserRole,
          school: u.schoolName || u.clusterId || u.districtId || 'District',
        }));

        setAllUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  if (!user) return null;

  // Get valid assignees based on user role and hierarchy
  const validAssignees = getValidAssigneesForUser(allUsers, user.role);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `f-${Date.now()}`,
        name: '',
        type: 'text',
        required: true,
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (recordedVoiceNotes[id]) {
      deleteRecording(id);
      setRecordedVoiceNotes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const updateField = (id: string, updates: Partial<DataField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const toggleVoiceRecording = (fieldId: string) => {
    if (recordingField === fieldId) {
      // Stop recording
      setRecordingField(null);
      stopRecording(fieldId).then(() => {
        setRecordedVoiceNotes((prev) => ({ ...prev, [fieldId]: true }));
      });
    } else {
      // Start recording
      setRecordingField(fieldId);
      startRecording();
    }
  };

  const deleteVoiceNote = (fieldId: string) => {
    deleteRecording(fieldId);
    setRecordedVoiceNotes((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
    setRecordingField(null);
  };

  const toggleDescriptionRecording = () => {
    if (recordingField === 'description') {
      setRecordingField(null);
      stopRecording('description').then(() => {
        setRecordedVoiceNotes((prev) => ({ ...prev, description: true }));
      });
    } else {
      setRecordingField('description');
      startRecording();
    }
  };

  const deleteDescriptionVoice = () => {
    deleteRecording('description');
    setRecordedVoiceNotes((prev) => {
      const updated = { ...prev };
      delete updated['description'];
      return updated;
    });
    setRecordingField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || fields.length === 0 || selectedAssignees.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get description voice note data if it exists
      const descriptionVoice = recordedVoiceNotes['description'] && hasRecording('description');

      // Create the data request
      await createRequest(
        title,
        description,
        fields,
        selectedAssignees.map((id) => {
          const assignee = allUsers.find((a) => a.id === id);
          return {
            userId: assignee?.id || '',
            userName: assignee?.name || '',
            userRole: assignee?.role || '',
            schoolId: 'school-1',
            schoolName: assignee?.school || '',
          };
        }),
        user.id,
        user.name,
        user.role,
        user.schoolId,
        user.clusterId,
        user.districtId,
        descriptionVoice ? 'voice-description.wav' : undefined,
        descriptionVoice ? 'Description Voice Note' : undefined
      );

      // Automatically create collaborative form for the same data
      const userSchool = getSchoolById('school-1');
      if (userSchool) {
        // Convert data request fields to collaborative form fields (text, number, and voice_note types)
        // Voice notes are allowed for non-teacher roles
        const collaborativeFields: FormField[] = fields
          .filter((f) => f.type === 'text' || f.type === 'number' || f.type === 'voice_note')
          .map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type === 'number' ? 'number' : f.type === 'voice_note' ? 'voice_note' : 'text',
            required: f.required,
          }));

        // Only create form if there are compatible fields
        if (collaborativeFields.length > 0) {
          createForm(
            userSchool.id,
            userSchool.name,
            title,
            description || 'Data collection form - teachers fill their information',
            collaborativeFields,
            user.id,
            user.name
          );
        }
      }

      // Track the data request creation
      const assigneeRoles = selectedAssignees.map(id => {
        const assignee = allUsers.find(a => a.id === id);
        return assignee?.role;
      }).filter(Boolean) as UserRole[];
      
      analytics.dataRequest.created(`request-${Date.now()}`, 'normal', fields.length);
      analytics.dataRequest.assigned(`request-${Date.now()}`, selectedAssignees.length, assigneeRoles);
      
      // Navigate after successful creation
      navigate('/data-requests');
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/data-requests')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Create Data Request</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Request Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Request Title
                </label>
                <Input
                  placeholder="e.g., Monthly Attendance Verification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <div className="flex gap-2">
                  <textarea
                    placeholder="Provide context about this request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
                    data-testid="textarea-description"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant={recordingField === 'description' ? 'destructive' : 'outline'}
                      size="icon"
                      onClick={toggleDescriptionRecording}
                      className={recordingField === 'description' ? 'bg-red-600 hover:bg-red-700' : ''}
                      data-testid="button-record-description"
                      title={recordingField === 'description' ? 'Stop recording' : 'Record voice note'}
                    >
                      {recordingField === 'description' ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    {recordedVoiceNotes['description'] && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => playRecording('description')}
                        data-testid="button-play-description"
                        title="Play voice note"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    {recordedVoiceNotes['description'] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={deleteDescriptionVoice}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid="button-delete-description-voice"
                        title="Delete voice note"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {recordingField === 'description' && (
                  <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 rounded w-fit text-xs">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">Recording...</span>
                  </div>
                )}
                {recordedVoiceNotes['description'] && recordingField !== 'description' && (
                  <div className="text-xs text-green-600 font-medium mt-2">✓ Voice note recorded</div>
                )}
              </div>
            </div>
          </Card>

          {/* Fields */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Data Fields</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                data-testid="button-add-field"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No fields yet. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="flex gap-2 p-3 border border-border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        data-testid={`input-field-name-${field.id}`}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                          className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                          data-testid={`select-field-type-${field.id}`}
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.replace('_', ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            data-testid={`checkbox-required-${field.id}`}
                          />
                          Required
                        </label>
                      </div>

                      {/* Voice Note Preview for Field Type */}
                      {field.type === 'voice_note' && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-blue-900">Voice Note Field</p>
                              <p className="text-xs text-blue-700">Record audio responses for this field</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Record/Stop Button */}
                            <Button
                              type="button"
                              variant={recordingField === field.id ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => toggleVoiceRecording(field.id)}
                              className={`text-xs ${recordingField === field.id ? 'bg-red-600 hover:bg-red-700' : ''}`}
                              data-testid={`button-record-voice-${field.id}`}
                            >
                              {recordingField === field.id ? (
                                <>
                                  <Square className="w-3 h-3 mr-1" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3 h-3 mr-1" />
                                  Record
                                </>
                              )}
                            </Button>

                            {/* Play Button - only show if recording exists */}
                            {recordedVoiceNotes[field.id] && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => playRecording(field.id)}
                                data-testid={`button-play-voice-${field.id}`}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Play
                              </Button>
                            )}

                            {/* Delete Button - only show if recording exists */}
                            {recordedVoiceNotes[field.id] && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteVoiceNote(field.id)}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-voice-${field.id}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}

                            {/* Recording status */}
                            {recordingField === field.id && (
                              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-red-100 rounded animate-pulse">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                <span className="text-xs text-red-700 font-medium">Recording...</span>
                              </div>
                            )}

                            {/* Recorded status */}
                            {recordedVoiceNotes[field.id] && recordingField !== field.id && (
                              <span className="text-xs text-green-600 font-medium ml-2">✓ Recorded</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      data-testid={`button-remove-field-${field.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Info Banner */}
          <Card className="p-4 bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700">
              ℹ️ <strong>Automatic Spreadsheet Form:</strong> When you create this request, a collaborative spreadsheet form will be automatically created for all assignees (teachers, head teachers, etc.) to fill their data.
            </p>
          </Card>

          {/* Assignees */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Assign To</h2>
            {loadingUsers ? (
              <p className="text-muted-foreground text-sm">Loading users...</p>
            ) : validAssignees.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Your role cannot create requests (assign to subordinates). Check your permissions.
              </p>
            ) : (
              <div>
                <MultiSelect
                  options={validAssignees}
                  selected={selectedAssignees}
                  onSelectionChange={setSelectedAssignees}
                  placeholder="Select assignees..."
                  searchPlaceholder="Search by name, role, or school..."
                />
                {selectedAssignees.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedAssignees.length} assignee{selectedAssignees.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/data-requests')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || fields.length === 0 || selectedAssignees.length === 0 || isSubmitting}
              data-testid="button-create"
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
