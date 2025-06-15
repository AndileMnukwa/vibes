
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface SearchFilters {
  query: string;
  category?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
}

interface SearchResult extends Event {
  relevanceScore: number;
  matchedFields: string[];
}

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });
  const [savedSearches, setSavedSearches] = useState<SearchFilters[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [debouncedQuery] = useDebounce(filters.query, 300);

  // Fuzzy search implementation
  const fuzzyMatch = (text: string, query: string): { score: number; matched: boolean } => {
    if (!query) return { score: 0, matched: true };
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return { score: 1, matched: true };
    }
    
    // Character-by-character fuzzy matching
    let score = 0;
    let textIndex = 0;
    
    for (let i = 0; i < queryLower.length; i++) {
      const char = queryLower[i];
      let found = false;
      
      for (let j = textIndex; j < textLower.length; j++) {
        if (textLower[j] === char) {
          score += 1 / (1 + j - textIndex); // Closer matches get higher scores
          textIndex = j + 1;
          found = true;
          break;
        }
      }
      
      if (!found) {
        return { score: 0, matched: false };
      }
    }
    
    return { score: score / queryLower.length, matched: true };
  };

  // Calculate relevance score for an event
  const calculateRelevance = useCallback((event: Event, query: string): number => {
    let totalScore = 0;
    let maxScore = 0;
    
    const fields = [
      { text: event.title, weight: 3 },
      { text: event.description, weight: 2 },
      { text: event.location, weight: 2 },
      { text: event.categories?.name || '', weight: 1.5 },
      { text: event.tags?.join(' ') || '', weight: 1 },
    ];
    
    fields.forEach(({ text, weight }) => {
      const { score } = fuzzyMatch(text, query);
      totalScore += score * weight;
      maxScore += weight;
    });
    
    return maxScore > 0 ? totalScore / maxScore : 0;
  }, []);

  // Main search query
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['advanced-search', debouncedQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          categories (*),
          profiles (*)
        `)
        .eq('status', 'published');

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.dateRange) {
        query = query
          .gte('event_date', filters.dateRange.start.toISOString())
          .lte('event_date', filters.dateRange.end.toISOString());
      }

      if (filters.priceRange) {
        query = query
          .gte('ticket_price', filters.priceRange.min)
          .lte('ticket_price', filters.priceRange.max);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Event[];
    },
    enabled: true,
  });

  // Process search results with fuzzy matching and relevance scoring
  const searchResults: SearchResult[] = useMemo(() => {
    if (!events.length) return [];

    const results = events
      .map((event): SearchResult => {
        const relevanceScore = debouncedQuery 
          ? calculateRelevance(event, debouncedQuery)
          : 1;

        const matchedFields: string[] = [];
        
        if (debouncedQuery) {
          const fields = [
            { name: 'title', text: event.title },
            { name: 'description', text: event.description },
            { name: 'location', text: event.location },
            { name: 'category', text: event.categories?.name || '' },
            { name: 'tags', text: event.tags?.join(' ') || '' },
          ];

          fields.forEach(({ name, text }) => {
            const { matched } = fuzzyMatch(text, debouncedQuery);
            if (matched) {
              matchedFields.push(name);
            }
          });
        }

        return {
          ...event,
          relevanceScore,
          matchedFields,
        };
      })
      .filter(result => !debouncedQuery || result.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }, [events, debouncedQuery, calculateRelevance]);

  // Save search
  const saveSearch = useCallback((name: string) => {
    const searchToSave = { ...filters, name };
    setSavedSearches(prev => [...prev, searchToSave]);
    
    // Persist to localStorage
    localStorage.setItem('savedSearches', JSON.stringify([...savedSearches, searchToSave]));
  }, [filters, savedSearches]);

  // Load saved searches
  const loadSavedSearches = useCallback(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Add to search history
  const addToHistory = useCallback((query: string) => {
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [searchHistory]);

  // Get search suggestions
  const getSearchSuggestions = useCallback((query: string) => {
    if (!query) return [];
    
    const suggestions = searchHistory
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    
    return suggestions;
  }, [searchHistory]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    if (newFilters.query) {
      addToHistory(newFilters.query);
    }
  }, [addToHistory]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ query: '' });
  }, []);

  return {
    filters,
    searchResults,
    isLoading,
    error,
    savedSearches,
    searchHistory,
    updateFilters,
    clearFilters,
    saveSearch,
    loadSavedSearches,
    getSearchSuggestions,
  };
};
