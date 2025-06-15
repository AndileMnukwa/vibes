
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminResponseFormProps {
  reviewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminResponseForm = ({ reviewId, onSuccess, onCancel }: AdminResponseFormProps) => {
  const [responseContent, setResponseContent] = useState('');
  const queryClient = useQueryClient();

  const submitResponse = useMutation({
    mutationFn: async () => {
      if (!responseContent.trim()) {
        throw new Error('Please enter a response');
      }

      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
          response_content: responseContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Response submitted',
        description: 'Your response has been posted successfully.',
      });
      setResponseContent('');
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting response',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-3">Admin Response</h4>
      <div className="space-y-3">
        <div>
          <Label htmlFor="response">Your Response</Label>
          <Textarea
            id="response"
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Write your response to this review..."
            rows={4}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => submitResponse.mutate()}
            disabled={submitResponse.isPending || !responseContent.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitResponse.isPending ? (
              'Posting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Response
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
