
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin } from 'lucide-react';
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
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 coral-gradient-soft rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative glass-strong rounded-2xl p-2 border-2 border-transparent group-hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center">
            <Search className="ml-4 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search events, locations, or categories..."
              className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4 h-auto"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 hover:bg-primary/10 rounded-xl relative"
                >
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs coral-gradient text-white border-0"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-strong border-primary/20" align="end">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories?.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedCategory === category.id 
                              ? 'coral-gradient text-white border-0' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => 
                            setSelectedCategory(selectedCategory === category.id ? null : category.id)
                          }
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">Date Range</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'today', label: 'Today' },
                        { value: 'tomorrow', label: 'Tomorrow' },
                        { value: 'this-week', label: 'This Week' },
                        { value: 'this-month', label: 'This Month' }
                      ].map((period) => (
                        <Badge
                          key={period.value}
                          variant={dateFilter === period.value ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            dateFilter === period.value 
                              ? 'coral-gradient text-white border-0' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setDateFilter(dateFilter === period.value ? null : period.value)}
                        >
                          {period.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter location"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="pl-10 focus-coral"
                      />
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full outline-button"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20">
              {categories?.find(c => c.id === selectedCategory)?.name}
              <X
                className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedCategory(null)}
              />
            </Badge>
          )}
          {dateFilter && (
            <Badge variant="secondary" className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20">
              {dateFilter.replace('-', ' ')}
              <X
                className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setDateFilter(null)}
              />
            </Badge>
          )}
          {locationFilter && (
            <Badge variant="secondary" className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20">
              <MapPin className="h-3 w-3" />
              {locationFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
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
