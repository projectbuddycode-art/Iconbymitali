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
      
      // Create a timeout promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 10000)
      );

      // Race between actual auth check and timeout
      await Promise.race([
        (async () => {
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
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
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Auth check error:', error);
      
      // If timeout, just proceed without authenticated state
      if (error instanceof Error && error.message === 'Auth check timeout') {
        console.warn('Auth check timed out - proceeding with unauthenticated state');
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAdmin(false);
      } else {
        /** @type {any} */
        const err = error;
        setAuthError({
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    checkUserAuth();

    // Set up auth state listener
    /** @type {(event: any, session: any) => Promise<void>} */
    const authStateHandler = async (_event, _session) => {
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        await checkUserAuth();
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserRole(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(authStateHandler);

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkUserAuth]);

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
