import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Users, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Teacher {
  id: string;
  name: string;
  phoneNumber: string;
  cnic?: string;
  fatherName?: string;
  spouseName?: string;
  email?: string;
  residentialAddress?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  qualification?: string;
  schoolName?: string;
  role: string;
}

interface TeacherExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AVAILABLE_FIELDS = [
  { key: 'name', label: 'Name / نام', labelUr: 'نام' },
  { key: 'phoneNumber', label: 'Phone Number / فون نمبر', labelUr: 'فون نمبر' },
  { key: 'cnic', label: 'CNIC / شناختی کارڈ نمبر', labelUr: 'شناختی کارڈ نمبر' },
  { key: 'fatherName', label: 'Father Name / والد کا نام', labelUr: 'والد کا نام' },
  { key: 'spouseName', label: 'Spouse Name / شریک حیات کا نام', labelUr: 'شریک حیات کا نام' },
  { key: 'email', label: 'Email / ای میل', labelUr: 'ای میل' },
  { key: 'residentialAddress', label: 'Address / پتہ', labelUr: 'پتہ' },
  { key: 'dateOfBirth', label: 'Date of Birth / تاریخ پیدائش', labelUr: 'تاریخ پیدائش' },
  { key: 'dateOfJoining', label: 'Date of Joining / شمولیت کی تاریخ', labelUr: 'شمولیت کی تاریخ' },
  { key: 'qualification', label: 'Qualification / تعلیم', labelUr: 'تعلیم' },
  { key: 'schoolName', label: 'School Name / اسکول کا نام', labelUr: 'اسکول کا نام' },
];

export function TeacherExportDialog({ isOpen, onClose, userId }: TeacherExportDialogProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'phoneNumber']);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchTeachers();
    }
  }, [isOpen, userId]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?role=TEACHER&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
  };

  const clearAllFields = () => {
    setSelectedFields(['name']);
  };

  const exportToExcel = () => {
    if (selectedFields.length === 0) return;
    
    setExporting(true);
    try {
      const exportData = teachers.map((teacher, index) => {
        const row: Record<string, any> = { 'S.No': index + 1 };
        selectedFields.forEach(fieldKey => {
          const field = AVAILABLE_FIELDS.find(f => f.key === fieldKey);
          if (field) {
            row[field.label] = teacher[fieldKey as keyof Teacher] || '-';
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Teachers');

      const colWidths = [{ wch: 5 }];
      selectedFields.forEach(fieldKey => {
        const field = AVAILABLE_FIELDS.find(f => f.key === fieldKey);
        colWidths.push({ wch: Math.max(20, (field?.label.length || 15) + 5) });
      });
      ws['!cols'] = colWidths;

      const fileName = `Teachers_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Teachers List / اساتذہ کی فہرست
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">Loading teachers...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Total Teachers: {teachers.length}
                </h3>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {teachers.map((teacher, index) => (
                  <div 
                    key={teacher.id} 
                    className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-2 text-sm"
                  >
                    <span className="font-medium">{index + 1}. {teacher.name}</span>
                    <span className="text-muted-foreground">{teacher.phoneNumber}</span>
                  </div>
                ))}
                {teachers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No teachers found</p>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Select Fields to Export / فیلڈز منتخب کریں
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFields}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_FIELDS.map(field => (
                  <label 
                    key={field.key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                      data-testid={`checkbox-field-${field.key}`}
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel / منسوخ
              </Button>
              <Button 
                onClick={exportToExcel}
                disabled={selectedFields.length === 0 || teachers.length === 0 || exporting}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-export-teachers-excel"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Excel ({selectedFields.length} fields)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
