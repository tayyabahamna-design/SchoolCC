import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, MapPin, CheckCircle, Clock, Eye, Search, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SchoolVisits() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getVisitsForUser } = useMockVisits();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const userVisits = getVisitsForUser(user.id, user.role);
  
  const filteredVisits = userVisits.filter((visit) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      visit.schoolName.toLowerCase().includes(query) ||
      visit.visitType.toLowerCase().includes(query) ||
      visit.status.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planned':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'monitoring':
        return 'bg-purple-100 text-purple-700';
      case 'mentoring':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(user.role === 'CEO' ? '/ceo-dashboard' : '/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">School Visits</h1>
              <p className="text-sm text-muted-foreground">Plan, conduct, and monitor school visits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user.role === 'AEO' && (
              <Button onClick={() => navigate('/create-visit')} data-testid="button-create-visit">
                <Plus className="w-4 h-4 mr-2" />
                Plan Visit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by school, type, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              data-testid="input-search-visits"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {filteredVisits.length === 0 && searchQuery ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No visits match your search</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </Card>
        ) : userVisits.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No visits recorded</p>
            {user.role === 'AEO' && (
              <Button onClick={() => navigate('/create-visit')}>Plan Your First Visit</Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVisits.map((visit) => (
              <Card
                key={visit.id}
                className="p-6 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/visit/${visit.id}`)}
                data-testid={`card-visit-${visit.id}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">School</p>
                    <p className="font-semibold text-foreground uppercase">{visit.schoolName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Visit Type</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getVisitTypeColor(visit.visitType)}`}>
                      {visit.visitType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-foreground">{visit.visitDate.toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {visit.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                      <span className={`text-xs font-medium capitalize px-2 py-1 rounded ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evidence</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{visit.photoCount} photos</span>
                      <span>•</span>
                      <span>{visit.voiceNotesCount} notes</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      data-testid={`button-view-visit-${visit.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {/* GPS Location for completed visits */}
                {visit.status === 'completed' && visit.gpsLocation && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-foreground">GPS Tracked Location:</span>
                      <span>
                        {visit.gpsLocation.lat.toFixed(6)}, {visit.gpsLocation.lng.toFixed(6)}
                      </span>
                      {visit.gpsStartLocation && visit.gpsEndLocation && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    {visit.startTime && visit.endTime && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Start: {new Date(visit.startTime).toLocaleTimeString()}</span>
                        <span>End: {new Date(visit.endTime).toLocaleTimeString()}</span>
                        {visit.duration && <span>Duration: {visit.duration} mins</span>}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
