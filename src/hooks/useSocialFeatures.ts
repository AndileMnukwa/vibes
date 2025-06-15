
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
  criteria_met: Record<string, any>;
}

export const useSocialFeatures = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Follow/Unfollow mutations
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: userId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      toast({
        title: "Success",
        description: "You are now following this user",
      });
    },
    onError: (error) => {
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    },
  });

  // Get user's followers and following
  const { data: userFollows = [] } = useQuery({
    queryKey: ['user-follows', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
      
      if (error) throw error;
      return data as UserFollow[];
    },
    enabled: !!user,
  });

  // Get user badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });

  // Check if following a user
  const isFollowing = useCallback((userId: string) => {
    return userFollows.some(follow => 
      follow.follower_id === user?.id && follow.following_id === userId
    );
  }, [userFollows, user?.id]);

  // Get followers/following counts
  const getFollowCounts = useCallback((userId: string) => {
    const followers = userFollows.filter(follow => follow.following_id === userId).length;
    const following = userFollows.filter(follow => follow.follower_id === userId).length;
    return { followers, following };
  }, [userFollows]);

  // Share event functionality
  const shareEvent = useCallback(async (eventId: string, eventTitle: string, platform?: string) => {
    const shareData = {
      title: `Check out this event: ${eventTitle}`,
      text: `I found this interesting event on VibeCatcher!`,
      url: `${window.location.origin}/events/${eventId}`,
    };

    try {
      if (navigator.share && platform !== 'clipboard') {
        await navigator.share(shareData);
        toast({
          title: "Shared",
          description: "Event shared successfully",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share event",
        variant: "destructive",
      });
    }
  }, []);

  return {
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowing,
    getFollowCounts,
    userBadges,
    shareEvent,
    isFollowLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};
