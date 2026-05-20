/**
 * Logout Button Component
 * Simple button to sign out the current user
 */

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  className
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();

      // Verify session is cleared before redirecting
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/';
      } else {
        console.error('Session still exists after signout');
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
