
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewResponse = Tables<'review_responses'> & {
  profiles: Tables<'profiles'> | null;
};

interface ReviewResponsesListProps {
  responses: ReviewResponse[];
}

export const ReviewResponsesList = ({ responses }: ReviewResponsesListProps) => {
  if (responses.length === 0) return null;

  return (
    <div className="space-y-3">
      <Separator />
      <h4 className="font-medium">Admin Responses</h4>
      <div className="space-y-3">
        {responses.map((response) => (
          <div key={response.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Admin Response
              </Badge>
              <span className="text-sm font-medium">
                {response.profiles?.full_name || response.profiles?.username || 'Admin'}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700">{response.response_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
