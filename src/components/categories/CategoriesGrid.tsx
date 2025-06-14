
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/SearchContext';

const CategoriesGrid = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useSearch();

  const { data: categoriesWithCounts, isLoading, error } = useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: async () => {
      // Get categories with event counts
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Get event counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published');

          return {
            ...category,
            eventCount: count || 0,
          };
        })
      );

      return categoriesWithCounts;
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll to events section
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error || !categoriesWithCounts) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading categories.</p>
      </div>
    );
  }

  if (categoriesWithCounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No categories available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categoriesWithCounts.map((category) => (
        <div
          key={category.id}
          className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
          style={{ borderColor: category.color + '40' }}
          onClick={() => handleCategoryClick(category.id)}
        >
          <div
            className="w-8 h-8 rounded-full mb-2"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {category.eventCount} {category.eventCount === 1 ? 'event' : 'events'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CategoriesGrid;
