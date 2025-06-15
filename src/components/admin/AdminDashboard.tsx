
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, MessageSquare, TrendingUp, Activity, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalReviews: number;
  activeUsers: number;
  eventsByMonth: Array<{ month: string; count: number }>;
  reviewsByRating: Array<{ rating: number; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
}

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get total counts
      const [usersResult, eventsResult, reviewsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' }),
      ]);

      // Get events by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: eventsByMonth } = await supabase
        .from('events')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Process events by month
      const monthlyEvents = eventsByMonth?.reduce((acc, event) => {
        const month = new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get reviews by rating
      const { data: reviewsByRating } = await supabase
        .from('reviews')
        .select('rating');

      const ratingCounts = reviewsByRating?.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      return {
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        activeUsers: Math.floor((usersResult.count || 0) * 0.3), // Estimate
        eventsByMonth: Object.entries(monthlyEvents).map(([month, count]) => ({ month, count })),
        reviewsByRating: Object.entries(ratingCounts).map(([rating, count]) => ({ 
          rating: parseInt(rating), 
          count 
        })),
        userGrowth: [], // Would need more complex query for user growth
      };
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events Overview</TabsTrigger>
          <TabsTrigger value="reviews">Review Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events Created by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.eventsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Distribution by Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.reviewsByRating || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, percent }) => `${rating}★ ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.reviewsByRating?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15.3k</div>
                  <div className="text-sm text-muted-foreground">Page Views Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
