
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';

interface EventCardImageProps {
  imageUrl?: string | null;
  title: string;
  isExternal: boolean;
}

export function EventCardImage({ imageUrl, title, isExternal }: EventCardImageProps) {
  const hasImage = imageUrl && imageUrl.trim() !== '';

  if (hasImage) {
    return (
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {isExternal && (
          <Badge className="absolute top-3 right-3 bg-blue-600">
            External
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
      {isExternal && (
        <Badge className="absolute top-3 right-3 bg-blue-600">
          External
        </Badge>
      )}
    </div>
  );
}
