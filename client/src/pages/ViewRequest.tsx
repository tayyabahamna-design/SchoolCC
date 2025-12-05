import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockDataRequests, DataField, RequestAssignee } from '@/hooks/useMockDataRequests';
import { useLocation } from 'wouter';
import { ArrowLeft, Mic, Play, Upload, Download, Lock, Square, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  const request = getRequest(id || '');

  useEffect(() => {
    if (request && user) {
      const userAssignee = request.assignees.find((a) => a.userId === user.id);
      if (userAssignee && !editedAssignee) {
        setEditedAssignee(userAssignee);
      }
      if (!requestTitle && request.title) {
        setRequestTitle(request.title);
        setRequestDescription(request.description);
        setRequestPriority(request.priority);
        setRequestDueDate(request.dueDate.toISOString().split('T')[0]);
      }
    }
  }, [request, user, editedAssignee, requestTitle]);

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
      <div className="bg-white border-b border-border">
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

        {/* Audit Trail */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Assignee Status</h2>
          <div className="space-y-3">
            {request.assignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{assignee.userName}</p>
                  <p className="text-xs text-muted-foreground">{assignee.schoolName || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{assignee.status}</p>
                  {assignee.submittedAt && (
                    <p className="text-xs text-muted-foreground">
                      Submitted: {assignee.submittedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Export */}
        {(user.role === 'DEO' || user.role === 'DDEO' || user.role === 'AEO') && (
          <Button variant="outline" className="w-full" data-testid="button-export-response">
            <Download className="w-4 h-4 mr-2" />
            Export All Responses as CSV
          </Button>
        )}
      </div>
    </div>
  );
}
