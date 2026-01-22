import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ActivityPhoto {
  id: string;
  albumId: string;
  photoUrl: string;
  photoFileName: string;
  caption: string | null;
  uploadedAt: string;
}

export interface ActivityComment {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
}

export interface ActivityReaction {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  reactionType: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  schoolId: string;
  schoolName: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  isGlobalBroadcast: boolean;
  createdAt: string;
  photos: ActivityPhoto[];
  comments: ActivityComment[];
  reactions: ActivityReaction[];
}

export function useActivities() {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error, refetch } = useQuery<Activity[]>({
    queryKey: ['community-albums'],
    queryFn: async () => {
      const response = await fetch('/api/community-albums');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: {
      schoolId: string;
      schoolName: string;
      title: string;
      description: string;
      photos: { url: string; fileName: string; caption: string }[];
      createdBy: string;
      createdByName: string;
      createdByRole: string;
    }) => {
      const albumResponse = await apiRequest('POST', '/api/albums', {
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        title: data.title,
        description: data.description,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdByRole: data.createdByRole,
        isGlobalBroadcast: false,
      });
      
      const album = await albumResponse.json();

      for (const photo of data.photos) {
        await apiRequest('POST', `/api/albums/${album.id}/photos`, {
          photoUrl: photo.url,
          photoFileName: photo.fileName,
          caption: photo.caption,
        });
      }

      return album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-albums'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: {
      albumId: string;
      userId: string;
      userName: string;
      userRole: string;
      comment: string;
    }) => {
      const response = await apiRequest('POST', `/api/albums/${data.albumId}/comments`, {
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        comment: data.comment,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-albums'] });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async (data: {
      albumId: string;
      userId: string;
      userName: string;
      reactionType: string;
    }) => {
      const response = await apiRequest('POST', `/api/albums/${data.albumId}/reactions`, {
        userId: data.userId,
        userName: data.userName,
        reactionType: data.reactionType,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-albums'] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async (data: {
      albumId: string;
      userId: string;
      reactionType: string;
    }) => {
      await apiRequest('DELETE', `/api/albums/${data.albumId}/reactions?userId=${data.userId}&reactionType=${data.reactionType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-albums'] });
    },
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
    createActivity: createActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isPending,
    addComment: addCommentMutation.mutateAsync,
    addReaction: addReactionMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
  };
}
