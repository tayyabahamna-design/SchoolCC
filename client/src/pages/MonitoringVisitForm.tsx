import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useMockAEOActivities, MonitoringVisitData } from '@/hooks/useMockAEOActivities';
import { toast } from 'sonner';

const SCHOOLS = [
  'Government Primary School, Zone A',
  'Government Upper Primary School',
  'Government Secondary School',
];

export default function MonitoringVisitForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { addMonitoringVisit } = useMockAEOActivities();

  const [formData, setFormData] = useState<Partial<MonitoringVisitData>>({
    aeoName: user?.name || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
  });

  const [evidence, setEvidence] = useState<{ id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEvidence = () => {
    const newEvidence = {
      id: `ev-${Date.now()}`,
      name: `Evidence ${evidence.length + 1}`,
      type: 'photo' as const,
      url: `evidence-${Date.now()}.jpg`,
    };
    setEvidence([...evidence, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(evidence.filter((e) => e.id !== id));
  };

  const calculatePercentages = () => {
    if (formData.teacherTotal && formData.teacherPresent) {
      const pct = Math.round((formData.teacherPresent / formData.teacherTotal) * 100);
      handleInputChange('teacherPercentage', pct);
    }
    if (formData.studentTotal && formData.studentPresent) {
      const pct = Math.round((formData.studentPresent / formData.studentTotal) * 100);
      handleInputChange('studentPercentage', pct);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      const { id: _, ...dataWithoutId } = formData;
      const visit: MonitoringVisitData = {
        id: `mon-${Date.now()}`,
        ...(dataWithoutId as MonitoringVisitData),
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      addMonitoringVisit(visit);
      toast.success('Monitoring visit submitted successfully!');
      navigate('/aeo-activity/hub');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/aeo-activity/hub')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 ml-4">Monitoring Visit Form</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tehsil</label>
                  <Input
                    placeholder="Enter tehsil name"
                    value={formData.tehsil || ''}
                    onChange={(e) => handleInputChange('tehsil', e.target.value)}
                    data-testid="input-tehsil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Markaz</label>
                  <Input
                    placeholder="Enter markaz name"
                    value={formData.markaz || ''}
                    onChange={(e) => handleInputChange('markaz', e.target.value)}
                    data-testid="input-markaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">School Name</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    value={formData.schoolName || ''}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    data-testid="select-school"
                  >
                    <option value="">Select school...</option>
                    {SCHOOLS.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Visit Date</label>
                  <Input
                    type="date"
                    value={formData.visitDate || ''}
                    onChange={(e) => handleInputChange('visitDate', e.target.value)}
                    data-testid="input-visit-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Arrival Time</label>
                  <Input
                    type="time"
                    value={formData.arrivalTime || ''}
                    onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                    data-testid="input-arrival-time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Departure Time</label>
                  <Input
                    type="time"
                    value={formData.departureTime || ''}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                    data-testid="input-departure-time"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Attendance */}
          <TabsContent value="attendance" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Attendance Data</h2>
              
              <div className="space-y-6">
                {/* Teachers */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Teachers</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Teachers</label>
                      <Input
                        type="number"
                        value={formData.teacherTotal || ''}
                        onChange={(e) => {
                          handleInputChange('teacherTotal', parseInt(e.target.value) || 0);
                          calculatePercentages();
                        }}
                        data-testid="input-teacher-total"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Present</label>
                      <Input
                        type="number"
                        value={formData.teacherPresent || ''}
                        onChange={(e) => {
                          handleInputChange('teacherPresent', parseInt(e.target.value) || 0);
                          calculatePercentages();
                        }}
                        data-testid="input-teacher-present"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Percentage</label>
                      <div className="px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-700">
                        {formData.teacherPercentage || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Head Teacher */}
                <div className="border-b pb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Head Teacher Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    value={formData.headTeacherStatus || ''}
                    onChange={(e) => handleInputChange('headTeacherStatus', e.target.value)}
                    data-testid="select-head-teacher"
                  >
                    <option value="">Select status...</option>
                    <option value="yes">Present</option>
                    <option value="no">Absent</option>
                    <option value="on_duty">On Duty</option>
                    <option value="leave">On Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Students */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Students</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Students</label>
                      <Input
                        type="number"
                        value={formData.studentTotal || ''}
                        onChange={(e) => {
                          handleInputChange('studentTotal', parseInt(e.target.value) || 0);
                          calculatePercentages();
                        }}
                        data-testid="input-student-total"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Present</label>
                      <Input
                        type="number"
                        value={formData.studentPresent || ''}
                        onChange={(e) => {
                          handleInputChange('studentPresent', parseInt(e.target.value) || 0);
                          calculatePercentages();
                        }}
                        data-testid="input-student-present"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Percentage</label>
                      <div className="px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-700">
                        {formData.studentPercentage || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Facilities */}
          <TabsContent value="facilities" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Facilities Assessment</h2>
              
              <div className="space-y-6">
                {/* Furniture */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Furniture Availability</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Students</label>
                      <Input
                        type="number"
                        value={formData.furnitureTotal || ''}
                        onChange={(e) => handleInputChange('furnitureTotal', parseInt(e.target.value) || 0)}
                        data-testid="input-furniture-total"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">With Furniture</label>
                      <Input
                        type="number"
                        value={formData.furnitureWith || ''}
                        onChange={(e) => handleInputChange('furnitureWith', parseInt(e.target.value) || 0)}
                        data-testid="input-furniture-with"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Without Furniture</label>
                      <Input
                        type="number"
                        value={formData.furnitureWithout || ''}
                        onChange={(e) => handleInputChange('furnitureWithout', parseInt(e.target.value) || 0)}
                        data-testid="input-furniture-without"
                      />
                    </div>
                  </div>
                </div>

                {/* Toilets */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Toilet Sufficiency</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Students</label>
                      <Input
                        type="number"
                        value={formData.toiletStudentTotal || ''}
                        onChange={(e) => handleInputChange('toiletStudentTotal', parseInt(e.target.value) || 0)}
                        data-testid="input-toilet-student-total"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Toilets</label>
                      <Input
                        type="number"
                        value={formData.toiletTotal || ''}
                        onChange={(e) => handleInputChange('toiletTotal', parseInt(e.target.value) || 0)}
                        data-testid="input-toilet-total"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Required (SRT)</label>
                      <Input
                        type="number"
                        value={formData.toiletRequired || ''}
                        onChange={(e) => handleInputChange('toiletRequired', parseInt(e.target.value) || 0)}
                        data-testid="input-toilet-required"
                      />
                    </div>
                  </div>
                </div>

                {/* Water & Hygiene */}
                <div className="border-b pb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Drinking Water</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                      value={formData.drinkingWater || ''}
                      onChange={(e) => handleInputChange('drinkingWater', e.target.value)}
                      data-testid="select-drinking-water"
                    >
                      <option value="">Select...</option>
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                      <option value="taste_issue">Taste Issue</option>
                    </select>
                  </div>
                </div>

                {/* Classroom Observation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Classroom Observation</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    value={formData.classroomObservation || ''}
                    onChange={(e) => handleInputChange('classroomObservation', e.target.value)}
                    data-testid="select-classroom-observation"
                  >
                    <option value="">Select...</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="need_improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Learning */}
          <TabsContent value="learning" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Learning & Resources</h2>
              
              <div className="space-y-6">
                {/* LND */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">LND (Literacy & Numeracy Drive)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">English %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.lndEnglishPercent || ''}
                        onChange={(e) => handleInputChange('lndEnglishPercent', parseInt(e.target.value) || 0)}
                        data-testid="input-lnd-english"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Urdu %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.lndUrduPercent || ''}
                        onChange={(e) => handleInputChange('lndUrduPercent', parseInt(e.target.value) || 0)}
                        data-testid="input-lnd-urdu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Maths %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.lndMathsPercent || ''}
                        onChange={(e) => handleInputChange('lndMathsPercent', parseInt(e.target.value) || 0)}
                        data-testid="input-lnd-maths"
                      />
                    </div>
                  </div>
                </div>

                {/* NSB */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">NSB (Non-Salary Budget)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Allocation</label>
                      <Input
                        type="number"
                        value={formData.nsbAllocation || ''}
                        onChange={(e) => handleInputChange('nsbAllocation', parseInt(e.target.value) || 0)}
                        data-testid="input-nsb-allocation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expenditure</label>
                      <Input
                        type="number"
                        value={formData.nsbExpenditure || ''}
                        onChange={(e) => handleInputChange('nsbExpenditure', parseInt(e.target.value) || 0)}
                        data-testid="input-nsb-expenditure"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Balance</label>
                      <Input
                        type="number"
                        value={formData.nsbBalance || ''}
                        onChange={(e) => handleInputChange('nsbBalance', parseInt(e.target.value) || 0)}
                        data-testid="input-nsb-balance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Utilization %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.nsbUtilizationPercent || ''}
                        onChange={(e) => handleInputChange('nsbUtilizationPercent', parseInt(e.target.value) || 0)}
                        data-testid="input-nsb-utilization"
                      />
                    </div>
                  </div>
                </div>

                {/* General Remarks */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">General Remarks</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-24"
                    placeholder="Enter general remarks..."
                    value={formData.generalRemarks || ''}
                    onChange={(e) => handleInputChange('generalRemarks', e.target.value)}
                    data-testid="textarea-general-remarks"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Evidence */}
          <TabsContent value="evidence" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Evidence & Documentation</h2>
              
              <div className="space-y-4">
                <Button
                  onClick={handleAddEvidence}
                  className="w-full"
                  variant="outline"
                  data-testid="button-add-evidence"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Evidence
                </Button>

                {evidence.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {evidence.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        data-testid={`evidence-item-${item.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600">{item.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEvidence(item.id)}
                          data-testid={`button-remove-evidence-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/aeo-activity/hub')}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid="button-submit"
          >
            {loading ? 'Submitting...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Monitoring Visit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
