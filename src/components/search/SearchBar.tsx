
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearch } from '@/contexts/SearchContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SearchBar = () => {
  const {
    searchQuery,
    selectedCategory,
    dateFilter,
    locationFilter,
    setSearchQuery,
    setSelectedCategory,
    setDateFilter,
    setLocationFilter,
    clearFilters,
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const activeFiltersCount = [selectedCategory, dateFilter, locationFilter].filter(Boolean).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search events, locations, or categories..."
          className="pl-10 pr-12 py-3 text-lg"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories?.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => 
                        setSelectedCategory(selectedCategory === category.id ? null : category.id)
                      }
                      style={{
                        backgroundColor: selectedCategory === category.id ? category.color : undefined,
                        borderColor: category.color,
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['today', 'tomorrow', 'this-week', 'this-month'].map((period) => (
                    <Badge
                      key={period}
                      variant={dateFilter === period ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setDateFilter(dateFilter === period ? null : period)}
                    >
                      {period.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="mt-2"
                />
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories?.find(c => c.id === selectedCategory)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              />
            </Badge>
          )}
          {dateFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {dateFilter.replace('-', ' ')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setDateFilter(null)}
              />
            </Badge>
          )}
          {locationFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {locationFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setLocationFilter('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
