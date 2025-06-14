
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

type UserPreferences = {
  preferredCategories: string[];
  location: string | null;
  priceRange: 'free' | 'low' | 'medium' | 'high' | null;
  reviewHistory: Array<{
    event_id: string;
    rating: number;
    category_id: string | null;
  }>;
};

export class RecommendationService {
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    // Get user profile preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_categories, location')
      .eq('id', userId)
      .single();

    // Get user's review history
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        event_id,
        rating,
        events!inner(category_id)
      `)
      .eq('user_id', userId)
      .eq('status', 'approved');

    const reviewHistory = reviews?.map(review => ({
      event_id: review.event_id,
      rating: review.rating,
      category_id: review.events?.category_id || null
    })) || [];

    return {
      preferredCategories: profile?.preferred_categories || [],
      location: profile?.location || null,
      priceRange: null, // Can be enhanced based on user's price preferences
      reviewHistory
    };
  }

  static async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 6
  ): Promise<Event[]> {
    const preferences = await this.getUserPreferences(userId);
    
    let query = supabase
      .from('events')
      .select(`
        *,
        categories (*),
        profiles (*)
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    // Prioritize events in preferred categories
    if (preferences.preferredCategories.length > 0) {
      query = query.in('category_id', preferences.preferredCategories);
    }

    // Filter by location proximity if available
    if (preferences.location) {
      query = query.ilike('location', `%${preferences.location}%`);
    }

    const { data: events = [] } = await query.limit(limit * 2); // Get more to allow for scoring

    // Score and rank events
    const scoredEvents = events.map(event => ({
      ...event,
      score: this.calculateRecommendationScore(event, preferences)
    }));

    // Sort by score and return top results
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private static calculateRecommendationScore(
    event: Event, 
    preferences: UserPreferences
  ): number {
    let score = 0;

    // Category preference boost
    if (event.category_id && preferences.preferredCategories.includes(event.category_id)) {
      score += 3;
    }

    // Location proximity boost
    if (preferences.location && event.location.toLowerCase().includes(preferences.location.toLowerCase())) {
      score += 2;
    }

    // Free events get a small boost for new users
    if (event.ticket_price === 0) {
      score += 1;
    }

    // Boost based on similar events user has rated highly
    const similarHighRatedEvents = preferences.reviewHistory.filter(
      review => review.category_id === event.category_id && review.rating >= 4
    );
    score += similarHighRatedEvents.length * 1.5;

    // Recent events get a time-based boost
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilEvent <= 7) {
      score += 1; // Boost for events happening soon
    }

    return score;
  }

  static async getPopularEvents(limit: number = 6): Promise<Event[]> {
    // Get events with highest average ratings
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        categories (*),
        profiles (*),
        reviews!inner(rating)
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    return events || [];
  }

  static async getSimilarEvents(eventId: string, limit: number = 4): Promise<Event[]> {
    // Get the reference event
    const { data: referenceEvent } = await supabase
      .from('events')
      .select('category_id, location, ticket_price')
      .eq('id', eventId)
      .single();

    if (!referenceEvent) return [];

    // Find similar events
    let query = supabase
      .from('events')
      .select(`
        *,
        categories (*),
        profiles (*)
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .neq('id', eventId);

    // Prioritize same category
    if (referenceEvent.category_id) {
      query = query.eq('category_id', referenceEvent.category_id);
    }

    const { data: events = [] } = await query.limit(limit);
    return events;
  }
}
