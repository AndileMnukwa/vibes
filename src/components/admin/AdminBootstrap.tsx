
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AdminBootstrap = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if any admin users exist
  const { data: existingAdmins, isLoading: checkingAdmins } = useQuery({
    queryKey: ['existing-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mutation to make current user admin
  const makeAdminMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'You have been granted admin privileges.',
      });
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['existing-admins'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error granting admin access',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Don't show if user is not authenticated
  if (!user) return null;

  // Don't show if still checking for existing admins
  if (checkingAdmins) return null;

  // Don't show if admin users already exist
  if (existingAdmins && existingAdmins.length > 0) return null;

  // Don't show if already successfully created admin
  if (isSuccess) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800">System Setup Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No admin users found. As the first user, you can grant yourself admin privileges to manage the system.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>This will allow you to:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Create and manage events</li>
            <li>Manage user roles</li>
            <li>Access admin dashboard</li>
          </ul>
        </div>

        <Button 
          onClick={() => makeAdminMutation.mutate()}
          disabled={makeAdminMutation.isPending}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {makeAdminMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Granting Admin Access...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Make Me Admin
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          ⚠️ This option only appears when no admin users exist
        </div>
      </CardContent>
    </Card>
  );
};
