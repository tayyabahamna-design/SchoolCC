import { useState } from 'react';
import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockCollaborativeForms } from '@/hooks/useMockCollaborativeForms';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Send } from 'lucide-react';

export default function ViewCollaborativeForm() {
  const { formId } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getForm, submitResponse, saveAsDraft } = useMockCollaborativeForms();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const form = getForm(formId || '');

  if (!form || !user) return null;

  const isHeadTeacher = user.role === 'HEAD_TEACHER';
  const userResponse = form.responses.find((r) => r.teacherId === user.id);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveDraft = () => {
    setLoading(true);
    setTimeout(() => {
      saveAsDraft(form.id, user.id, user.name, formData);
      setLoading(false);
      setEditing(false);
    }, 500);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      submitResponse(form.id, user.id, user.name, formData);
      setLoading(false);
      setEditing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/collaborative-forms')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form.title}</h1>
            <p className="text-sm text-muted-foreground">{form.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isHeadTeacher ? (
          /* HEAD_TEACHER VIEW - Spreadsheet of all responses */
          <Card className="p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Collected Responses</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-3 font-semibold text-foreground">Teacher</th>
                  {form.fields.map((field) => (
                    <th key={field.id} className="text-left p-3 font-semibold text-foreground min-w-24">
                      {field.name}
                    </th>
                  ))}
                  <th className="text-left p-3 font-semibold text-foreground">Status</th>
                  <th className="text-left p-3 font-semibold text-foreground">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {form.responses.length === 0 ? (
                  <tr>
                    <td colSpan={form.fields.length + 3} className="text-center p-4 text-muted-foreground">
                      No responses yet
                    </td>
                  </tr>
                ) : (
                  form.responses.map((response) => (
                    <tr key={response.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{response.teacherName}</td>
                      {form.fields.map((field) => (
                        <td key={field.id} className="p-3 text-sm text-foreground">
                          {response.data[field.id] || '—'}
                        </td>
                      ))}
                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            response.status === 'submitted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {response.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {response.submittedAt ? response.submittedAt.toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        ) : (
          /* TEACHER VIEW - Their own form */
          <div className="space-y-6">
            {!editing && userResponse?.status === 'submitted' && (
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm text-green-700">✓ Form submitted on {userResponse.submittedAt?.toLocaleDateString()}</p>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Your Information</h2>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field.name}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <Input
                      type={field.type}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={formData[field.id] || userResponse?.data[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      disabled={!editing}
                      data-testid={`input-field-${field.id}`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            {!editing ? (
              <div className="flex gap-2">
                <Button onClick={() => setEditing(true)} variant="outline" data-testid="button-edit">
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={loading}
                  data-testid="button-save-draft"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={handleSubmit} disabled={loading} data-testid="button-submit">
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
                <Button
                  onClick={() => setEditing(false)}
                  variant="outline"
                  disabled={loading}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
