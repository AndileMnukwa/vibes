
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, List } from 'lucide-react';

type SortOption = 'date' | 'distance' | 'price' | 'popularity';
type ViewMode = 'grid' | 'list';

interface EventsGridControlsProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function EventsGridControls({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: EventsGridControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Sort Options */}
      <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="date">Date</TabsTrigger>
          <TabsTrigger value="distance">Distance</TabsTrigger>
          <TabsTrigger value="price">Price</TabsTrigger>
          <TabsTrigger value="popularity">Popular</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* View Mode Toggle */}
      <div className="flex border rounded-lg">
        <Button
          variant={viewMode === 'grid' ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
