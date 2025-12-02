import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Check, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Calendar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getPendingLeaves, getLeavesByDate } = useMockTeacherData();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!user) return null;

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

  const pendingLeaves = getPendingLeaves();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Leave Calendar</h1>
            <p className="text-sm text-muted-foreground">Track and manage teacher leave requests</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
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

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isToday = day.toDateString() === today.toDateString();
                const leavesForDay = getLeavesByDate(day);

                return (
                  <div
                    key={idx}
                    className={`relative p-2 rounded-lg text-center min-h-24 border-2 transition-all ${
                      isCurrentMonth
                        ? isToday
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/30'
                        : 'border-transparent bg-muted/20 text-muted-foreground'
                    }`}
                    data-testid={`calendar-day-${day.getDate()}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{day.getDate()}</div>
                    {leavesForDay.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {leavesForDay.slice(0, 2).map((leave) => (
                          <div
                            key={leave.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              leave.status === 'approved'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                            title={leave.teacherName}
                          >
                            {leave.teacherName.split(' ')[1]}
                          </div>
                        ))}
                        {leavesForDay.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{leavesForDay.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sidebar - Pending & Today's Leaves */}
          <div className="space-y-6">
            {/* Pending Leaves - Only for Head Teachers */}
            {user.role === 'HEAD_TEACHER' && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Pending Approvals
                </h3>
                <div className="space-y-3">
                  {pendingLeaves.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No pending leave requests</p>
                  ) : (
                    pendingLeaves.map((leave) => (
                      <div key={leave.id} className="border border-border rounded-lg p-3 text-sm">
                        <p className="font-medium text-foreground">{leave.teacherName}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.startDate.toLocaleDateString()} - {leave.endDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{leave.leaveType}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" data-testid={`button-approve-${leave.id}`}>
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" data-testid={`button-reject-${leave.id}`}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Legend */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 rounded border border-amber-200" />
                  <span className="text-muted-foreground">Approved Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200" />
                  <span className="text-muted-foreground">Pending Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary rounded" />
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
