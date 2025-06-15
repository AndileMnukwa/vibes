
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserMinus, Trophy, Users } from 'lucide-react';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';

interface UserProfileCardProps {
  user: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
  };
  showFollowButton?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  showFollowButton = true 
}) => {
  const { 
    followUser, 
    unfollowUser, 
    isFollowing, 
    getFollowCounts, 
    userBadges,
    isFollowLoading 
  } = useSocialFeatures();
  
  const following = isFollowing(user.id);
  const { followers, following: followingCount } = getFollowCounts(user.id);

  const handleFollowToggle = () => {
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-4">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback>
            {user.full_name?.split(' ').map(n => n[0]).join('') || 
             user.username?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="text-lg font-semibold">
            {user.full_name || user.username || 'Anonymous User'}
          </h3>
          {user.username && user.full_name && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
        </div>

        {user.bio && (
          <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Follow Stats */}
        <div className="flex justify-center gap-6 text-center">
          <div>
            <div className="text-xl font-bold">{followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-xl font-bold">{followingCount}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
        </div>

        {/* Badges */}
        {userBadges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Badges
            </div>
            <div className="flex flex-wrap gap-1">
              {userBadges.slice(0, 3).map(badge => (
                <Badge key={badge.id} variant="secondary" className="text-xs">
                  {badge.badge_name}
                </Badge>
              ))}
              {userBadges.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{userBadges.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Follow Button */}
        {showFollowButton && (
          <Button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            variant={following ? "outline" : "default"}
            className="w-full"
          >
            {following ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
