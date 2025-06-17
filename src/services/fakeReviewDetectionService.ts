
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
};

interface DetectionResult {
  isSuspicious: boolean;
  suspicionScore: number;
  flags: string[];
  confidence: number;
}

interface ReviewAnalytics {
  userReviewCount: number;
  userAccountAge: number;
  reviewsInTimeWindow: number;
  duplicateContentScore: number;
  genericLanguageScore: number;
}

export class FakeReviewDetectionService {
  private static readonly SUSPICION_THRESHOLD = 0.6;
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.8;

  // Common generic phrases that indicate low-quality or fake reviews
  private static readonly GENERIC_PHRASES = [
    'great event',
    'awesome experience',
    'highly recommend',
    'loved it',
    'amazing time',
    'perfect event',
    'will definitely attend again',
    'exceeded expectations',
    'fantastic organization',
    'well organized',
    'good value for money',
    'worth every penny'
  ];

  // Template patterns that indicate automated/fake reviews
  private static readonly TEMPLATE_PATTERNS = [
    /^(great|good|awesome|amazing|fantastic)\s+(event|experience|time)/i,
    /^(highly|definitely)\s+(recommend|worth)/i,
    /^(loved|enjoyed)\s+(the|this)\s+(event|experience)/i,
    /^(perfect|excellent)\s+(organization|event)/i
  ];

  static async analyzeReview(review: Review): Promise<DetectionResult> {
    const analytics = await this.gatherReviewAnalytics(review);
    const flags: string[] = [];
    let suspicionScore = 0;

    // Check for rapid-fire reviews (multiple reviews in short time)
    if (analytics.reviewsInTimeWindow > 3) {
      flags.push('Multiple reviews in short time period');
      suspicionScore += 0.3;
    }

    // Check for new account with immediate review
    if (analytics.userAccountAge < 24 && analytics.userReviewCount === 1) {
      flags.push('New account with first review');
      suspicionScore += 0.2;
    }

    // Check for excessive reviewing (spam behavior)
    if (analytics.userReviewCount > 10 && analytics.userAccountAge < 168) { // 10 reviews in less than a week
      flags.push('Excessive reviewing activity');
      suspicionScore += 0.4;
    }

    // Check for duplicate or very similar content
    if (analytics.duplicateContentScore > 0.8) {
      flags.push('Very similar to existing reviews');
      suspicionScore += 0.5;
    }

    // Check for generic language
    if (analytics.genericLanguageScore > 0.7) {
      flags.push('Generic or template-like language');
      suspicionScore += 0.3;
    }

    // Check review length (too short might be low effort)
    if (review.content.length < 20) {
      flags.push('Very short review content');
      suspicionScore += 0.1;
    }

    // Check for extreme ratings without detailed explanation
    if ((review.rating === 1 || review.rating === 5) && review.content.length < 50) {
      flags.push('Extreme rating with minimal explanation');
      suspicionScore += 0.2;
    }

    // Check for template patterns
    const hasTemplatePattern = this.TEMPLATE_PATTERNS.some(pattern => 
      pattern.test(review.content)
    );
    if (hasTemplatePattern) {
      flags.push('Template-like review structure');
      suspicionScore += 0.2;
    }

    const confidence = Math.min(suspicionScore, 1);
    const isSuspicious = suspicionScore >= this.SUSPICION_THRESHOLD;

    return {
      isSuspicious,
      suspicionScore,
      flags,
      confidence
    };
  }

  private static async gatherReviewAnalytics(review: Review): Promise<ReviewAnalytics> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user's total review count
    const { data: userReviews } = await supabase
      .from('reviews')
      .select('id, created_at, content')
      .eq('user_id', review.user_id);

    const userReviewCount = userReviews?.length || 0;

    // Get user's recent reviews (last 24 hours)
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', review.user_id)
      .gte('created_at', oneDayAgo.toISOString());

    const reviewsInTimeWindow = recentReviews?.length || 0;

    // Calculate account age in hours
    const userCreatedAt = review.profiles?.created_at;
    const userAccountAge = userCreatedAt 
      ? (now.getTime() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60)
      : 0;

    // Calculate duplicate content score
    const duplicateContentScore = await this.calculateDuplicateScore(review, userReviews || []);

    // Calculate generic language score
    const genericLanguageScore = this.calculateGenericLanguageScore(review.content);

    return {
      userReviewCount,
      userAccountAge,
      reviewsInTimeWindow,
      duplicateContentScore,
      genericLanguageScore
    };
  }

  private static async calculateDuplicateScore(
    currentReview: Review, 
    userReviews: any[]
  ): Promise<number> {
    if (userReviews.length <= 1) return 0;

    const currentContent = currentReview.content.toLowerCase().trim();
    let maxSimilarity = 0;

    // Also check against other reviews for the same event
    const { data: eventReviews } = await supabase
      .from('reviews')
      .select('content')
      .eq('event_id', currentReview.event_id)
      .neq('user_id', currentReview.user_id);

    const allReviewsToCheck = [
      ...userReviews.map(r => r.content),
      ...(eventReviews || []).map(r => r.content)
    ];

    for (const otherContent of allReviewsToCheck) {
      if (otherContent && otherContent !== currentContent) {
        const similarity = this.calculateStringSimilarity(
          currentContent, 
          otherContent.toLowerCase().trim()
        );
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    return maxSimilarity;
  }

  private static calculateGenericLanguageScore(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    if (totalWords === 0) return 1;

    let genericPhraseCount = 0;
    
    // Count generic phrases
    for (const phrase of this.GENERIC_PHRASES) {
      if (content.toLowerCase().includes(phrase)) {
        genericPhraseCount++;
      }
    }

    // Calculate ratio of generic content
    const genericRatio = genericPhraseCount / Math.max(totalWords / 5, 1); // Normalize by content length
    
    return Math.min(genericRatio, 1);
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity for text comparison
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  static async flagSuspiciousReview(reviewId: string, detectionResult: DetectionResult): Promise<void> {
    try {
      // Update the review with suspicion flags
      const { error } = await supabase
        .from('reviews')
        .update({
          status: detectionResult.confidence > this.HIGH_CONFIDENCE_THRESHOLD ? 'rejected' : 'pending'
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error flagging suspicious review:', error);
        return;
      }

      // Create a notification for admins about the suspicious review
      const { data: adminIds } = await supabase.rpc('get_admin_user_ids');
      
      if (adminIds && adminIds.length > 0) {
        const notifications = adminIds.map((adminId: string) => ({
          user_id: adminId,
          type: 'suspicious_review' as const,
          title: 'Suspicious Review Detected',
          message: `A review has been flagged as potentially fake. Flags: ${detectionResult.flags.join(', ')}`,
          data: {
            review_id: reviewId,
            suspicion_score: detectionResult.suspicionScore,
            flags: detectionResult.flags,
            confidence: detectionResult.confidence
          }
        }));

        await supabase.from('notifications').insert(notifications);
      }

      console.log(`Review ${reviewId} flagged as suspicious with score ${detectionResult.suspicionScore}`);
    } catch (error) {
      console.error('Error in flagSuspiciousReview:', error);
    }
  }
}
