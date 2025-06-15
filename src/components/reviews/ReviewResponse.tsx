
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewResponse = Tables<'review_responses'> & {
  profiles: Tables<'profiles'> | null;
};

interface ReviewResponseProps {
  response: ReviewResponse;
}

export const ReviewResponse = ({ response }: ReviewResponseProps) => {
  const responseDate = new Date(response.created_at).toLocaleDateString();
  const timeAgo = formatDistanceToNow(new Date(response.created_at), { addSuffix: true });
  const adminName = response.profiles?.full_name || response.profiles?.username || 'Admin';

  return (
    <Card className="mt-3 ml-8 border-purple-200 bg-purple-50/50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
              Admin Response
            </Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-purple-700">{adminName}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground" title={responseDate}>
              {timeAgo}
            </span>
          </div>
          
          <div className="text-sm leading-relaxed text-gray-700 bg-white p-3 rounded-md border border-purple-100">
            {response.response_content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
