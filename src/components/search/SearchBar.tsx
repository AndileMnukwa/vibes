
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Calendar as CalendarIcon } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
        <div className="relative glass rounded-2xl p-2 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="flex items-center flex-1 space-x-3">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Search className="h-5 w-5 text-white" />
              </div>
              <Input
                placeholder="Search events, locations, or categories..."
                className="flex-1 border-0 bg-transparent text-lg placeholder:text-slate-500 focus:ring-0 focus:outline-none"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="relative rounded-xl hover:bg-white/50 transition-all duration-200"
                >
                  <Filter className="h-5 w-5" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs bg-purple-500 text-white border-2 border-white"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-6 glass border border-white/20 rounded-2xl" align="end">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <label className="font-medium text-slate-700">Category</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories?.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1 rounded-lg hover:scale-105 transition-all duration-200"
                          onClick={() => 
                            setSelectedCategory(selectedCategory === category.id ? null : category.id)
                          }
                          style={{
                            backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                            borderColor: category.color,
                            color: selectedCategory === category.id ? 'white' : category.color,
                          }}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      <label className="font-medium text-slate-700">When</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'today', label: 'Today' },
                        { key: 'tomorrow', label: 'Tomorrow' },
                        { key: 'this-week', label: 'This Week' },
                        { key: 'this-month', label: 'This Month' }
                      ].map((period) => (
                        <Badge
                          key={period.key}
                          variant={dateFilter === period.key ? "default" : "outline"}
                          className="cursor-pointer justify-center px-3 py-2 rounded-lg hover:scale-105 transition-all duration-200"
                          onClick={() => setDateFilter(dateFilter === period.key ? null : period.key)}
                        >
                          {period.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <label className="font-medium text-slate-700">Location</label>
                    </div>
                    <Input
                      placeholder="Enter city or area..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 px-2 animate-fade-in">
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 border border-purple-200"
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              {categories?.find(c => c.id === selectedCategory)?.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-purple-900 transition-colors"
                onClick={() => setSelectedCategory(null)}
              />
            </Badge>
          )}
          {dateFilter && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-200"
            >
              <CalendarIcon className="w-3 h-3" />
              {dateFilter.replace('-', ' ')}
              <X
                className="h-3 w-3 cursor-pointer hover:text-blue-900 transition-colors"
                onClick={() => setDateFilter(null)}
              />
            </Badge>
          )}
          {locationFilter && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 text-green-700 border border-green-200"
            >
              <MapPin className="w-3 h-3" />
              {locationFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-green-900 transition-colors"
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
