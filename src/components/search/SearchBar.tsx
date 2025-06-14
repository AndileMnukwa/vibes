
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
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a6fdc]/20 to-[#7e8ef7]/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748b] h-5 w-5 group-hover:text-[#4a6fdc] transition-colors duration-300" />
          <input
            placeholder="Search events, locations, or categories..."
            className="w-full pl-12 pr-16 py-4 text-lg bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus: ring-[#4a6fdc]/10 transition-all duration-300 shadow-elegant hover:shadow-elegant-hover outline-none font-medium"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-[#4a6fdc]/10 transition-all duration-300 group/btn"
              >
                <Filter className="h-5 w-5 text-[#64748b] group-hover/btn:text-[#4a6fdc] transition-colors duration-300" />
                {activeFiltersCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{activeFiltersCount}</span>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass border-white/20 shadow-elegant" align="end">
              <div className="space-y-6 p-2">
                <div>
                  <label className="text-sm font-semibold text-[#202939] mb-3 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => 
                          setSelectedCategory(selectedCategory === category.id ? null : category.id)
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          selectedCategory === category.id
                            ? 'text-white shadow-md transform scale-105'
                            : 'bg-white/60 text-[#64748b] hover:bg-white/80 hover:text-[#202939] hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: selectedCategory === category.id ? category.color : undefined,
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#202939] mb-3 block">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'today', label: 'Today' },
                      { key: 'tomorrow', label: 'Tomorrow' },
                      { key: 'this-week', label: 'This Week' },
                      { key: 'this-month', label: 'This Month' }
                    ].map((period) => (
                      <button
                        key={period.key}
                        onClick={() => setDateFilter(dateFilter === period.key ? null : period.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          dateFilter === period.key
                            ? 'bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] text-white shadow-md transform scale-105'
                            : 'bg-white/60 text-[#64748b] hover:bg-white/80 hover:text-[#202939] hover:scale-105'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#202939] mb-3 block">Location</label>
                  <input
                    placeholder="Enter location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl focus:bg-white focus:border-[#4a6fdc] focus:ring-2 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none text-sm"
                  />
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded-xl py-2 font-medium transition-all duration-300"
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

      {/* Enhanced Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-3 animate-slide-up">
          {selectedCategory && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50 group hover:scale-105 transition-all duration-300">
              <span className="text-sm font-medium text-[#202939]">
                {categories?.find(c => c.id === selectedCategory)?.name}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-5 h-5 rounded-full bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {dateFilter && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50 group hover:scale-105 transition-all duration-300">
              <span className="text-sm font-medium text-[#202939]">
                {dateFilter.replace('-', ' ')}
              </span>
              <button
                onClick={() => setDateFilter(null)}
                className="w-5 h-5 rounded-full bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {locationFilter && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50 group hover:scale-105 transition-all duration-300">
              <span className="text-sm font-medium text-[#202939]">
                {locationFilter}
              </span>
              <button
                onClick={() => setLocationFilter('')}
                className="w-5 h-5 rounded-full bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
