import { useParams } from 'wouter';
import { useAuth, ROLE_HIERARCHY, UserRole } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockDataRequests, DataRequest, RequestAssignee } from '@/hooks/useMockDataRequests';
import { useLocation } from 'wouter';
import { ArrowLeft, Mic, Play, Upload, Download, Lock, Square, Trash2, Edit, UserPlus, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';

export default function ViewRequest() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getRequest, updateAssigneeFields, deleteRequest, updateRequest } = useMockDataRequests();
  const [editing, setEditing] = useState(false);
  const [editingRequest, setEditingRequest] = useState(false);
  const [editedAssignee, setEditedAssignee] = useState<RequestAssignee | null>(null);
  const [recording, setRecording] = useState<string | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestPriority, setRequestPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [requestDueDate, setRequestDueDate] = useState('');
  const [request, setRequest] = useState<DataRequest | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [subordinates, setSubordinates] = useState<any[]>([]);
  const [selectedSubordinate, setSelectedSubordinate] = useState<any | null>(null);
  const [delegating, setDelegating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (id) {
        const fetchedRequest = await getRequest(id);
        setRequest(fetchedRequest);
        // Track request viewed
        if (fetchedRequest) {
          analytics.dataRequest.viewed(id);
        }
      }
    };
    fetchRequest();
  }, [id, getRequest]);

  useEffect(() => {
    if (request && user) {
      const userAssignee = request.assignees.find((a) => a.userId === user.id);
      // Only set editedAssignee once on mount if not already set
      if (userAssignee && !editedAssignee) {
        setEditedAssignee(userAssignee);
      }
      // Only initialize request form fields once when request loads
      if (request.title && requestTitle === '') {
        setRequestTitle(request.title);
        setRequestDescription(request.description);
        setRequestPriority(request.priority);
        setRequestDueDate(request.dueDate.toISOString().split('T')[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, user?.id]);

  // Fetch subordinates when delegate modal opens
  useEffect(() => {
    const fetchSubordinates = async () => {
      if (!showDelegateModal || !user) return;
      
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const allUsers = await response.json();
          const userHierarchy = ROLE_HIERARCHY[user.role as UserRole] || 0;
          
          // Filter users that are lower in hierarchy
          const lowerUsers = allUsers.filter((u: any) => {
            const theirHierarchy = ROLE_HIERARCHY[u.role as UserRole] || 0;
            // Must be lower in hierarchy (higher number = lower rank)
            if (theirHierarchy <= userHierarchy) return false;
            
            // Filter by location - must be in same district/cluster/school
            if (user.role === 'AEO') {
              // AEO can assign to head teachers/teachers in their cluster
              return u.clusterId === user.clusterId || 
                     (user.assignedSchools && user.assignedSchools.includes(u.schoolName));
            }
            if (user.role === 'DDEO' || user.role === 'DEO') {
              // DEO/DDEO can assign to AEOs/HTs/Teachers in their district
              return u.districtId === user.districtId;
            }
            if (user.role === 'HEAD_TEACHER') {
              // Head Teacher can assign to teachers in their school
              return u.schoolId === user.schoolId;
            }
            return false;
          });
          
          // Exclude already assigned users
          const existingAssigneeIds = request?.assignees.map(a => a.userId) || [];
          const availableUsers = lowerUsers.filter((u: any) => !existingAssigneeIds.includes(u.id));
          
          setSubordinates(availableUsers);
        }
      } catch (error) {
        console.error('Failed to fetch subordinates:', error);
      }
    };
    
    fetchSubordinates();
  }, [showDelegateModal, user, request?.assignees]);

  const handleDelegateRequest = async () => {
    if (!selectedSubordinate || !request) return;
    
    setDelegating(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/assignees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedSubordinate.id,
          userName: selectedSubordinate.name,
          userRole: selectedSubordinate.role,
          schoolId: selectedSubordinate.schoolId,
          schoolName: selectedSubordinate.schoolName,
          fieldResponses: request.fields.map(f => ({ ...f, value: null })),
        }),
      });
      
      if (response.ok) {
        toast.success(`Request assigned to ${selectedSubordinate.name}`);
        setShowDelegateModal(false);
        setSelectedSubordinate(null);
        // Refresh the request data
        const refreshedRequest = await getRequest(request.id);
        setRequest(refreshedRequest);
      } else {
        toast.error('Failed to assign request');
      }
    } catch (error) {
      console.error('Failed to delegate:', error);
      toast.error('Failed to assign request');
    } finally {
      setDelegating(false);
    }
  };

  if (!request || !user) {
    return null;
  }

  const userAssignee = request.assignees.find((a) => a.userId === user.id);
  const isReadOnly =
    !userAssignee ||
    (user.role !== 'AEO' &&
      user.role !== 'HEAD_TEACHER' &&
      user.role !== 'TEACHER' &&
      user.role !== 'DEO' &&
      user.role !== 'DDEO');

  const canEdit = userAssignee && (user.role === 'TEACHER' || user.role === 'HEAD_TEACHER');
  const isCreator = request.createdBy === user.id;
  
  // Check if user can delegate to subordinates
  const canDelegate = userAssignee && 
    (user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DEO' || user.role === 'DDEO');

  // Export responses to Excel
  const handleExportExcel = async () => {
    if (!request) return;
    
    try {
      const response = await fetch(`/api/requests/${request.id}/export-excel`);
      if (!response.ok) {
        throw new Error('Failed to export');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${request.title.replace(/[^a-z0-9]/gi, '_')}_responses.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const handleFieldChange = (fieldId: string, value: string | number | null) => {
    if (!editedAssignee) return;

    setEditedAssignee({
      ...editedAssignee,
      fields: editedAssignee.fields.map((f) =>
        f.id === fieldId ? { ...f, value } : f
      ),
    });
  };

  const handleSubmit = () => {
    if (editedAssignee && userAssignee) {
      updateAssigneeFields(request.id, userAssignee.id, editedAssignee.fields);
      setEditing(false);
    }
  };

  const handleUpdateRequest = () => {
    updateRequest(request.id, {
      title: requestTitle,
      description: requestDescription,
      priority: requestPriority,
      dueDate: new Date(requestDueDate),
    });
    setEditingRequest(false);
  };

  const handleDeleteRequest = () => {
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      deleteRequest(request.id);
      // Small delay to ensure localStorage is updated before navigation
      setTimeout(() => navigate('/data-requests'), 100);
    }
  };

  const displayAssignee = editedAssignee || userAssignee;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/data-requests')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground ml-4">{request.title}</h1>
          </div>
          <div className="flex gap-2">
            {isCreator && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRequest(!editingRequest)}
                  data-testid="button-edit-request"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {editingRequest ? 'Cancel' : 'Edit Request'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteRequest}
                  data-testid="button-delete-request"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {canEdit && !isReadOnly && (
              <Button
                onClick={() => (editing ? handleSubmit() : setEditing(true))}
                data-testid={editing ? 'button-submit' : 'button-edit'}
              >
                {editing ? 'Submit' : 'Edit Response'}
              </Button>
            )}
            {canDelegate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDelegateModal(true)}
                data-testid="button-delegate"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to Subordinate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Request Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Request Information</h2>
          {editingRequest ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <Input
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  data-testid="input-edit-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20"
                  data-testid="textarea-edit-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                  <select
                    value={requestPriority}
                    onChange={(e) => setRequestPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="select-edit-priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={requestDueDate}
                    onChange={(e) => setRequestDueDate(e.target.value)}
                    data-testid="input-edit-duedate"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateRequest}
                  data-testid="button-save-request"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingRequest(false)}
                  data-testid="button-cancel-request-edit"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created by</p>
                  <p className="font-medium text-foreground">{request.createdByName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">{request.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium text-foreground capitalize">{request.priority}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground capitalize">
                    {userAssignee?.status || 'Assigned'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground">{request.description}</p>

              {/* Description Voice Note Display */}
              {request.descriptionVoiceUrl && (
                <div className="mt-4 border border-border rounded-lg p-3 bg-blue-50">
                  <p className="text-xs text-muted-foreground mb-2">Description Voice Note:</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      data-testid="button-play-description-voice"
                    >
                      <Play className="w-4 h-4" />
                      Play Recording ({request.descriptionVoiceFileName || 'voice'})
                    </Button>
                    <span className="text-xs text-green-600 font-medium">✓ Voice note attached</span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Data Fields */}
        {displayAssignee && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Response Fields</h2>
              {isReadOnly && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>

            <div className="space-y-4">
              {displayAssignee.fields.map((field) => {
                const isDisabled = !editing || isReadOnly;

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {field.name}
                      {field.required && <span className="text-red-600">*</span>}
                      {isReadOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </label>

                    {field.type === 'text' && (
                      <Input
                        type="text"
                        placeholder="Enter text"
                        value={field.value as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={isDisabled}
                        data-testid={`input-field-${field.id}`}
                      />
                    )}

                    {field.type === 'number' && (
                      <Input
                        type="number"
                        placeholder="Enter number"
                        value={field.value as number || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value ? parseInt(e.target.value) : null)}
                        disabled={isDisabled}
                        data-testid={`input-number-${field.id}`}
                      />
                    )}

                    {field.type === 'photo' && (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {field.value ? 'Photo attached' : 'Click to upload photo'}
                        </p>
                        {!isDisabled && <input type="file" accept="image/*" className="mt-2" hidden />}
                      </div>
                    )}

                    {field.type === 'file' && (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {field.value ? 'File attached' : 'Click to upload file'}
                        </p>
                        {!isDisabled && <input type="file" className="mt-2" hidden />}
                      </div>
                    )}

                    {field.type === 'voice_note' && (
                      <div className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {field.voiceUrl ? (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                data-testid={`button-play-voice-${field.id}`}
                              >
                                <Play className="w-4 h-4" />
                                Play Recording ({field.fileName || 'voice'})
                              </Button>
                              <span className="text-xs text-muted-foreground">Recording attached</span>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isDisabled}
                                className="gap-2"
                                data-testid={`button-record-voice-${field.id}`}
                                onClick={() => setRecording(recording === field.id ? null : field.id)}
                              >
                                {recording === field.id ? (
                                  <>
                                    <Square className="w-4 h-4" />
                                    Stop Recording
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-4 h-4" />
                                    Record Voice Note
                                  </>
                                )}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {recording === field.id ? 'Recording...' : 'No recording'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {editing && !isReadOnly && (
              <div className="mt-6 flex gap-2">
                <Button
                  onClick={handleSubmit}
                  data-testid="button-save-changes"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Assignee Status - Only visible to Head Teacher and above */}
        {user.role !== 'TEACHER' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">All Responses</h2>
            <div className="space-y-3">
              {request.assignees.map((assignee) => (
                <div key={assignee.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{assignee.userName}</p>
                      <p className="text-xs text-muted-foreground">{assignee.schoolName || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium capitalize ${
                        assignee.status === 'submitted' ? 'text-green-600' : 
                        assignee.status === 'in_progress' ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}>{assignee.status}</p>
                      {assignee.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: {assignee.submittedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Show field responses for Head Teacher and above */}
                  {assignee.status === 'submitted' && assignee.fields && (
                    <div className="mt-2 pt-2 border-t border-border space-y-2">
                      {assignee.fields.map((field) => (
                        <div key={field.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{field.name}:</span>
                          <span className="font-medium text-foreground">
                            {field.type === 'file' || field.type === 'photo' || field.type === 'voice_note' 
                              ? (field.value ? 'Attached' : 'No file')
                              : (field.value || '-')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Export - Only visible to Head Teacher and above */}
        {(user.role === 'DEO' || user.role === 'DDEO' || user.role === 'AEO' || user.role === 'HEAD_TEACHER') && (
          <Button variant="outline" className="w-full" onClick={handleExportExcel} data-testid="button-export-response">
            <Download className="w-4 h-4 mr-2" />
            Export All Responses as Excel
          </Button>
        )}
      </div>

      {/* Delegate Modal */}
      {showDelegateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDelegateModal(false)}>
          <div className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Assign to Subordinate</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDelegateModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Select a person lower in the hierarchy to assign this data request to. They will be able to fill out the response fields.
            </p>
            
            {subordinates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subordinates available to assign</p>
                <p className="text-xs text-muted-foreground mt-2">All eligible users may already be assigned to this request.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {subordinates.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSubordinate?.id === sub.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSubordinate(sub)}
                    data-testid={`subordinate-${sub.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.role} • {sub.schoolName || sub.clusterId || 'N/A'}</p>
                      </div>
                      {selectedSubordinate?.id === sub.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={handleDelegateRequest}
                disabled={!selectedSubordinate || delegating}
                data-testid="button-confirm-delegate"
              >
                {delegating ? 'Assigning...' : 'Assign Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDelegateModal(false)}
                data-testid="button-cancel-delegate"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
