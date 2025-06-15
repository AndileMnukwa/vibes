
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ReviewTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Review</TableHead>
        <TableHead>Author</TableHead>
        <TableHead>Event</TableHead>
        <TableHead>Rating</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Sentiment</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
