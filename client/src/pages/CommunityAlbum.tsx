import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMockActivities, Activity } from '@/hooks/useMockActivities';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, MessageCircle, Download, X, School, User, Images, ChevronRight } from 'lucide-react';
import { analytics } from '@/lib/analytics';

export default function CommunityAlbum() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { activities, addComment, addReaction, removeReaction } = useMockActivities();
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string; activityTitle: string } | null>(null);
  const [selectedMiniAlbum, setSelectedMiniAlbum] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'albums'>('feed');

  if (!user) {
    return null;
  }

  const allActivities = [...activities].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const miniAlbums = useMemo(() => {
    const albumMap: Record<string, { title: string; activities: Activity[]; totalPhotos: number; schools: Set<string> }> = {};
    
    allActivities.forEach(activity => {
      const keywords = activity.title.toLowerCase().split(' ').filter(w => w.length > 3);
      const mainKeyword = keywords[0] || activity.title.toLowerCase().substring(0, 20);
      
      const matchingAlbum = Object.keys(albumMap).find(key => {
        const keyWords = key.toLowerCase().split(' ');
        return keywords.some(kw => keyWords.some(akw => akw.includes(kw) || kw.includes(akw)));
      });
      
      const albumKey = matchingAlbum || activity.title;
      
      if (!albumMap[albumKey]) {
        albumMap[albumKey] = {
          title: albumKey,
          activities: [],
          totalPhotos: 0,
          schools: new Set()
        };
      }
      
      albumMap[albumKey].activities.push(activity);
      albumMap[albumKey].totalPhotos += activity.photos.length;
      albumMap[albumKey].schools.add(activity.schoolName);
    });
    
    return Object.values(albumMap).sort((a, b) => b.totalPhotos - a.totalPhotos);
  }, [allActivities]);

  const handleAddComment = (activityId: string) => {
    if (!commentText.trim()) return;
    addComment(activityId, commentText, user.id, user.name, user.role);
    analytics.album.commentAdded(activityId);
    setCommentText('');
  };

  const handleReaction = (activityId: string, type: 'like' | 'love' | 'clap' | 'celebrate') => {
    const key = `${activityId}-${user.id}`;
    if (userReactions[key] === type) {
      removeReaction(activityId, user.id);
      analytics.album.reactionRemoved(activityId, type);
      setUserReactions((prev) => {
        const newReactions = { ...prev };
        delete newReactions[key];
        return newReactions;
      });
    } else {
      addReaction(activityId, type, user.id, user.name);
      analytics.album.reactionAdded(activityId, type);
      setUserReactions((prev) => ({ ...prev, [key]: type }));
    }
  };

  const downloadImage = (imageUrl: string, caption: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(caption || 'TaleemHub Photo', 400, 300);
      
      ctx.font = '16px Arial';
      ctx.fillText('TaleemHub Community Album', 400, 340);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${caption?.replace(/[^a-z0-9]/gi, '_') || 'photo'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'DEO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DDEO': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'AEO': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
      case 'HEAD_TEACHER': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'TEACHER': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const selectedAlbumData = selectedMiniAlbum ? miniAlbums.find(a => a.title === selectedMiniAlbum) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-foreground">Community Album</h1>
              <p className="text-sm text-muted-foreground">See activities from all schools</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'feed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('feed')}
                data-testid="button-view-feed"
              >
                Feed
              </Button>
              <Button
                variant={viewMode === 'albums' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('albums')}
                data-testid="button-view-albums"
              >
                <Images className="w-4 h-4 mr-1" />
                Mini Albums
              </Button>
            </div>
            {(user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && user.schoolId && (
              <Button
                onClick={() => navigate(`/create-activity/${user.schoolId}`)}
                data-testid="button-create-activity"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {viewMode === 'albums' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Mini Albums</h2>
            <p className="text-muted-foreground text-sm">Activities from different schools grouped by theme</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {miniAlbums.map((album) => (
                <Card 
                  key={album.title} 
                  className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setSelectedMiniAlbum(album.title)}
                  data-testid={`mini-album-${album.title.substring(0, 20)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
                      <Images className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">{album.title}</h3>
                      <p className="text-sm text-muted-foreground">{album.totalPhotos} photos from {album.schools.size} school{album.schools.size > 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground mt-1">{album.activities.length} post{album.activities.length > 1 ? 's' : ''}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : allActivities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No activities yet in the community</p>
            {(user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') && user.schoolId && (
              <Button onClick={() => navigate(`/create-activity/${user.schoolId}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {allActivities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{activity.createdByName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(activity.createdByRole)}`}>
                          {activity.createdByRole.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {(activity.createdByRole === 'TEACHER' || activity.createdByRole === 'HEAD_TEACHER') && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <School className="w-3 h-3" />
                          <span>{activity.schoolName}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.createdAt.toLocaleDateString()} at {activity.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-4">{activity.title}</h2>
                  <p className="text-foreground mt-2">{activity.description}</p>
                </div>

                {activity.photos.length > 0 && (
                  <div className="p-6 border-b border-border">
                    <div className="grid grid-cols-2 gap-4">
                      {activity.photos.map((photo) => (
                        <div 
                          key={photo.id} 
                          className="bg-muted/20 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-all duration-300 group"
                          onClick={() => setSelectedImage({ url: photo.url, caption: photo.caption, activityTitle: activity.title })}
                        >
                          <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-md flex items-center justify-center mb-2 relative overflow-hidden">
                            <span className="text-4xl">📸</span>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Click to view</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground">{photo.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                <div className="p-6">
                  <div className="space-y-4">
                    {activity.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-foreground">{comment.authorName}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(comment.authorRole)}`}>
                              {comment.authorRole.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{comment.timestamp.toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-foreground">{comment.text}</p>
                      </div>
                    ))}

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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedImage?.caption}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
              <span className="text-6xl">📸</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">From: {selectedImage?.activityTitle}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => selectedImage && downloadImage(selectedImage.url, selectedImage.caption)}
                data-testid="button-download-png"
              >
                <Download className="w-4 h-4 mr-2" />
                Save as PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMiniAlbum} onOpenChange={() => setSelectedMiniAlbum(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="w-5 h-5" />
              {selectedMiniAlbum}
            </DialogTitle>
          </DialogHeader>
          {selectedAlbumData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedAlbumData.totalPhotos} photos from {selectedAlbumData.schools.size} school{selectedAlbumData.schools.size > 1 ? 's' : ''}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    selectedAlbumData.activities.forEach((activity, actIdx) => {
                      activity.photos.forEach((photo, photoIdx) => {
                        setTimeout(() => {
                          downloadImage(photo.url, `${selectedAlbumData.title}_${actIdx + 1}_${photo.caption}`);
                        }, (actIdx * activity.photos.length + photoIdx) * 500);
                      });
                    });
                  }}
                  data-testid="button-download-all-photos"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save All as PNG
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {selectedAlbumData.activities.flatMap(activity => 
                  activity.photos.map(photo => (
                    <div 
                      key={photo.id}
                      className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 relative group"
                      onClick={() => {
                        setSelectedMiniAlbum(null);
                        setSelectedImage({ url: photo.url, caption: photo.caption, activityTitle: activity.title });
                      }}
                    >
                      <span className="text-3xl">📸</span>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                        <Download className="w-4 h-4 text-white mb-1" />
                        <span className="text-white text-xs text-center line-clamp-2">{photo.caption}</span>
                        <span className="text-white/70 text-xs mt-1">{activity.schoolName.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-2">Contributing Schools</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedAlbumData.schools).map(school => (
                    <span key={school} className="text-xs bg-muted px-2 py-1 rounded-full">{school}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
