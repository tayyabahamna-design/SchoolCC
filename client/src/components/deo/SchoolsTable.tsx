import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle, Droplets, Toilet, Activity as ActivityIcon } from 'lucide-react';

interface School {
  id: string;
  name: string;
  emisNumber: string;
  clusterId: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  totalTeachers: number;
  presentTeachers: number;
  absentTeachers: number;
  totalToilets: number;
  workingToilets: number;
  brokenToilets: number;
  isDrinkingWaterAvailable: boolean;
}

interface ActiveVisit {
  schoolId: string;
  aeoName: string;
}

interface SchoolsTableProps {
  districtId?: string;
}

export function SchoolsTable({ districtId }: SchoolsTableProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [activeVisits, setActiveVisits] = useState<ActiveVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchools = useCallback(async (): Promise<School[]> => {
    try {
      const params = districtId ? `?districtId=${districtId}` : '';
      const response = await fetch(`/api/admin/schools${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchools(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
    }
    return [];
  }, [districtId]);

  const loadActiveVisits = useCallback(
    async (schoolList?: School[]) => {
    try {
      const list = schoolList ?? schools;
      if (!list.length) {
        setActiveVisits([]);
        return;
      }

      const visits = await Promise.all(
        list.map(async (school) => {
          const response = await fetch(`/api/visits/active/${school.id}`);
          if (response.ok) {
            const visit = await response.json();
            return visit ? { schoolId: school.id, aeoName: visit.aeoName } : null;
          }
          return null;
        })
      );
      setActiveVisits(visits.filter((v): v is ActiveVisit => v !== null));
    } catch (error) {
      console.error('Failed to load active visits:', error);
    }
  },
  [schools]
  );

  // Initial load: fetch schools, then fetch active visits once
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);
      const loadedSchools = await loadSchools();
      if (!isMounted) return;

      await loadActiveVisits(loadedSchools);

      if (isMounted) {
        setLoading(false);
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [districtId, loadSchools, loadActiveVisits]);

  // Polling: always use the latest schools list
  useEffect(() => {
    if (!schools.length) return;

    const intervalId = window.setInterval(() => {
      void loadActiveVisits();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [schools.length, loadActiveVisits]);

  const hasRedFlag = (school: School) => {
    const attendanceRate = school.totalStudents > 0
      ? (school.presentStudents / school.totalStudents) * 100
      : 100;

    return (
      attendanceRate < 80 ||
      school.brokenToilets > 0 ||
      !school.isDrinkingWaterAvailable
    );
  };

  const getAttendancePercentage = (present: number, total: number) => {
    if (total === 0) return 'N/A';
    return ((present / total) * 100).toFixed(1) + '%';
  };

  const exportToExcel = async () => {
    try {
      const params = districtId ? `?districtId=${districtId}` : '';
      const response = await fetch(`/api/export/schools/excel${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schools-report.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const isVisitActive = (schoolId: string) => {
    return activeVisits.some(v => v.schoolId === schoolId);
  };

  const getVisitInfo = (schoolId: string) => {
    return activeVisits.find(v => v.schoolId === schoolId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading schools...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schools Overview</h2>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-card shadow-sm rounded-lg">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left p-3 font-semibold">School</th>
              <th className="text-left p-3 font-semibold">Students (T/P/A)</th>
              <th className="text-left p-3 font-semibold">Attendance %</th>
              <th className="text-left p-3 font-semibold">Teachers (T/P/A)</th>
              <th className="text-left p-3 font-semibold">Toilets (W/B)</th>
              <th className="text-left p-3 font-semibold">Water</th>
              <th className="text-left p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => {
              const redFlag = hasRedFlag(school);
              const studentAttendance = school.totalStudents > 0
                ? (school.presentStudents / school.totalStudents) * 100
                : 100;
              const visitInfo = getVisitInfo(school.id);

              return (
                <tr
                  key={school.id}
                  className={`border-b hover:bg-muted/50 transition-colors ${
                    redFlag ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="font-medium uppercase">{school.name}</div>
                    <div className="text-sm text-muted-foreground">{school.emisNumber}</div>
                  </td>

                  <td className="p-3">
                    <div className="text-sm">
                      {school.totalStudents} / {school.presentStudents} /{' '}
                      <span className={studentAttendance < 80 ? 'text-red-600 font-semibold' : ''}>
                        {school.absentStudents}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <Badge
                      variant={studentAttendance >= 80 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {getAttendancePercentage(school.presentStudents, school.totalStudents)}
                    </Badge>
                  </td>

                  <td className="p-3">
                    <div className="text-sm">
                      {school.totalTeachers} / {school.presentTeachers} / {school.absentTeachers}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Toilet className="w-4 h-4 text-muted-foreground" />
                      <span>{school.workingToilets}</span>
                      {school.brokenToilets > 0 && (
                        <span className="text-red-600 font-semibold">
                          / {school.brokenToilets} broken
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Droplets
                        className={`w-4 h-4 ${
                          school.isDrinkingWaterAvailable ? 'text-blue-500' : 'text-red-500'
                        }`}
                      />
                      <span className="text-sm">
                        {school.isDrinkingWaterAvailable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      {visitInfo && (
                        <Badge variant="default" className="bg-green-500 animate-pulse text-xs">
                          <ActivityIcon className="w-3 h-3 mr-1" />
                          AEO ON-SITE: {visitInfo.aeoName}
                        </Badge>
                      )}
                      {redFlag && !visitInfo && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Needs Attention
                        </Badge>
                      )}
                      {!redFlag && !visitInfo && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          All Good
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {schools.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No schools found
        </div>
      )}
    </div>
  );
}
