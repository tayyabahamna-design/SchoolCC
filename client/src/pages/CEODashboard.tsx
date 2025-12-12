import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, ChevronRight, ChevronDown, Download, Filter, Users, Building2, AlertCircle, TrendingUp, CheckCircle, Clock, Plus, FileText, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface School {
  id: string;
  name: string;
  teachers: number;
  headTeachers: number;
  pendingRequests: number;
  complianceScore: number;
}

interface AEO {
  id: string;
  name: string;
  schools: School[];
}

interface DDEO {
  id: string;
  name: string;
  aeos: AEO[];
}

interface DEO {
  id: string;
  name: string;
  district: string;
  ddeos: DDEO[];
}

interface HierarchyNode {
  id: string;
  name: string;
  type: 'DEO' | 'DDEO' | 'AEO' | 'SCHOOL';
  level: number;
  expanded: boolean;
}

export default function CEODashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['deo-1', 'deo-2']));
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'deo' | 'ddeo' | 'aeo' | 'school'>('all');

  if (!user || user.role !== 'CEO') {
    navigate('/');
    return null;
  }

  const mockData: DEO[] = [
    {
      id: 'deo-1',
      name: 'North District',
      district: 'District A',
      ddeos: [
        {
          id: 'ddeo-1',
          name: 'North Region',
          aeos: [
            {
              id: 'aeo-1',
              name: 'Cluster 1 - Urban',
              schools: [
                { id: 'school-1', name: 'Government Primary School, Zone A', teachers: 12, headTeachers: 1, pendingRequests: 3, complianceScore: 92 },
                { id: 'school-2', name: 'Government High School, Zone A', teachers: 28, headTeachers: 1, pendingRequests: 1, complianceScore: 88 },
              ],
            },
            {
              id: 'aeo-2',
              name: 'Cluster 2 - Rural',
              schools: [
                { id: 'school-3', name: 'Government Primary School, Zone B', teachers: 8, headTeachers: 1, pendingRequests: 5, complianceScore: 76 },
                { id: 'school-4', name: 'Government Primary School, Zone C', teachers: 6, headTeachers: 1, pendingRequests: 2, complianceScore: 84 },
              ],
            },
          ],
        },
        {
          id: 'ddeo-2',
          name: 'South Region',
          aeos: [
            {
              id: 'aeo-3',
              name: 'Cluster 3',
              schools: [
                { id: 'school-5', name: 'Government School Complex, Zone D', teachers: 35, headTeachers: 2, pendingRequests: 0, complianceScore: 96 },
                { id: 'school-6', name: 'Government Primary School, Zone E', teachers: 10, headTeachers: 1, pendingRequests: 4, complianceScore: 82 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'deo-2',
      name: 'South District',
      district: 'District B',
      ddeos: [
        {
          id: 'ddeo-3',
          name: 'East Region',
          aeos: [
            {
              id: 'aeo-4',
              name: 'Cluster 4',
              schools: [
                { id: 'school-7', name: 'Government High School, Zone F', teachers: 32, headTeachers: 1, pendingRequests: 2, complianceScore: 90 },
                { id: 'school-8', name: 'Government Primary School, Zone G', teachers: 9, headTeachers: 1, pendingRequests: 1, complianceScore: 91 },
              ],
            },
          ],
        },
      ],
    },
  ];

  const calculateAggregates = useMemo(() => {
    let totalSchools = 0;
    let totalTeachers = 0;
    let totalPendingRequests = 0;
    let avgCompliance = 0;
    let complianceCount = 0;

    mockData.forEach(deo => {
      deo.ddeos.forEach(ddeo => {
        ddeo.aeos.forEach(aeo => {
          aeo.schools.forEach(school => {
            totalSchools++;
            totalTeachers += school.teachers;
            totalPendingRequests += school.pendingRequests;
            avgCompliance += school.complianceScore;
            complianceCount++;
          });
        });
      });
    });

    return {
      totalSchools,
      totalTeachers,
      totalPendingRequests,
      avgCompliance: Math.round(avgCompliance / complianceCount),
    };
  }, []);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredData = mockData.filter(deo => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deo.name.toLowerCase().includes(query) ||
      deo.district.toLowerCase().includes(query) ||
      deo.ddeos.some(ddeo =>
        ddeo.name.toLowerCase().includes(query) ||
        ddeo.aeos.some(aeo =>
          aeo.name.toLowerCase().includes(query) ||
          aeo.schools.some(school => school.name.toLowerCase().includes(query))
        )
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mission Control</h1>
            <p className="text-sm text-slate-600 mt-1">System-wide monitoring & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              data-testid="button-profile"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Welcome back, <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/profile')}>{user.name}</span>
          </h2>
          <p className="text-slate-600">You have system-wide visibility across all districts, regions, clusters, and schools.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Schools</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{calculateAggregates.totalSchools}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Teachers</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{calculateAggregates.totalTeachers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{calculateAggregates.totalPendingRequests}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Compliance</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{calculateAggregates.avgCompliance}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by district, region, cluster, or school name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
              className="w-full"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Hierarchical Tree View */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>Organizational Hierarchy</span>
            <span className="text-sm font-normal text-slate-600">Click to drill down</span>
          </h3>

          <div className="space-y-0 divide-y divide-slate-200">
            {filteredData.map(deo => (
              <div key={deo.id}>
                {/* DEO Level */}
                <div
                  className="py-4 px-4 hover:bg-slate-50 cursor-pointer transition-colors rounded-lg mb-2"
                  onClick={() => toggleNode(deo.id)}
                  data-testid={`node-deo-${deo.id}`}
                >
                  <div className="flex items-center gap-3">
                    {expandedNodes.has(deo.id) ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{deo.name}</div>
                      <div className="text-sm text-slate-600">{deo.district}</div>
                    </div>
                    <div className="text-sm text-slate-600">
                      {deo.ddeos.reduce((acc, d) => acc + d.aeos.reduce((a, ae) => a + ae.schools.length, 0), 0)} schools
                    </div>
                  </div>
                </div>

                {/* Expanded DDEO Level */}
                {expandedNodes.has(deo.id) && (
                  <div className="pl-8 space-y-2">
                    {deo.ddeos.map(ddeo => (
                      <div key={ddeo.id}>
                        <div
                          className="py-3 px-4 hover:bg-slate-50 cursor-pointer transition-colors rounded-lg"
                          onClick={() => toggleNode(ddeo.id)}
                          data-testid={`node-ddeo-${ddeo.id}`}
                        >
                          <div className="flex items-center gap-3">
                            {expandedNodes.has(ddeo.id) ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-slate-800">{ddeo.name}</div>
                            </div>
                            <div className="text-sm text-slate-600">
                              {ddeo.aeos.reduce((a, ae) => a + ae.schools.length, 0)} schools
                            </div>
                          </div>
                        </div>

                        {/* Expanded AEO Level */}
                        {expandedNodes.has(ddeo.id) && (
                          <div className="pl-8 space-y-2 mt-2">
                            {ddeo.aeos.map(aeo => (
                              <div key={aeo.id}>
                                <div
                                  className="py-3 px-4 hover:bg-blue-50 cursor-pointer transition-colors rounded-lg border border-blue-100"
                                  onClick={() => toggleNode(aeo.id)}
                                  data-testid={`node-aeo-${aeo.id}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {expandedNodes.has(aeo.id) ? (
                                      <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-blue-600" />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-blue-900">{aeo.name}</div>
                                    </div>
                                    <div className="text-sm text-blue-700 font-medium">{aeo.schools.length} schools</div>
                                  </div>
                                </div>

                                {/* School Level */}
                                {expandedNodes.has(aeo.id) && (
                                  <div className="pl-8 space-y-2 mt-2">
                                    {aeo.schools.map(school => (
                                      <div
                                        key={school.id}
                                        className="py-3 px-4 hover:bg-emerald-50 cursor-pointer transition-colors rounded-lg border border-emerald-100"
                                        data-testid={`node-school-${school.id}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <Building2 className="w-4 h-4 text-emerald-600" />
                                          <div className="flex-1">
                                            <div className="font-medium text-emerald-900">{school.name}</div>
                                            <div className="text-xs text-emerald-700 mt-1">
                                              {school.headTeachers} Head · {school.teachers} Teachers · {school.pendingRequests} Pending
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-sm font-semibold text-emerald-700">{school.complianceScore}%</div>
                                            <div className="text-xs text-emerald-600">Compliance</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-violet-900">Create Request</h3>
              <Plus className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-sm text-violet-800 mb-4">Send data requests to any level in the hierarchy.</p>
            <Button 
              size="sm" 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white" 
              onClick={() => navigate('/create-request')}
              data-testid="button-create-request"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-blue-900">View Analytics</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-blue-800 mb-4">Detailed reports and trends across all DEOs.</p>
            <Button size="sm" variant="outline" className="w-full bg-white hover:bg-blue-50" data-testid="button-analytics">
              View Reports
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-amber-900">Escalations</h3>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-amber-800 mb-4">{calculateAggregates.totalPendingRequests} items flagged for action.</p>
            <Button size="sm" variant="outline" className="w-full bg-white hover:bg-amber-50" data-testid="button-escalations">
              Review Now
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-emerald-900">Audit Trail</h3>
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-800 mb-4">Track all system changes and evidence submissions.</p>
            <Button size="sm" variant="outline" className="w-full bg-white hover:bg-emerald-50" data-testid="button-audit">
              View Trail
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
