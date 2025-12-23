import { useState } from 'react';
import { useParams } from 'wouter';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockActivities, Activity } from '@/hooks/useMockActivities';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Heart, MessageCircle, Share2, Download, FileImage, Images, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const SCHOOL_NAMES: Record<string, string> = {
  'school-1': 'Government Primary School, Zone A',
  'school-2': 'Government Upper Primary School',
  'school-3': 'Government Secondary School',
};

const DEFAULT_SCHOOL_ID = 'school-1';

export default function SchoolAlbum() {
  const { schoolId } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getActivitiesForSchool, addComment, addReaction, removeReaction } = useMockActivities();
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

  if (!schoolId || !user) {
    return null;
  }

  // Head teachers and teachers can only view their own school's album
  if ((user.role === 'HEAD_TEACHER' || user.role === 'TEACHER') && user.schoolId !== schoolId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">You can only view your own school's album.</p>
          <Button onClick={() => navigate('/school-data')}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const effectiveSchoolId = SCHOOL_NAMES[schoolId] ? schoolId : DEFAULT_SCHOOL_ID;
  const activities = getActivitiesForSchool(effectiveSchoolId);
  const schoolName = SCHOOL_NAMES[schoolId] || 'School Album';

  const handleAddComment = (activityId: string) => {
    if (!commentText.trim()) return;
    addComment(activityId, commentText, user.id, user.name, user.role);
    setCommentText('');
  };

  const handleReaction = (activityId: string, type: 'like' | 'love' | 'clap' | 'celebrate') => {
    const key = `${activityId}-${user.id}`;
    if (userReactions[key] === type) {
      removeReaction(activityId, user.id);
      setUserReactions((prev) => {
        const newReactions = { ...prev };
        delete newReactions[key];
        return newReactions;
      });
    } else {
      addReaction(activityId, type, user.id, user.name);
      setUserReactions((prev) => ({ ...prev, [key]: type }));
    }
  };

  // Download single activity (mini album)
  const downloadMiniAlbum = async (activity: Activity) => {
    const zip = new JSZip();
    const folder = zip.folder(activity.title.substring(0, 30));

    // Add activity metadata
    const metadata = `Title: ${activity.title}\nDate: ${activity.createdAt.toLocaleDateString()}\nCreated By: ${activity.createdByName}\nDescription: ${activity.description}\n\nPhotos: ${activity.photos.length}`;
    folder?.file('README.txt', metadata);

    // In real scenario, photos would be downloaded from URLs
    // For now, creating placeholder files
    activity.photos.forEach((photo, index) => {
      const photoInfo = `Photo ${index + 1}\nCaption: ${photo.caption}\nURL: ${photo.url}`;
      folder?.file(`photo_${index + 1}_${photo.caption.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.txt`, photoInfo);
    });

    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${schoolName.replace(/[^a-z0-9]/gi, '_')}_${activity.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.zip`);
  };

  // Download full school album
  const downloadFullAlbum = async () => {
    const zip = new JSZip();

    // Add school info
    const schoolInfo = `School: ${schoolName}\nTotal Activities: ${activities.length}\nDownloaded: ${new Date().toLocaleString()}`;
    zip.file('School_Album_Info.txt', schoolInfo);

    // Add each activity
    activities.forEach((activity, idx) => {
      const activityFolder = zip.folder(`${idx + 1}_${activity.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}`);

      const metadata = `Title: ${activity.title}\nDate: ${activity.createdAt.toLocaleDateString()}\nCreated By: ${activity.createdByName}\nDescription: ${activity.description}\n\nComments: ${activity.comments.length}\nReactions: ${activity.reactions.length}`;
      activityFolder?.file('Activity_Info.txt', metadata);

      activity.photos.forEach((photo, photoIdx) => {
        const photoInfo = `Photo ${photoIdx + 1}\nCaption: ${photo.caption}\nURL: ${photo.url}`;
        activityFolder?.file(`${photoIdx + 1}_${photo.caption.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.txt`, photoInfo);
      });
    });

    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${schoolName.replace(/[^a-z0-9]/gi, '_')}_Full_Album_${new Date().toISOString().split('T')[0]}.zip`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/school-data')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-foreground">{schoolName}</h1>
              <p className="text-sm text-muted-foreground">School Album & Activities</p>
            </div>
          </div>
          <div className="flex gap-2">
            {activities.length > 0 && (
              <Button
                variant="outline"
                onClick={downloadFullAlbum}
                data-testid="button-download-full-album"
              >
                <Archive className="w-4 h-4 mr-2" />
                Download Album
              </Button>
            )}
            {(user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && (
              <Button
                onClick={() => navigate(`/create-activity/${schoolId}`)}
                data-testid="button-create-activity"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No activities yet in this school's album</p>
            {(user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && (
              <Button onClick={() => navigate(`/create-activity/${schoolId}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Activity
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden">
                {/* Activity Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{activity.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        by {activity.createdByName} • {activity.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMiniAlbum(activity)}
                      data-testid={`button-download-activity-${activity.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <p className="text-foreground mt-3">{activity.description}</p>
                </div>

                {/* Photos Grid */}
                {activity.photos.length > 0 && (
                  <div className="p-6 border-b border-border">
                    <div className="grid grid-cols-2 gap-4">
                      {activity.photos.map((photo) => (
                        <div key={photo.id} className="bg-muted/20 rounded-lg p-4 text-center">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-md flex items-center justify-center mb-2">
                            <span className="text-4xl">📸</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{photo.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reactions */}
                <div className="px-6 py-3 border-b border-border flex gap-4">
                  {(['like', 'love', 'clap', 'celebrate'] as const).map((type) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(activity.id, type)}
                      className={userReactions[`${activity.id}-${user.id}`] === type ? 'bg-primary/10' : ''}
                      data-testid={`button-reaction-${type}-${activity.id}`}
                    >
                      {type === 'like' && '👍'}
                      {type === 'love' && '❤️'}
                      {type === 'clap' && '👏'}
                      {type === 'celebrate' && '🎉'}
                      {activity.reactions.filter((r) => r.type === type).length > 0 && (
                        <span className="ml-2 text-xs">{activity.reactions.filter((r) => r.type === type).length}</span>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Comments Section */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Existing Comments */}
                    {activity.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm text-foreground">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">{comment.timestamp.toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-foreground">{comment.text}</p>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={expandedActivity === activity.id ? commentText : ''}
                        onChange={(e) => {
                          setExpandedActivity(activity.id);
                          setCommentText(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(activity.id);
                          }
                        }}
                        data-testid={`input-comment-${activity.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(activity.id)}
                        disabled={!commentText.trim()}
                        data-testid={`button-add-comment-${activity.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
