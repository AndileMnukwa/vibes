
import React from 'react';
import Layout from '@/components/layout/Layout';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import '@/components/calendar/FullCalendarStyles.css';

const Calendar = () => {
  return (
    <Layout>
      <FullCalendarView />
    </Layout>
  );
};

export default Calendar;
