
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReviewResponseFormProps {
  reviewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewResponseForm = ({ reviewId, onSuccess, onCancel }: ReviewResponseFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [responseContent, setResponseContent] = useState('');

  const submitResponse = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      if (!responseContent.trim()) {
        throw new Error('Please enter a response');
      }

      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          admin_user_id: user.id,
          response_content: responseContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Response submitted',
        description: 'Your response has been posted successfully.',
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitResponse.mutate();
  };

  return (
    <Card className="mt-4 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-700">Admin Response</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Write your response to this review..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitResponse.isPending || !responseContent.trim()}
              className="bg-purple-600 hover:bg-purple-700"
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
        </form>
      </CardContent>
    </Card>
  );
};
