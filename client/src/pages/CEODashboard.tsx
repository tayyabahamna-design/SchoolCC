import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ChevronRight, Download, Users, Building2, AlertCircle, TrendingUp, CheckCircle, Clock, Plus, FileText, User, Menu, BarChart3, Settings, Home, ImageIcon, MapPin, X, Calendar, MessageSquare, HelpCircle } from 'lucide-react';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { MetricCard } from '@/components/dashboard';

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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card/95 dark:bg-card backdrop-blur-xl border-r border-border animate-slideInLeft overflow-y-auto flex flex-col">
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-12 h-12" />
                <div>
                  <h1 className="text-lg font-bold gradient-text-gold">TaleemHub</h1>
                  <p className="text-xs text-muted-foreground">CEO</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg">
                    <span className="text-lg font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{user.name}</h3>
                  <p className="text-xs text-muted-foreground">CEO</p>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Quick Actions</p>
              <nav className="space-y-2">
                <button
                  onClick={() => { navigate('/data-requests'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Data Requests</span>
                </button>
                <button
                  onClick={() => { navigate('/user-management'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">User Management</span>
                </button>
                
                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Navigate</p>
                </div>
                
                <button
                  onClick={() => { navigate('/calendar'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Leave Calendar</span>
                </button>
                <button
                  onClick={() => { navigate('/community-album'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-pink-100/80 dark:hover:bg-pink-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Community Album</span>
                </button>
                <button
                  onClick={() => { navigate('/school-data'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">School Inventory</span>
                </button>
                <button
                  onClick={() => { navigate('/school-visits'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-rose-100/80 dark:hover:bg-rose-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">School Visits</span>
                </button>
                <button
                  onClick={() => { navigate('/queries'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Queries</span>
                </button>
                
                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Support</p>
                </div>
                
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openHelpGuide'));
                    setShowMobileSidebar(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Help Guide</span>
                </button>
              </nav>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex-col`}>
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
            onClick={() => navigate('/user-management')}
            data-testid="button-user-management"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>User Management</span>}
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
        {/* Mobile Header */}
        <div className="lg:hidden bg-card/95 dark:bg-card backdrop-blur-xl border-b border-border sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(true)}
                className="rounded-full"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-lg font-bold gradient-text-gold">TaleemHub</h1>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-gray-700">
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Mission Control</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back, <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/profile')}>{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/create-request')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
              value={calculateAggregates.totalSchools}
              label="Total Schools"
              icon={Building2}
              iconGradient="from-blue-500 to-blue-600"
              size="xl"
              badge={{ text: "Live", variant: "secondary", className: "bg-primary/10 text-primary" }}
              breakdown={[
                { label: "Across Rawalpindi district", value: "", showAsBadge: false }
              ]}
              className="hover-lift group relative overflow-hidden"
            />

            <MetricCard
              value={calculateAggregates.totalTeachers}
              label="Total Teachers"
              icon={Users}
              iconGradient="from-purple-500 to-purple-600"
              size="xl"
              badge={{ text: "Live", variant: "secondary", className: "bg-primary/10 text-primary" }}
              breakdown={[
                { label: "Active educators", value: "", showAsBadge: false }
              ]}
              className="hover-lift group relative overflow-hidden"
            />

            <MetricCard
              value={calculateAggregates.totalPendingRequests}
              label="Pending Requests"
              icon={AlertCircle}
              iconGradient="from-red-500 to-orange-500"
              size="xl"
              onClick={() => navigate('/data-requests')}
              badge={{ text: "Action Required", variant: "destructive", className: "bg-red-500/10 text-red-600" }}
              breakdown={[
                { label: "Click to review", value: "", showAsBadge: false }
              ]}
              className="hover-lift group relative overflow-hidden cursor-pointer"
            />

            <MetricCard
              value={`${calculateAggregates.avgCompliance}%`}
              label="Avg Compliance"
              icon={CheckCircle}
              iconGradient="from-green-500 to-emerald-500"
              size="xl"
              badge={{ text: "Excellent", variant: "secondary", className: "bg-green-500/10 text-green-600" }}
              breakdown={[
                { label: "District-wide metric", value: "", showAsBadge: false }
              ]}
              className="hover-lift group relative overflow-hidden"
            />
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
                        <p className="font-medium text-sm text-foreground uppercase">{school.name}</p>
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
                        <p className="font-medium text-sm text-foreground uppercase">{school.name}</p>
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
                      <h4 className="font-semibold text-sm text-foreground truncate uppercase">
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
