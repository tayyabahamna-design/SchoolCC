import { useState, useEffect } from 'react';
import { useAuth, VALID_ASSIGNEES, type UserRole } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMockDataRequests, type DataRequest, DataField } from '@/hooks/useMockDataRequests';
import { useMockCollaborativeForms, FormField } from '@/hooks/useMockCollaborativeForms';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { useLocation } from 'wouter';
import { Plus, X, ArrowLeft, Mic, Square, Play, Download, ChevronRight, Clock, CheckCircle, AlertCircle, Search, Filter, ListFilter, CalendarIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { analytics } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

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

export default function DataRequests() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { getRequestsForUser, createRequest } = useMockDataRequests();
  const { createForm } = useMockCollaborativeForms();
  const { getSchoolById } = useMockTeacherData();
  const { startRecording, stopRecording, playRecording, deleteRecording, hasRecording } = useVoiceRecorder();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'assigned'>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<DataField[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<Record<string, boolean>>({});
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (user) {
        const freshRequests = await getRequestsForUser(user.id, user.role, user.schoolId, user.clusterId, user.districtId);
        setRequests(freshRequests);
      }
    };
    fetchRequests();
  }, [user?.id, user?.role, user?.schoolId, user?.clusterId, user?.districtId, refreshTrigger, getRequestsForUser]);

  useEffect(() => {
    if (location === '/data-requests') {
      setRefreshTrigger((t) => t + 1);
    }
  }, [location]);

  useEffect(() => {
    const handleFocus = () => setRefreshTrigger((t) => t + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (user) {
      analytics.navigation.pageViewed('data_requests', user.role);
    }
  }, [user?.role]);

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

  const validAssignees = getValidAssigneesForUser(allUsers, user.role);
  const canCreateRequest = user.role === 'CEO' || user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DEO' || user.role === 'DDEO';

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.createdByName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === 'mine') {
      return matchesSearch && req.createdBy === user.id;
    } else if (filterMode === 'assigned') {
      return matchesSearch && req.assignees.some(a => a.userId === user.id);
    }
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const addField = () => {
    setFields([...fields, { id: `f-${Date.now()}`, name: '', type: 'text', required: true }]);
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
      setRecordingField(null);
      stopRecording(fieldId).then(() => {
        setRecordedVoiceNotes((prev) => ({ ...prev, [fieldId]: true }));
      });
    } else {
      setRecordingField(fieldId);
      startRecording();
    }
  };

  const resetCreateForm = () => {
    setTitle('');
    setDescription('');
    setFields([]);
    setSelectedAssignees([]);
    setRecordedVoiceNotes({});
    setPriority('medium');
    setDueDate('');
  };

  const handleVoiceTranscription = (text: string) => {
    setDescription(prev => prev ? `${prev}\n\n${text}` : text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || fields.length === 0 || selectedAssignees.length === 0) {
      toast({ title: 'Missing Info', description: 'Please fill title, add fields, and select assignees', variant: 'destructive' });
      return;
    }

    try {
      const descriptionVoice = recordedVoiceNotes['description'] && hasRecording('description');

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

      const userSchool = getSchoolById('school-1');
      if (userSchool) {
        const collaborativeFields: FormField[] = fields
          .filter((f) => f.type === 'text' || f.type === 'number' || f.type === 'voice_note')
          .map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type === 'number' ? 'number' : f.type === 'voice_note' ? 'voice_note' : 'text',
            required: f.required,
          }));

        if (collaborativeFields.length > 0) {
          createForm(userSchool.id, userSchool.name, title, description || 'Data collection form', collaborativeFields, user.id, user.name);
        }
      }

      analytics.dataRequest.created(`request-${Date.now()}`, 'normal', fields.length);
      toast({ title: 'Request Created', description: 'Your data request has been sent to assignees' });
      resetCreateForm();
      setActiveTab('list');
      setRefreshTrigger(t => t + 1);
    } catch (error) {
      console.error('Error creating request:', error);
      toast({ title: 'Error', description: 'Failed to create request', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} data-testid="button-back-to-dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Data Requests</h1>
              <p className="text-sm text-muted-foreground">ڈیٹا درخواستیں</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {canCreateRequest && (
          <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              data-testid="tab-list"
            >
              <ListFilter className="w-4 h-4 inline mr-2" />
              All Requests
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'create' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              data-testid="tab-create"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create New
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests... / تلاش کریں"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('all')}
                  data-testid="filter-all"
                >
                  All
                </Button>
                <Button
                  variant={filterMode === 'mine' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('mine')}
                  data-testid="filter-mine"
                >
                  My Requests
                </Button>
                <Button
                  variant={filterMode === 'assigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('assigned')}
                  data-testid="filter-assigned"
                >
                  Assigned to Me
                </Button>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterMode !== 'all' ? 'No requests match your filter' : 'No data requests found'}
                </p>
                {canCreateRequest && filterMode === 'all' && !searchQuery && (
                  <Button onClick={() => setActiveTab('create')}>Create Your First Request</Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const userAssignee = req.assignees.find((a: any) => a.userId === user.id);
                  const displayStatus = userAssignee?.status || 'assigned';
                  const isMyRequest = req.createdBy === user.id;

                  return (
                    <Card
                      key={req.id}
                      className="p-4 hover:border-primary/30 cursor-pointer transition-all"
                      onClick={() => navigate(`/request/${req.id}`)}
                      data-testid={`card-request-${req.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{req.title}</h3>
                            {isMyRequest && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Created by you
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              req.priority === 'high' ? 'bg-red-100 text-red-700' :
                              req.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {req.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{req.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span>By {req.createdByName}</span>
                            <span>Due: {req.dueDate.toLocaleDateString()}</span>
                            <span>{req.assignees.length} assignee(s)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end mb-1">
                              {getStatusIcon(displayStatus)}
                              <span className="text-sm font-medium text-foreground capitalize">{displayStatus}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {req.assignees.filter((a: any) => a.status === 'completed').length}/{req.assignees.length} done
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Request Details / درخواست کی تفصیلات</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title / عنوان</label>
                  <Input
                    placeholder="e.g., Monthly Attendance Report"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description / تفصیل</label>
                  <textarea
                    placeholder="Provide context about this request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20"
                    data-testid="textarea-description"
                  />
                </div>
                
                <VoiceRecorder
                  onTranscriptionComplete={handleVoiceTranscription}
                  disabled={false}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Priority / ترجیح</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="select-priority"
                    >
                      <option value="low">Low / کم</option>
                      <option value="medium">Medium / درمیانی</option>
                      <option value="high">High / زیادہ</option>
                      <option value="urgent">Urgent / فوری</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Due Date / آخری تاریخ</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        data-testid="input-due-date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Data Fields / ڈیٹا فیلڈز</h2>
                <Button type="button" variant="outline" size="sm" onClick={addField} data-testid="button-add-field">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No fields yet. Add one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.id} className="flex gap-2 p-3 border border-border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Field name (e.g., CNIC Number)"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          data-testid={`input-field-name-${field.id}`}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                            className="flex-1 min-w-[120px] px-2 py-1.5 text-sm border border-border rounded bg-background text-foreground"
                            data-testid={`select-field-type-${field.id}`}
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
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
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeField(field.id)} data-testid={`button-remove-field-${field.id}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Assign To / تفویض کریں</h2>
              {loadingUsers ? (
                <p className="text-muted-foreground text-sm">Loading users...</p>
              ) : validAssignees.length === 0 ? (
                <p className="text-muted-foreground text-sm">Your role cannot create requests. Check your permissions.</p>
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

            <div className="flex gap-3 sticky bottom-4">
              <Button type="button" variant="outline" onClick={() => { resetCreateForm(); setActiveTab('list'); }} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || fields.length === 0 || selectedAssignees.length === 0}
                className="flex-1"
                data-testid="button-create"
              >
                Create Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
