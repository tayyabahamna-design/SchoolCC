import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Search, MessageSquare, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { useState } from 'react';
import { useQueries, Query } from '@/hooks/useQueries';

const statusColors: Record<Query['status'], string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<Query['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-600',
  high: 'bg-red-100 text-red-600',
};

const statusIcons: Record<Query['status'], typeof Clock> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

export default function Queries() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getAllQueries, getQueriesBySender, getQueriesByRecipient } = useQueries();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!user) return null;

  let userQueries: Query[] = [];
  
  if (user.role === 'TEACHER') {
    userQueries = getQueriesBySender(user.id);
  } else if (user.role === 'CEO' || user.role === 'DEO' || user.role === 'DDEO') {
    userQueries = getAllQueries();
  } else {
    const sentQueries = getQueriesBySender(user.id);
    const receivedQueries = getQueriesByRecipient(user.id);
    const combined = [...sentQueries];
    receivedQueries.forEach(q => {
      if (!combined.find(c => c.id === q.id)) {
        combined.push(q);
      }
    });
    userQueries = combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const filteredQueries = userQueries.filter(q => {
    const matchesSearch = q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: userQueries.length,
    open: userQueries.filter(q => q.status === 'open').length,
    inProgress: userQueries.filter(q => q.status === 'in_progress').length,
    resolved: userQueries.filter(q => q.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
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
              <h1 className="text-2xl font-bold text-foreground">Queries & Requests</h1>
              <p className="text-sm text-muted-foreground">
                {user.role === 'TEACHER' ? 'Your submitted queries' : 'Manage queries from staff'}
              </p>
            </div>
          </div>
          {(user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && (
            <Button
              onClick={() => navigate('/create-query')}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              data-testid="button-create-query"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Query
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Queries</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket number, subject, or sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('open')}
                data-testid="filter-open"
              >
                Open
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in_progress')}
                data-testid="filter-in-progress"
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('resolved')}
                data-testid="filter-resolved"
              >
                Resolved
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredQueries.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Queries Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'No queries have been submitted yet'}
              </p>
              {user.role === 'TEACHER' && (
                <Button onClick={() => navigate('/create-query')} data-testid="button-create-first-query">
                  Submit Your First Query
                </Button>
              )}
            </Card>
          ) : (
            filteredQueries.map((query) => {
              const StatusIcon = statusIcons[query.status];
              return (
                <Card
                  key={query.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/query/${query.id}`)}
                  data-testid={`query-card-${query.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{query.ticketNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[query.status]}`}>
                          {query.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[query.priority]}`}>
                          {query.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{query.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{query.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>From: {query.senderName}</span>
                        <span>To: {query.recipientName}</span>
                        <span>{query.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <StatusIcon className={`w-5 h-5 flex-shrink-0 ${
                      query.status === 'open' ? 'text-blue-500' :
                      query.status === 'in_progress' ? 'text-amber-500' :
                      'text-green-500'
                    }`} />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
