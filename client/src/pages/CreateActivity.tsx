import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMockActivities } from '@/hooks/useMockActivities';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, School } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';
import { realSchools } from '@/data/realData';

const SCHOOL_NAMES: Record<string, string> = realSchools.reduce((acc, school) => {
  acc[school.code] = school.name;
  return acc;
}, {} as Record<string, string>);

export default function CreateActivity() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { createActivity } = useMockActivities();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string; caption: string }[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const userSchoolId = user.schoolId || '';
  const userSchoolName = SCHOOL_NAMES[userSchoolId] || user.schoolId || 'Your School';

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
    if (!userSchoolId || !title.trim() || photos.length === 0) return;

    setLoading(true);
    try {
      const newActivity = createActivity(
        userSchoolId,
        userSchoolName,
        title,
        description,
        photos,
        user.id,
        user.name,
        user.role
      );
      analytics.album.activityCreated(newActivity.id, userSchoolId, photos.length);
      toast.success('Activity posted to Community Album!');
      navigate('/community-album');
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/community-album')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Create New Post</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posting from</p>
                <p className="font-semibold text-foreground">{userSchoolName}</p>
              </div>
            </div>
          </Card>

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
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Use the same title as other schools (e.g., "Science Fair") to group posts into a mini album
                </p>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-md flex items-center justify-center">
                          <span className="text-lg">📸</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{photo.caption}</p>
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

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || photos.length === 0} 
              data-testid="button-create-activity"
            >
              {loading ? 'Posting...' : 'Post to Community'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/community-album')}
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
