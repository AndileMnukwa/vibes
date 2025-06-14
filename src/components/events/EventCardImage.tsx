
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Crown } from 'lucide-react';

interface EventCardImageProps {
  imageUrl?: string | null;
  title: string;
  isExternal: boolean;
  isAdminCreated?: boolean;
}

export function EventCardImage({ imageUrl, title, isExternal, isAdminCreated }: EventCardImageProps) {
  const hasImage = imageUrl && imageUrl.trim() !== '';

  if (hasImage) {
    return (
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {isAdminCreated && (
            <Badge className="bg-yellow-600 hover:bg-yellow-700">
              <Crown className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {isExternal && (
            <Badge className="bg-blue-600">
              External
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
      <div className="absolute top-3 right-3 flex gap-2">
        {isAdminCreated && (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Crown className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {isExternal && (
          <Badge className="bg-blue-600">
            External
          </Badge>
        )}
      </div>
    </div>
  );
}
