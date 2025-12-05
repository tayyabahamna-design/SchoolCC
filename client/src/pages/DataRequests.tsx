import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockDataRequests, type DataRequest } from '@/hooks/useMockDataRequests';
import { useLocation } from 'wouter';
import { Plus, Download, ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DataRequests() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getRequestsForUser } = useMockDataRequests();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch fresh requests whenever component mounts, user changes, or refresh is triggered
  useEffect(() => {
    if (user) {
      const freshRequests = getRequestsForUser(user.id, user.role);
      setRequests(freshRequests);
    }
  }, [user?.id, user?.role, refreshTrigger]);

  // Auto-refresh when component becomes visible (page focus)
  useEffect(() => {
    const handleFocus = () => setRefreshTrigger((t) => t + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!user) return null;

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Data Requests</h1>
              <p className="text-sm text-muted-foreground">Manage and track all data requests</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DEO' || user.role === 'DDEO') && (
              <Button
                onClick={() => navigate('/create-request')}
                data-testid="button-create-new"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            )}
            <Button variant="outline" data-testid="button-export-csv">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {requests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No data requests found</p>
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER') && (
              <Button onClick={() => navigate('/create-request')}>Create Your First Request</Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const userAssignee = req.assignees.find((a: any) => a.userId === user.id);
              const displayStatus = userAssignee?.status || 'assigned';

              return (
                <Card
                  key={req.id}
                  className="p-4 hover:border-primary/30 cursor-pointer transition-all"
                  onClick={() => navigate(`/request/${req.id}`)}
                  data-testid={`card-request-${req.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{req.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            req.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : req.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created by {req.createdByName}</span>
                        <span>Due: {req.dueDate.toLocaleDateString()}</span>
                        <span>{req.assignees.length} assignee(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          {getStatusIcon(displayStatus)}
                          <span className="text-sm font-medium text-foreground capitalize">
                            {displayStatus}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {req.assignees.filter((a: any) => a.status === 'completed').length}/
                          {req.assignees.length} completed
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
    </div>
  );
}
