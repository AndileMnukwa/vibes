
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
  searchQuery: string;
  selectedCategory: string | null;
  dateFilter: string | null;
  locationFilter: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setDateFilter: (date: string | null) => void;
  setLocationFilter: (location: string) => void;
  clearFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('');

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setDateFilter(null);
    setLocationFilter('');
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        selectedCategory,
        dateFilter,
        locationFilter,
        setSearchQuery,
        setSelectedCategory,
        setDateFilter,
        setLocationFilter,
        clearFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
