
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export function PreferencesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Tables<'categories'>[];
    },
  });

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_categories')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update selected categories when preferences load
  useEffect(() => {
    if (preferences?.preferred_categories) {
      setSelectedCategories(preferences.preferred_categories);
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_categories: categoryIds })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your category preferences have been updated.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['personalized-recommendations'] });
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    savePreferencesMutation.mutate(selectedCategories);
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Event Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your favorite event categories to get personalized recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Badge
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors p-2 justify-center ${
                  isSelected 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'hover:bg-gray-100'
                }`}
                style={isSelected ? {} : { borderColor: category.color }}
                onClick={() => toggleCategory(category.id)}
              >
                {isSelected && <Check className="h-3 w-3 mr-1" />}
                {category.name}
              </Badge>
            );
          })}
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={savePreferencesMutation.isPending || isLoading}
          className="w-full"
        >
          {savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
