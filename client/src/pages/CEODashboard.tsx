import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ChevronRight, Download, Users, Building2, AlertCircle, TrendingUp, CheckCircle, Clock, Plus, FileText, User, Menu, BarChart3, Settings, Home, ImageIcon, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/NotificationBell';

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

export default function CEODashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'sheets' | 'docs' | ''>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || user.role !== 'CEO') {
    navigate('/');
    return null;
  }

  const mockData: DEO[] = [
    {
      id: 'deo-1',
      name: 'Rawalpindi District',
      district: 'Rawalpindi',
      ddeos: [
        {
          id: 'ddeo-1',
          name: 'Rawalpindi City',
          aeos: [
            {
              id: 'aeo-1',
              name: 'Sadiqabad Cluster',
              schools: [
                { id: 'school-1', name: 'GGPS Sadiqabad', teachers: 8, headTeachers: 1, pendingRequests: 2, complianceScore: 85 },
                { id: 'school-2', name: 'GGPS Dhoke Syedan', teachers: 10, headTeachers: 1, pendingRequests: 1, complianceScore: 88 },
                { id: 'school-3', name: 'GGPS Dhoke Ratta', teachers: 7, headTeachers: 1, pendingRequests: 3, complianceScore: 82 },
                { id: 'school-4', name: 'GGPS Pirwadhai', teachers: 12, headTeachers: 1, pendingRequests: 0, complianceScore: 91 },
              ],
            },
            {
              id: 'aeo-2',
              name: 'Satellite Town Cluster',
              schools: [
                { id: 'school-5', name: 'GGPS Satellite Town', teachers: 15, headTeachers: 1, pendingRequests: 2, complianceScore: 89 },
                { id: 'school-6', name: 'GGPS Dhoke Kala Khan', teachers: 9, headTeachers: 1, pendingRequests: 4, complianceScore: 78 },
                { id: 'school-7', name: 'GGPS Committee Chowk', teachers: 11, headTeachers: 1, pendingRequests: 1, complianceScore: 86 },
                { id: 'school-8', name: 'GGPS Liaquat Bagh', teachers: 13, headTeachers: 1, pendingRequests: 2, complianceScore: 90 },
              ],
            },
          ],
        },
        {
          id: 'ddeo-2',
          name: 'Rawalpindi Cantt',
          aeos: [
            {
              id: 'aeo-3',
              name: 'Cantt Cluster',
              schools: [
                { id: 'school-9', name: 'GGPS Westridge', teachers: 14, headTeachers: 1, pendingRequests: 0, complianceScore: 94 },
                { id: 'school-10', name: 'GGPS Tench Bhatta', teachers: 10, headTeachers: 1, pendingRequests: 3, complianceScore: 83 },
                { id: 'school-11', name: 'GGPS Dhoke Hassu', teachers: 8, headTeachers: 1, pendingRequests: 2, complianceScore: 87 },
                { id: 'school-12', name: 'GGPS Chaklala', teachers: 12, headTeachers: 1, pendingRequests: 1, complianceScore: 92 },
              ],
            },
            {
              id: 'aeo-4',
              name: 'Morgah Cluster',
              schools: [
                { id: 'school-13', name: 'GGPS Morgah', teachers: 11, headTeachers: 1, pendingRequests: 4, complianceScore: 80 },
                { id: 'school-14', name: 'GGPS Adiala Road', teachers: 9, headTeachers: 1, pendingRequests: 2, complianceScore: 84 },
                { id: 'school-15', name: 'GGPS Dhoke Munshi', teachers: 10, headTeachers: 1, pendingRequests: 1, complianceScore: 88 },
                { id: 'school-16', name: 'GGPS Bahria Town', teachers: 16, headTeachers: 1, pendingRequests: 0, complianceScore: 95 },
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

  const getAllSchools = useMemo(() => {
    const schools: School[] = [];
    mockData.forEach(deo => {
      deo.ddeos.forEach(ddeo => {
        ddeo.aeos.forEach(aeo => {
          aeo.schools.forEach(school => {
            schools.push(school);
          });
        });
      });
    });
    return schools;
  }, []);

  const handleExportSchool = async (schoolId: string, format: 'sheets' | 'docs') => {
    const school = getAllSchools.find(s => s.id === schoolId);
    if (!school) return;

    // Dynamically import jsPDF and autoTable
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Create new PDF document
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('SCHOOL DATA REPORT', 105, 20, { align: 'center' });

    // Add horizontal line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    if (format === 'sheets') {
      // Table format with columns and rows for sheets
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`School: ${school.name}`, 20, 35);

      // Create table data
      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: [
          ['School Name', school.name],
          ['School ID', school.id],
          ['Total Teachers', school.teachers.toString()],
          ['Head Teachers', school.headTeachers.toString()],
          ['Pending Requests', school.pendingRequests.toString()],
          ['Compliance Score', `${school.complianceScore}%`],
          ['Export Date', new Date().toLocaleDateString()],
          ['Export Time', new Date().toLocaleTimeString()],
        ],
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
        },
        bodyStyles: {
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 'auto' },
        },
        margin: { top: 45, left: 20, right: 20 },
      });
    } else {
      // Formatted report style for docs
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      let yPos = 40;

      // School Information Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('School Information', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      doc.text(`School Name:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(school.name, 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 10;

      doc.text(`School ID:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(school.id, 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      // Staff Information Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Staff Information', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      doc.text(`Total Teachers:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(school.teachers.toString(), 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 10;

      doc.text(`Head Teachers:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(school.headTeachers.toString(), 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      // Performance Metrics Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Performance Metrics', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      doc.text(`Pending Requests:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(school.pendingRequests.toString(), 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 10;

      doc.text(`Compliance Score:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(school.complianceScore >= 80 ? 0 : 200, school.complianceScore >= 80 ? 150 : 0, 0);
      doc.text(`${school.complianceScore}%`, 70, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      yPos += 20;

      // Export Details Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Export Details', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      doc.text(`Export Date:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date().toLocaleDateString(), 70, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 10;

      doc.text(`Export Time:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date().toLocaleTimeString(), 70, yPos);
      doc.setFont('helvetica', 'normal');
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by SchoolCC Management System', 105, 280, { align: 'center' });

    // Save the PDF
    doc.save(`${school.name.replace(/\s+/g, '_')}_report.pdf`);

    // Reset selection after export
    setSelectedExportFormat('');
  };

  // Get top and bottom performing schools
  const topSchools = useMemo(() => {
    return [...getAllSchools].sort((a, b) => b.complianceScore - a.complianceScore).slice(0, 5);
  }, [getAllSchools]);

  const schoolsNeedingAttention = useMemo(() => {
    return getAllSchools.filter(s => s.pendingRequests > 2 || s.complianceScore < 85);
  }, [getAllSchools]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="font-bold text-xl gradient-text">SchoolCC</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="default"
            className="w-full justify-start gap-3"
            onClick={() => navigate('/ceo-dashboard')}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate('/data-requests')}
          >
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Requests</span>}
            {sidebarOpen && calculateAggregates.totalPendingRequests > 0 && (
              <Badge variant="destructive" className="ml-auto">{calculateAggregates.totalPendingRequests}</Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate('/school-visits')}
            data-testid="button-school-visits"
          >
            <MapPin className="w-5 h-5" />
            {sidebarOpen && <span>School Visits</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => toast({ title: "Coming Soon", description: "Analytics feature is under development" })}
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Analytics</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-5 h-5" />
            {sidebarOpen && <span>Export Data</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate('/profile')}
          >
            <User className="w-5 h-5" />
            {sidebarOpen && <span>Profile</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => toast({ title: "Coming Soon", description: "Settings feature is under development" })}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mission Control</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/profile')}>{user.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/create-request')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden hover-lift">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <span className="text-xs font-semibold text-primary">Live</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Total Schools
                  </p>
                  <p className="text-5xl font-bold gradient-text tracking-tight">
                    {calculateAggregates.totalSchools}
                  </p>
                  <p className="text-xs text-muted-foreground">Across Rawalpindi district</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>

            <Card className="group relative overflow-hidden hover-lift">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <span className="text-xs font-semibold text-primary">Live</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Total Teachers
                  </p>
                  <p className="text-5xl font-bold gradient-text tracking-tight">
                    {calculateAggregates.totalTeachers}
                  </p>
                  <p className="text-xs text-muted-foreground">Active educators</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>

            <Card className="group relative overflow-hidden hover-lift cursor-pointer" onClick={() => navigate('/data-requests')}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <AlertCircle className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                    <span className="text-xs font-semibold text-red-600">Action Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Pending Requests
                  </p>
                  <p className="text-5xl font-bold gradient-text tracking-tight">
                    {calculateAggregates.totalPendingRequests}
                  </p>
                  <p className="text-xs text-muted-foreground">Click to review</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>

            <Card className="group relative overflow-hidden hover-lift">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <CheckCircle className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <span className="text-xs font-semibold text-green-600">Excellent</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Avg Compliance
                  </p>
                  <p className="text-5xl font-bold gradient-text tracking-tight">
                    {calculateAggregates.avgCompliance}%
                  </p>
                  <p className="text-xs text-muted-foreground">District-wide metric</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </div>

          {/* Quick Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Schools */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performers
                </h3>
                <Badge variant="secondary">{topSchools.length} Schools</Badge>
              </div>
              <div className="space-y-3">
                {topSchools.map((school, index) => (
                  <div key={school.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.teachers} teachers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{school.complianceScore}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Schools Needing Attention */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Needs Attention
                </h3>
                <Badge variant="destructive">{schoolsNeedingAttention.length} Schools</Badge>
              </div>
              <div className="space-y-3">
                {schoolsNeedingAttention.slice(0, 5).map((school) => (
                  <div key={school.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{school.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {school.pendingRequests > 2 && `${school.pendingRequests} pending requests`}
                          {school.pendingRequests > 2 && school.complianceScore < 85 && ' • '}
                          {school.complianceScore < 85 && `${school.complianceScore}% compliance`}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* District Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                District Breakdown
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData[0].ddeos.map((ddeo) => {
                const schoolCount = ddeo.aeos.reduce((acc, aeo) => acc + aeo.schools.length, 0);
                const teacherCount = ddeo.aeos.reduce((acc, aeo) =>
                  acc + aeo.schools.reduce((sum, s) => sum + s.teachers, 0), 0
                );
                const avgCompliance = Math.round(
                  ddeo.aeos.reduce((acc, aeo) =>
                    acc + aeo.schools.reduce((sum, s) => sum + s.complianceScore, 0), 0
                  ) / schoolCount
                );

                return (
                  <div key={ddeo.id} className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{ddeo.name}</h4>
                        <p className="text-sm text-muted-foreground">{schoolCount} schools • {teacherCount} teachers</p>
                      </div>
                      <Badge variant={avgCompliance >= 85 ? "default" : "secondary"}>
                        {avgCompliance}% avg
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {ddeo.aeos.map((aeo) => (
                        <div key={aeo.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{aeo.name}</span>
                          <span className="font-medium">{aeo.schools.length} schools</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/data-requests')}>
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">New data request submitted</p>
                  <p className="text-xs text-muted-foreground mt-1">GGPS Dhoke Kala Khan • 2 hours ago</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Request completed</p>
                  <p className="text-xs text-muted-foreground mt-1">GGPS Bahria Town • 5 hours ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Follow-up required</p>
                  <p className="text-xs text-muted-foreground mt-1">GGPS Morgah • 1 day ago</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Export School Data Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">
              Export School Data
            </DialogTitle>
            <DialogDescription>
              Select a school and export format to download school data
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {getAllSchools.map((school) => (
              <div
                key={school.id}
                className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {school.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {school.teachers} teachers · Compliance: {school.complianceScore}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigate(`/album/${school.id}`);
                        setShowExportModal(false);
                      }}
                      className="gap-2 h-9"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Album
                    </Button>
                    <Select
                      value={selectedExportFormat}
                      onValueChange={(value) => setSelectedExportFormat(value as 'sheets' | 'docs')}
                    >
                      <SelectTrigger className="w-[140px] h-9 text-xs">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sheets">Google Sheets</SelectItem>
                        <SelectItem value="docs">Google Docs</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedExportFormat) {
                          handleExportSchool(school.id, selectedExportFormat);
                        }
                      }}
                      disabled={!selectedExportFormat}
                      className="gap-2 h-9"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowExportModal(false);
                setSelectedExportFormat('');
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
