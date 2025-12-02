import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, Users, BookOpen, Droplet, Zap, BarChart3, ImageIcon } from 'lucide-react';

export default function SchoolData() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getSchoolData, getSchoolById } = useMockTeacherData();

  if (!user) return null;

  const allSchools = getSchoolData();
  const userSchool = user.schoolId ? getSchoolById(user.schoolId) : null;
  
  // Teachers and head teachers only see their own school
  const visibleSchools = (user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') 
    ? (userSchool ? [userSchool] : []) 
    : allSchools;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-foreground">School Inventory & Data</h1>
              <p className="text-sm text-muted-foreground">Infrastructure, enrollment, and compliance records</p>
            </div>
          </div>
          <Button variant="outline" data-testid="button-export-schools">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
            {user.role === 'DEO' || user.role === 'DDEO' ? 'All Schools in District' : user.role === 'AEO' ? 'Schools in Your Area' : 'Your School'}
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

                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-school-${school.id}`}>
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
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
