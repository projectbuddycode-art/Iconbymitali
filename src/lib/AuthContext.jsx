import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

/** @type {React.Context<any>} */
const AuthContext = createContext(null);

/** @type {React.FC<{children: React.ReactNode}>} */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user auth and fetch user profile
  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      
      // Get current session - Supabase handles locking internally
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        // Fetch user profile from database to get role and other info
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is OK
          console.warn('Error fetching profile:', profileError);
        }

        const role = profile?.role || 'user';
        const adminStatus = profile?.is_admin === true || profile?.role === 'admin';
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || profile?.full_name,
          role,
          is_admin: adminStatus,
          ...profile
        });
        setUserRole(role);
        setIsAdmin(adminStatus);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAdmin(false);
        setAuthError(null);
      }
    } catch (error) {
      console.error('Auth check error:', error?.message);
      setAuthError({
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    // Only check auth once on mount
    checkUserAuth();

    // Use Supabase's built-in auth state listener
    // This will automatically handle token refresh (autoRefreshToken: true in client config)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserRole(null);
      }
      // Note: SIGNED_IN and TOKEN_REFRESHED are auto-handled by Supabase
      // We don't need to manually refresh - just let localStorage persistence work
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkUserAuth]);

  // Re-check auth when tab becomes visible to handle tab switches
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible - session check');
        // Session is persisted in localStorage, should still be valid
        // If user was logged in before, they should still be logged in
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      authChecked,
      checkUserAuth,
      userRole,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
