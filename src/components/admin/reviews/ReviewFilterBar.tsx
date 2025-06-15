
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import type { ReviewFilters, ReviewSort } from '@/pages/admin/AdminReviews';

interface ReviewFilterBarProps {
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
}

export const ReviewFilterBar = ({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: ReviewFilterBarProps) => {
  const handleFilterChange = (key: keyof ReviewFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSortChange = (field: ReviewSort['field']) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({ field, direction: 'desc' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.rating}
          onValueChange={(value) => handleFilterChange('rating', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sentiment}
          onValueChange={(value) => handleFilterChange('sentiment', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            variant={sort.field === 'created_at' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('created_at')}
          >
            Date
            {sort.field === 'created_at' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
          <Button
            variant={sort.field === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('rating')}
          >
            Rating
            {sort.field === 'rating' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
          <Button
            variant={sort.field === 'helpful_count' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('helpful_count')}
          >
            Helpful
            {sort.field === 'helpful_count' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
