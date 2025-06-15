
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Share2, Link, Twitter, Facebook } from 'lucide-react';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';

interface ShareButtonProps {
  eventId: string;
  eventTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  eventId, 
  eventTitle, 
  variant = 'outline',
  size = 'default'
}) => {
  const { shareEvent } = useSocialFeatures();

  const eventUrl = `${window.location.origin}/events/${eventId}`;
  const shareText = `Check out this event: ${eventTitle}`;

  const handleShare = (platform?: string) => {
    shareEvent(eventId, eventTitle, platform);
  };

  const openSocialShare = (platform: 'twitter' | 'facebook') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('native')}>
          <Share2 className="h-4 w-4 mr-2" />
          Share via...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('clipboard')}>
          <Link className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openSocialShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openSocialShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
