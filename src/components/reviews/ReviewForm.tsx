import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFakeReviewDetection } from '@/hooks/useFakeReviewDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, X, AlertTriangle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReviewFormProps {
  eventId: string;
  onSuccess: () => void;
}

export const ReviewForm = ({ eventId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDetectionAlert, setShowDetectionAlert] = useState(false);
  const [detectionFlags, setDetectionFlags] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
    atmosphereRating: 0,
    organizationRating: 0,
    valueRating: 0,
  });

  const { detectFakeReview, isAnalyzing } = useFakeReviewDetection({
    onDetectionComplete: (isSuspicious, flags) => {
      if (isSuspicious) {
        setDetectionFlags(flags);
        setShowDetectionAlert(true);
      }
    }
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      if (!formData.title || !formData.content || formData.rating === 0) {
        throw new Error('Please fill in all required fields');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          event_id: eventId,
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          rating: formData.rating,
          atmosphere_rating: formData.atmosphereRating || null,
          organization_rating: formData.organizationRating || null,
          value_rating: formData.valueRating || null,
        })
        .select(`
          *,
          profiles (*)
        `)
        .single();

      if (error) throw error;

      // Run fake review detection after successful submission
      if (data) {
        detectFakeReview(data as any);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', eventId] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback! Your review is being processed.',
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Review submission error:', error);
      
      let errorMessage = error.message;
      
      // Handle specific constraint violation error
      if (error.message?.includes('reviews_event_id_user_id_key') || 
          error.message?.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'You have already submitted a review for this event. Each user can only review an event once.';
      }
      
      toast({
        title: 'Error submitting review',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    label: string;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDetectionAlert(false);
    submitReview.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Write a Review
            <Shield className="h-5 w-5 text-green-600" title="Protected by AI fraud detection" />
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSuccess}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showDetectionAlert && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Review Quality Notice:</strong> Our AI detected some patterns that may affect review quality:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {detectionFlags.map((flag, index) => (
                  <li key={index} className="text-sm">{flag}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                Your review has been submitted for additional review. Authentic, detailed reviews help other users make better decisions.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Review Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your detailed experience..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Please provide specific details about your experience to help other users.
            </p>
          </div>

          <StarRating
            value={formData.rating}
            onChange={(rating) => setFormData({ ...formData, rating })}
            label="Overall Rating *"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              value={formData.atmosphereRating}
              onChange={(rating) => setFormData({ ...formData, atmosphereRating: rating })}
              label="Atmosphere"
            />
            <StarRating
              value={formData.organizationRating}
              onChange={(rating) => setFormData({ ...formData, organizationRating: rating })}
              label="Organization"
            />
            <StarRating
              value={formData.valueRating}
              onChange={(rating) => setFormData({ ...formData, valueRating: rating })}
              label="Value"
            />
          </div>

          <Button 
            type="submit" 
            disabled={submitReview.isPending || isAnalyzing}
            className="w-full"
          >
            {submitReview.isPending ? 'Submitting...' : isAnalyzing ? 'Processing...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
