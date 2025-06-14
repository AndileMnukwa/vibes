
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user';

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading: loading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          return 'user' as UserRole; // Default to user role on error
        } else {
          return (data?.role || 'user') as UserRole;
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole;
      }
    },
    enabled: !!user,
  });

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  return {
    role,
    loading,
    isAdmin,
    isModerator,
    hasAdminAccess,
  };
}
