import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useActivities } from '@/hooks/useActivities';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, School, Camera } from 'lucide-react';
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
  const { createActivity, isCreating } = useActivities();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string; fileName: string; caption: string; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const userSchoolId = user.schoolId || '';
  const userSchoolName = SCHOOL_NAMES[userSchoolId] || user.schoolName || user.schoolId || 'Your School';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxPhotos = 10;
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.error(`You can only upload up to ${maxPhotos} photos. ${files.length - remainingSlots} file(s) were not added.`);
    }

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setPhotos((prev) => [
          ...prev,
          {
            id: `p-${Date.now()}-${Math.random()}`,
            url: preview,
            fileName: file.name,
            caption: title || file.name,
            preview,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!userSchoolId || !title.trim() || photos.length === 0) return;

    setIsSubmitting(true);
    try {
      const photosForActivity = photos.map((p) => ({
        url: p.preview,
        fileName: p.fileName,
        caption: title,
      }));

      const newActivity = await createActivity({
        schoolId: userSchoolId,
        schoolName: userSchoolName,
        title: title,
        description: title,
        photos: photosForActivity,
        createdBy: user.id,
        createdByName: user.name,
        createdByRole: user.role,
      });
      analytics.album.activityCreated(newActivity.id, userSchoolId, photos.length);
      toast.success('Activity posted to Community Album!');
      navigate('/community-album');
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Caption</h2>
            <div>
              <Input
                placeholder="e.g., Science Fair, Sports Day, Field Trip..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="input-title"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Use the same caption as other schools (e.g., "Science Fair") to group posts into a mini album
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Photos</h2>
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file"
              />
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed border-2 hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-add-photo"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Tap to add photos (max 10)</span>
                </div>
              </Button>

              {photos.length > 0 && (
                <div className="space-y-3 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(photo.id)}
                          data-testid={`button-remove-photo-${photo.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isCreating || isSubmitting || !title.trim() || photos.length === 0} 
              data-testid="button-create-activity"
            >
              {isCreating || isSubmitting ? 'Creating...' : 'Create Activity'}
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
