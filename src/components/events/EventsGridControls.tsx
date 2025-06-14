
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List } from 'lucide-react';

type SortOption = 'date' | 'distance' | 'price' | 'popularity';
type ViewMode = 'grid' | 'list';

interface EventsGridControlsProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function EventsGridControls({ sortBy, setSortBy, viewMode, setViewMode }: EventsGridControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="distance">Distance</SelectItem>
          <SelectItem value="price">Price</SelectItem>
          <SelectItem value="popularity">Popularity</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
