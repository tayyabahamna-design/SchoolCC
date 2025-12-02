import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockCollaborativeForms } from '@/hooks/useMockCollaborativeForms';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const FIELD_TYPES = ['text', 'number', 'email', 'date'];

export default function CreateCollaborativeForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { createForm } = useMockCollaborativeForms();
  const { getSchoolById } = useMockTeacherData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Array<{ id: string; name: string; type: string; required: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const userSchool = user.schoolId ? getSchoolById(user.schoolId) : null;
  if (!userSchool || user.role !== 'HEAD_TEACHER') {
    return null;
  }

  const addField = () => {
    setFields([
      ...fields,
      { id: `f-${Date.now()}`, name: '', type: 'text', required: false },
    ]);
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || fields.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      createForm(userSchool.id, userSchool.name, title, description, fields as any, user.id, user.name);
      navigate('/collaborative-forms');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/collaborative-forms')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Create Collaborative Form</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Form Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Form Title *
                </label>
                <Input
                  placeholder="e.g., Teacher Information Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  data-testid="input-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe what information teachers should provide"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20"
                  data-testid="textarea-description"
                />
              </div>
            </div>
          </Card>

          {/* Fields */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Form Fields</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                data-testid="button-add-field"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No fields yet. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 p-3 border border-border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        className="text-sm"
                        data-testid={`input-field-name-${idx}`}
                      />
                      <div className="flex gap-2">
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value })}
                          className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                          data-testid={`select-field-type-${idx}`}
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            data-testid={`checkbox-required-${idx}`}
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      data-testid={`button-remove-field-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/collaborative-forms')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || fields.length === 0 || loading}
              data-testid="button-create"
            >
              {loading ? 'Creating...' : 'Create Form'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
