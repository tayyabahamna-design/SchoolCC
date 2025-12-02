import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockCollaborativeForms } from '@/hooks/useMockCollaborativeForms';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, FileText, Users } from 'lucide-react';

export default function CollaborativeForms() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getFormsBySchool } = useMockCollaborativeForms();
  const { getSchoolById } = useMockTeacherData();

  if (!user) return null;

  const userSchool = user.schoolId ? getSchoolById(user.schoolId) : null;
  const forms = userSchool ? getFormsBySchool(userSchool.id) : [];

  const canCreate = user.role === 'HEAD_TEACHER';

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
              <h1 className="text-2xl font-bold text-foreground">Collaborative Forms</h1>
              <p className="text-sm text-muted-foreground">School-wide data collection and review</p>
            </div>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/create-collaborative-form')} data-testid="button-create-form">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {forms.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No forms available</p>
            {canCreate && (
              <Button onClick={() => navigate('/create-collaborative-form')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Form
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => {
              const submittedCount = form.responses.filter((r) => r.status === 'submitted').length;
              const draftCount = form.responses.filter((r) => r.status === 'draft').length;

              return (
                <Card
                  key={form.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/collaborative-form/${form.id}`)}
                  data-testid={`card-form-${form.id}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{form.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Fields:</span>
                        <span className="font-semibold text-foreground">{form.fields.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          form.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {form.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-muted-foreground">Responses:</span>
                        </div>
                        <div className="space-y-1">
                          {submittedCount > 0 && (
                            <div className="text-sm">
                              <span className="font-semibold text-green-600">{submittedCount}</span>
                              <span className="text-muted-foreground"> submitted</span>
                            </div>
                          )}
                          {draftCount > 0 && (
                            <div className="text-sm">
                              <span className="font-semibold text-blue-600">{draftCount}</span>
                              <span className="text-muted-foreground"> drafts</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-form-${form.id}`}>
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
