import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockTeacherData, SchoolData as SchoolDataType } from '@/hooks/useMockTeacherData';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, Users, BookOpen, Droplet, Zap, BarChart3, ImageIcon, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SchoolData() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getSchoolData, getSchoolById } = useMockTeacherData(user?.assignedSchools);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDataType | null>(null);

  if (!user) return null;

  const allSchools = getSchoolData();
  const userSchool = user.schoolId ? getSchoolById(user.schoolId) : null;

  // Teachers and head teachers only see their own school
  const visibleSchools = (user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && userSchool
    ? [userSchool]
    : allSchools;

  // Download individual school inventory as XLSX
  const downloadSchoolInventory = (school: SchoolDataType) => {
    // Create comprehensive school inventory data
    const inventoryData = [
      // Basic Information
      { Category: 'SCHOOL INFORMATION', Item: '', Details: '' },
      { Category: 'School Name', Item: school.name, Details: '' },
      { Category: 'District', Item: school.district, Details: '' },
      { Category: 'Block/Cluster', Item: school.block, Details: '' },
      { Category: 'Principal Name', Item: school.principalName, Details: '' },
      { Category: 'Compliance Score', Item: `${school.compliance}%`, Details: '' },
      { Category: '', Item: '', Details: '' },

      // Enrollment
      { Category: 'ENROLLMENT', Item: '', Details: '' },
      { Category: 'Total Students', Item: school.totalStudents.toString(), Details: '' },
      { Category: 'Boys', Item: school.enrollment.boys.toString(), Details: '' },
      { Category: 'Girls', Item: school.enrollment.girls.toString(), Details: '' },
      { Category: 'Total Teachers', Item: school.totalTeachers.toString(), Details: '' },
      { Category: 'Student-Teacher Ratio', Item: `1:${(school.totalStudents / school.totalTeachers).toFixed(1)}`, Details: '' },
      { Category: '', Item: '', Details: '' },

      // Infrastructure
      { Category: 'INFRASTRUCTURE', Item: '', Details: '' },
      { Category: 'Total Classrooms', Item: school.infrastructure.classrooms.toString(), Details: '' },
      { Category: 'Total Toilets', Item: school.infrastructure.toilets.toString(), Details: '' },
      { Category: 'Drinking Water', Item: school.infrastructure.waterSource ? 'Available' : 'Not Available', Details: '' },
      { Category: 'Electricity', Item: school.infrastructure.electricity ? 'Available' : 'Not Available', Details: '' },
    ];

    // Add furniture inventory if available
    if (school.furniture) {
      inventoryData.push(
        { Category: '', Item: '', Details: '' },
        { Category: 'FURNITURE INVENTORY', Item: '', Details: '' },
        { Category: '', Item: 'New', Details: 'Old', Status: 'In Use', Broken: 'Broken' } as any,
        { Category: 'Desks', Item: school.furniture.desks.new.toString(), Details: school.furniture.desks.old.toString(), Status: school.furniture.desks.inUse.toString(), Broken: school.furniture.desks.broken.toString() } as any,
        { Category: 'Chairs', Item: school.furniture.chairs.new.toString(), Details: school.furniture.chairs.old.toString(), Status: school.furniture.chairs.inUse.toString(), Broken: school.furniture.chairs.broken.toString() } as any,
        { Category: 'Benches', Item: school.furniture.benches.new.toString(), Details: school.furniture.benches.old.toString(), Status: school.furniture.benches.inUse.toString(), Broken: school.furniture.benches.broken.toString() } as any,
        { Category: 'Blackboards', Item: school.furniture.blackboards.new.toString(), Details: school.furniture.blackboards.old.toString(), Status: school.furniture.blackboards.inUse.toString(), Broken: school.furniture.blackboards.broken.toString() } as any,
        { Category: 'Whiteboards', Item: school.furniture.whiteboards.new.toString(), Details: school.furniture.whiteboards.old.toString(), Status: school.furniture.whiteboards.inUse.toString(), Broken: school.furniture.whiteboards.broken.toString() } as any,
        { Category: 'Fans', Item: school.furniture.fans.new.toString(), Details: school.furniture.fans.old.toString(), Status: school.furniture.fans.inUse.toString(), Broken: school.furniture.fans.broken.toString() } as any,
        { Category: 'Computers', Item: school.furniture.computers.new.toString(), Details: school.furniture.computers.old.toString(), Status: school.furniture.computers.inUse.toString(), Broken: school.furniture.computers.broken.toString() } as any,
        { Category: 'Cupboards', Item: school.furniture.cupboards.new.toString(), Details: school.furniture.cupboards.old.toString(), Status: school.furniture.cupboards.inUse.toString(), Broken: school.furniture.cupboards.broken.toString() } as any
      );
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(inventoryData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 },  // Category
      { wch: 15 },  // Item/New
      { wch: 15 },  // Details/Old
      { wch: 15 },  // Status/In Use
      { wch: 15 },  // Broken
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'School Inventory');

    // Download file
    const fileName = `${school.name.replace(/[^a-z0-9]/gi, '_')}_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
              onClick={() => navigate('/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">School Inventory & Data</h1>
              <p className="text-sm text-muted-foreground">Infrastructure, enrollment, and compliance records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" data-testid="button-export-schools">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User's School (if applicable) */}
        {userSchool && (user.role === 'HEAD_TEACHER' || user.role === 'TEACHER') && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your School Profile</h2>
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">School Name</p>
                  <p className="text-lg font-semibold text-foreground">{userSchool.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Principal</p>
                  <p className="font-medium text-foreground">{userSchool.principalName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium text-foreground">{userSchool.block}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Compliance Score</p>
                  <p className="text-2xl font-bold text-primary">{userSchool.compliance}%</p>
                </div>
              </div>

              {/* Enrollment & Infrastructure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Enrollment
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Students:</span>
                      <span className="font-semibold text-foreground">{userSchool.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Boys:</span>
                      <span className="font-semibold text-foreground">{userSchool.enrollment.boys}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Girls:</span>
                      <span className="font-semibold text-foreground">{userSchool.enrollment.girls}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    Staffing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Teachers:</span>
                      <span className="font-semibold text-foreground">{userSchool.totalTeachers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Student/Teacher:</span>
                      <span className="font-semibold text-foreground">
                        {(userSchool.totalStudents / userSchool.totalTeachers).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    Infrastructure
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Classrooms:</span>
                      <span className="font-semibold text-foreground">{userSchool.infrastructure.classrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Toilets:</span>
                      <span className="font-semibold text-foreground">{userSchool.infrastructure.toilets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Water:</span>
                      <span className={userSchool.infrastructure.waterSource ? 'text-green-600' : 'text-red-600'}>
                        {userSchool.infrastructure.waterSource ? '✓ Available' : '✗ N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Electricity:</span>
                      <span className={userSchool.infrastructure.electricity ? 'text-green-600' : 'text-red-600'}>
                        {userSchool.infrastructure.electricity ? '✓ Available' : '✗ N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* All Schools in District */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {user.role === 'CEO' ? 'All Schools' : user.role === 'DEO' || user.role === 'DDEO' ? 'All Schools in District' : user.role === 'AEO' ? 'Schools in Your Area' : 'Your School'}
          </h2>
          <div className="grid gap-4">
            {visibleSchools.map((school) => (
              <Card key={school.id} className="p-6 hover:border-primary/30 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">School Name</p>
                    <p className="font-semibold text-foreground">{school.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{school.block}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                    <p className="text-xl font-bold text-foreground">{school.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">B: {school.enrollment.boys} G: {school.enrollment.girls}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Teachers</p>
                    <p className="text-xl font-bold text-foreground">{school.totalTeachers}</p>
                    <p className="text-xs text-muted-foreground">Ratio: 1:{(school.totalStudents / school.totalTeachers).toFixed(1)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Infrastructure</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{school.infrastructure.classrooms} rooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {school.infrastructure.waterSource ? (
                          <Droplet className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Droplet className="w-3 h-3 text-gray-400" />
                        )}
                        {school.infrastructure.electricity ? (
                          <Zap className="w-3 h-3 text-yellow-600" />
                        ) : (
                          <Zap className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Compliance</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-primary">{school.compliance}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="bg-primary h-1 rounded-full"
                        style={{ width: `${school.compliance}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => setSelectedSchool(school)}
                        data-testid={`button-view-school-${school.id}`}
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => navigate(`/album/${school.id}`)}
                        size="sm"
                        className="flex-1"
                        data-testid={`button-album-${school.id}`}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Album
                      </Button>
                    </div>
                    <Button
                      onClick={() => downloadSchoolInventory(school)}
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      data-testid={`button-download-${school.id}`}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Download XLSX
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* School Details Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSchool(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedSchool.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedSchool.district} • {selectedSchool.block}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSchool(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Principal</p>
                    <p className="font-medium">{selectedSchool.principalName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Compliance Score</p>
                    <p className={`font-bold ${selectedSchool.compliance >= 90 ? 'text-green-600' : selectedSchool.compliance >= 80 ? 'text-blue-600' : 'text-red-600'}`}>
                      {selectedSchool.compliance}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Enrollment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Enrollment</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-muted/20 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{selectedSchool.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedSchool.enrollment.boys}</p>
                    <p className="text-xs text-muted-foreground">Boys</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-pink-600">{selectedSchool.enrollment.girls}</p>
                    <p className="text-xs text-muted-foreground">Girls</p>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedSchool.totalTeachers}</p>
                    <p className="text-xs text-muted-foreground">Teachers</p>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Infrastructure</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Classrooms:</span>
                    <span className="font-medium">{selectedSchool.infrastructure.classrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Toilets:</span>
                    <span className="font-medium">{selectedSchool.infrastructure.toilets}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className={`w-4 h-4 ${selectedSchool.infrastructure.waterSource ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={selectedSchool.infrastructure.waterSource ? 'text-green-600' : 'text-red-600'}>
                      {selectedSchool.infrastructure.waterSource ? 'Water Available' : 'No Water'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${selectedSchool.infrastructure.electricity ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={selectedSchool.infrastructure.electricity ? 'text-green-600' : 'text-red-600'}>
                      {selectedSchool.infrastructure.electricity ? 'Electricity Available' : 'No Electricity'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Furniture Inventory */}
              {selectedSchool.furniture && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Furniture Inventory</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium">Item</th>
                          <th className="text-center py-2 px-2 font-medium text-green-600">New</th>
                          <th className="text-center py-2 px-2 font-medium text-gray-600">Old</th>
                          <th className="text-center py-2 px-2 font-medium text-blue-600">In Use</th>
                          <th className="text-center py-2 px-2 font-medium text-red-600">Broken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedSchool.furniture).map(([key, value]) => (
                          <tr key={key} className="border-b border-border/50">
                            <td className="py-2 px-2 capitalize">{key}</td>
                            <td className="py-2 px-2 text-center text-green-600">{value.new}</td>
                            <td className="py-2 px-2 text-center text-gray-600">{value.old}</td>
                            <td className="py-2 px-2 text-center text-blue-600">{value.inUse}</td>
                            <td className="py-2 px-2 text-center text-red-600">{value.broken}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    const schoolId = selectedSchool.id;
                    setSelectedSchool(null);
                    navigate(`/album/${schoolId}`);
                  }}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  View Album
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (selectedSchool) {
                      downloadSchoolInventory(selectedSchool);
                    }
                  }}
                  className="flex-1"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download XLSX
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
