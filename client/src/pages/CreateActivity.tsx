import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMockActivities } from '@/hooks/useMockActivities';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';

const SCHOOLS = [
  { id: 'school-1', name: 'GOVERNMENT PRIMARY SCHOOL, ZONE A' },
  { id: 'school-2', name: 'GOVERNMENT UPPER PRIMARY SCHOOL' },
  { id: 'school-3', name: 'GOVERNMENT SECONDARY SCHOOL' },
];

export default function CreateActivity() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { schoolId } = useParams();
  const { createActivity } = useMockActivities();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(schoolId || '');
  const [photos, setPhotos] = useState<{ id: string; url: string; caption: string }[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleAddPhoto = () => {
    if (!currentCaption.trim()) return;
    setPhotos([
      ...photos,
      {
        id: `p-${Date.now()}`,
        url: `photo_${Date.now()}.jpg`,
        caption: currentCaption,
      },
    ]);
    setCurrentCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool || !title.trim() || photos.length === 0) return;

    setLoading(true);
    try {
      const school = SCHOOLS.find((s) => s.id === selectedSchool);
      if (school) {
        const newActivity = createActivity(
          selectedSchool,
          school.name,
          title,
          description,
          photos,
          user.id,
          user.name,
          user.role
        );
        analytics.album.activityCreated(newActivity.id, selectedSchool, photos.length);
        toast.success('Activity created successfully!');
        navigate(`/album/${newActivity.schoolId}`);
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/album/${selectedSchool}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Create New Activity</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Select School</h2>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              required
              data-testid="select-school"
            >
              <option value="">Choose a school...</option>
              {SCHOOLS.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Activity Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Activity Title *
                </label>
                <Input
                  placeholder="e.g., Science Fair, Sports Day, Field Trip"
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
                  placeholder="Describe the activity, what students learned, achievements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
                  data-testid="textarea-description"
                />
              </div>
            </div>
          </Card>

          {/* Photos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Photos</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Photo caption (e.g., Group photo, Science experiment)"
                  value={currentCaption}
                  onChange={(e) => setCurrentCaption(e.target.value)}
                  data-testid="input-photo-caption"
                />
                <Button onClick={handleAddPhoto} type="button" variant="outline" data-testid="button-add-photo">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>

              {photos.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">Photos Added: {photos.length}</p>
                  {photos.map((photo) => (
                    <div key={photo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">{photo.url}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePhoto(photo.id)}
                        data-testid={`button-remove-photo-${photo.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !selectedSchool || !title.trim() || photos.length === 0} data-testid="button-create-activity">
              {loading ? 'Creating...' : 'Create Activity'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/album/${selectedSchool}`)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
