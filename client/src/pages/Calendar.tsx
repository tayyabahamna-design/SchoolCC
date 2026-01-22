import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLeaveRecords, LeaveRecord } from '@/hooks/useLeaveRecords';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Plus, Calendar as CalendarIcon, Eye, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

const leaveTypeColors: Record<string, string> = {
  sick: 'bg-red-100 text-red-700 border-red-200',
  casual: 'bg-blue-100 text-blue-700 border-blue-200',
  earned: 'bg-green-100 text-green-700 border-green-200',
  special: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function Calendar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getApprovedLeaves, getLeavesByDate, getLeavesByDateForTeacher, getLeavesByTeacher, addLeave } = useLeaveRecords();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayLeavesDialog, setShowDayLeavesDialog] = useState(false);
  const [dayLeaves, setDayLeaves] = useState<LeaveRecord[]>([]);

  const [newLeave, setNewLeave] = useState({
    teacherName: '',
    leaveType: 'casual' as 'sick' | 'casual' | 'earned' | 'special',
    startDate: '',
    endDate: '',
    reason: '',
    numberOfDays: 1,
  });

  // Track page view
  useEffect(() => {
    if (user) {
      analytics.navigation.pageViewed('calendar', user.role);
    }
  }, [user?.role]);

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';
  const canAddLeave = user.role === 'TEACHER' || user.role === 'HEAD_TEACHER';
  const canSeeAllLeaves = ['HEAD_TEACHER', 'AEO', 'DDEO', 'DEO', 'TRAINING_MANAGER'].includes(user.role);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
  }

  // For teachers, show only their own leaves. For management, show all approved leaves
  const approvedLeaves = isTeacher 
    ? getLeavesByTeacher(user.id) 
    : getApprovedLeaves();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startD = new Date(start);
    const endD = new Date(end);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleCreateLeave = () => {
    // For teachers, their name is pre-filled; for HEAD_TEACHER, teacher name is required
    const teacherName = isTeacher ? user.name : newLeave.teacherName;
    
    if (!teacherName || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Teachers submit pending leaves; Head Teachers can directly approve
    const leaveStatus = isTeacher ? 'pending' : 'approved';

    addLeave({
      teacherId: isTeacher ? user.id : `teacher-${Date.now()}`,
      teacherName: teacherName,
      schoolId: user.schoolId || 'SCH-001',
      schoolName: user.schoolName || 'Demo School',
      leaveType: newLeave.leaveType,
      startDate: new Date(newLeave.startDate),
      endDate: new Date(newLeave.endDate),
      numberOfDays: calculateDays(newLeave.startDate, newLeave.endDate),
      reason: newLeave.reason,
      status: leaveStatus,
      ...(leaveStatus === 'approved' && {
        approvedBy: user.id,
        approvedByName: user.name,
        approvedAt: new Date(),
      }),
    });

    toast({
      title: isTeacher ? "Leave Request Submitted" : "Leave Added",
      description: isTeacher 
        ? "Your leave request has been submitted for approval." 
        : "The leave has been added to the calendar.",
    });

    setNewLeave({
      teacherName: '',
      leaveType: 'casual',
      startDate: '',
      endDate: '',
      reason: '',
      numberOfDays: 1,
    });
    setShowCreateDialog(false);
  };

  const handleViewLeave = (leave: LeaveRecord) => {
    setSelectedLeave(leave);
    setShowViewDialog(true);
    setIsEditing(false);
  };

  const handleDateClick = (day: Date) => {
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(day.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayOfMonth}`;
    setNewLeave(prev => ({
      ...prev,
      startDate: dateStr,
      endDate: dateStr,
    }));
    setShowCreateDialog(true);
  };

  const handleShowMoreLeaves = (day: Date, leaves: LeaveRecord[]) => {
    setSelectedDate(day);
    setDayLeaves(leaves);
    setShowDayLeavesDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Leave Calendar</h1>
              {!isTeacher && (
                <p className="text-sm text-muted-foreground">
                  {user.role === 'HEAD_TEACHER' 
                    ? 'Click on any date to add a leave. Click on teacher name to view details.'
                    : 'Track and manage teacher leave requests'}
                </p>
              )}
            </div>
          </div>
          
          {canAddLeave && (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600" 
              data-testid="button-add-leave"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isTeacher ? 'Request Leave' : 'Add Leave'}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMonth}
                  data-testid="button-prev-month"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  data-testid="button-next-month"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isToday = day.toDateString() === today.toDateString();
                // Teachers only see their own leaves; management sees all approved leaves
                const leavesForDay = isTeacher 
                  ? getLeavesByDateForTeacher(day, user.id)
                  : getLeavesByDate(day);

                const dayContent = (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{day.getDate()}</span>
                      {canAddLeave && isCurrentMonth && (
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    {leavesForDay.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {leavesForDay.slice(0, 2).map((leave) => (
                          <div
                            key={leave.id}
                            className={`text-xs px-1 py-0.5 rounded truncate border ${leaveTypeColors[leave.leaveType]} ${leave.status === 'pending' ? 'opacity-60' : ''}`}
                            title={`${leave.teacherName} - ${leave.reason}${leave.status === 'pending' ? ' (Pending)' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLeave(leave);
                            }}
                          >
                            {isTeacher ? leave.leaveType : leave.teacherName}
                            {leave.status === 'pending' && <span className="ml-1 text-amber-600">⏳</span>}
                          </div>
                        ))}
                        {leavesForDay.length > 2 && (
                          <div 
                            className="text-xs text-center bg-muted/50 rounded py-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowMoreLeaves(day, leavesForDay);
                            }}
                          >
                            +{leavesForDay.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );

                // Use button for clickable days, div for non-clickable
                if (canAddLeave && isCurrentMonth) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`relative p-2 rounded-lg min-h-24 border-2 transition-all text-left touch-manipulation ${
                        isToday
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30 active:bg-muted/50'
                      }`}
                      onClick={() => handleDateClick(day)}
                      data-testid={`calendar-day-${day.getDate()}`}
                    >
                      {dayContent}
                    </button>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`relative p-2 rounded-lg min-h-24 border-2 transition-all ${
                      isCurrentMonth
                        ? isToday
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                        : 'border-transparent bg-muted/20 text-muted-foreground'
                    }`}
                    data-testid={`calendar-day-${day.getDate()}`}
                  >
                    {dayContent}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">
                {isTeacher ? 'My Leaves' : 'Upcoming Leaves'}
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {approvedLeaves
                  .filter(l => isTeacher || new Date(l.startDate) >= today)
                  .slice(0, 5)
                  .map((leave) => (
                    <div 
                      key={leave.id} 
                      className={`border border-border rounded-lg p-3 text-sm cursor-pointer hover:bg-muted/50 ${leave.status === 'pending' ? 'bg-amber-50/50' : ''}`}
                      onClick={() => handleViewLeave(leave)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">
                          {isTeacher ? leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1) + ' Leave' : leave.teacherName}
                        </p>
                        <div className="flex items-center gap-1">
                          {leave.status === 'pending' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded border ${leaveTypeColors[leave.leaveType]}`}>
                            {leave.leaveType}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {leave.startDate.toLocaleDateString()} - {leave.endDate.toLocaleDateString()} ({leave.numberOfDays} days)
                      </p>
                    </div>
                  ))}
                {approvedLeaves.filter(l => isTeacher || new Date(l.startDate) >= today).length === 0 && (
                  <p className="text-xs text-muted-foreground">{isTeacher ? 'No leave records yet' : 'No upcoming leaves'}</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded border border-red-200" />
                  <span className="text-muted-foreground">Sick Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200" />
                  <span className="text-muted-foreground">Casual Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded border border-green-200" />
                  <span className="text-muted-foreground">Earned Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 rounded border border-purple-200" />
                  <span className="text-muted-foreground">Special Leave</span>
                </div>
                {isTeacher && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-100 rounded border border-amber-200 flex items-center justify-center text-xs">⏳</div>
                    <span className="text-muted-foreground">Pending Approval</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="w-4 h-4 border-2 border-primary rounded" />
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Leave Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isTeacher ? 'Request Leave' : 'Add Teacher Leave'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!isTeacher && (
              <div className="space-y-2">
                <Label htmlFor="teacherName">Teacher Name *</Label>
                <Input
                  id="teacherName"
                  value={newLeave.teacherName}
                  onChange={(e) => setNewLeave(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="Enter teacher name"
                  data-testid="input-teacher-name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select
                value={newLeave.leaveType}
                onValueChange={(value) => setNewLeave(prev => ({ ...prev, leaveType: value as any }))}
              >
                <SelectTrigger data-testid="select-leave-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="special">Special Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave(prev => ({ 
                    ...prev, 
                    startDate: e.target.value,
                    numberOfDays: calculateDays(e.target.value, prev.endDate)
                  }))}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave(prev => ({ 
                    ...prev, 
                    endDate: e.target.value,
                    numberOfDays: calculateDays(prev.startDate, e.target.value)
                  }))}
                  data-testid="input-end-date"
                />
              </div>
            </div>
            {newLeave.startDate && newLeave.endDate && (
              <p className="text-sm text-muted-foreground">
                Total Days: <span className="font-semibold">{calculateDays(newLeave.startDate, newLeave.endDate)}</span>
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={newLeave.reason}
                onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for leave"
                rows={3}
                data-testid="input-reason"
              />
            </div>
            {isTeacher && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                Your leave request will be submitted for approval by your Head Teacher.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel-leave">
                Cancel
              </Button>
              <Button onClick={handleCreateLeave} data-testid="button-save-leave">
                {isTeacher ? 'Submit Request' : 'Add Leave'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Leave Details</span>
              {user.role === 'HEAD_TEACHER' && selectedLeave?.schoolId === user.schoolId && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-1 rounded border capitalize ${
                  selectedLeave.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                  selectedLeave.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {selectedLeave.status}
                </span>
              </div>
              {!isTeacher && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Teacher</span>
                  <span className="font-medium">{selectedLeave.teacherName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">School</span>
                <span className="font-medium">{selectedLeave.schoolName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Leave Type</span>
                <span className={`text-xs px-2 py-1 rounded border capitalize ${leaveTypeColors[selectedLeave.leaveType]}`}>
                  {selectedLeave.leaveType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">{selectedLeave.numberOfDays} day(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dates</span>
                <span className="font-medium">
                  {selectedLeave.startDate.toLocaleDateString()} - {selectedLeave.endDate.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Reason</span>
                <p className="mt-1 text-sm bg-muted/50 rounded p-3">{selectedLeave.reason}</p>
              </div>
              {selectedLeave.approvedByName && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Approved By</span>
                  <span className="font-medium">{selectedLeave.approvedByName}</span>
                </div>
              )}
              {selectedLeave.evidenceFileName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Evidence</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    <Eye className="w-3 h-3 mr-1" />
                    {selectedLeave.evidenceFileName}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDayLeavesDialog} onOpenChange={setShowDayLeavesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Teachers on Leave - {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {dayLeaves.map((leave) => (
              <div 
                key={leave.id} 
                className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${leaveTypeColors[leave.leaveType]}`}
                onClick={() => {
                  setShowDayLeavesDialog(false);
                  handleViewLeave(leave);
                }}
                data-testid={`day-leave-${leave.id}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{leave.teacherName}</p>
                  <span className="text-xs capitalize">{leave.leaveType}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{leave.reason}</p>
                {leave.evidenceFileName && (
                  <p className="text-xs mt-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Evidence attached
                  </p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
