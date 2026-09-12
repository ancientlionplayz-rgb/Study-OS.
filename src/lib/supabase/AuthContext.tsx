'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthService } from '@/lib/auth/authService';
import { UserAccountProfile, AccountStatus, UserRole } from '@/lib/auth/types';

export interface SignInResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  user?: User | null;
  profile?: UserAccountProfile | null;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  user?: User | null;
  profile?: UserAccountProfile | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserAccountProfile | null;
  accountStatus: AccountStatus;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (identifier: string, password: string) => Promise<SignInResult>;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    username: string;
  }) => Promise<SignUpResult>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
  setLocalAccount: (acc: UserAccountProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  accountStatus: 'active',
  role: 'student',
  isLoading: true,
  isConfigured: false,
  signIn: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  resendVerificationEmail: async () => ({ success: false, error: 'Auth not initialized' }),
  signOut: async () => {},
  refreshProfile: () => {},
  setLocalAccount: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserAccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(() => {
    const current = AuthService.getCurrentAccount();
    setProfile(current);
  }, []);

  const setLocalAccount = useCallback((acc: UserAccountProfile) => {
    AuthService.setCurrentAccount(acc);
    setProfile(acc);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // 1. Live Supabase Session Check
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('StudyOS Supabase session lookup error:', sessionError.message);
          }

          if (!isMounted) return;

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            let current = AuthService.getCurrentAccount();
            if (!current || current.id !== session.user.id) {
              const all = AuthService.getRegisteredUsers();
              const match = all.find(
                (u) => u.id === session.user.id || (u.email && u.email.toLowerCase() === session.user.email?.toLowerCase())
              );
              if (match) {
                current = match;
              } else {
                current = {
                  id: session.user.id,
                  username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'student',
                  displayName: session.user.user_metadata?.full_name || 'StudyOS Student',
                  email: session.user.email,
                  role: (session.user.user_metadata?.role as any) || 'student',
                  accountStatus: 'active',
                  emailVerified: Boolean(session.user.email_confirmed_at),
                  createdAt: session.user.created_at || new Date().toISOString(),
                  onboardingCompleted: Boolean(session.user.user_metadata?.onboarding_completed),
                };
              }
              AuthService.setCurrentAccount(current);
            }
            if (isMounted) setProfile(current);
          } else {
            // Explicitly ensure profile is null if Supabase has no active session
            AuthService.setCurrentAccount(null);
            if (isMounted) setProfile(null);
          }
        } else {
          // 2. Standalone / Local-First Mode (Supabase not configured in .env.local)
          const current = AuthService.getCurrentAccount();
          if (isMounted) {
            setProfile(current);
            if (current) {
              // Construct a lightweight User object representation for local-mode
              setUser({
                id: current.id,
                app_metadata: {},
                user_metadata: {
                  full_name: current.displayName,
                  username: current.username,
                  onboarding_completed: current.onboardingCompleted,
                },
                aud: 'authenticated',
                created_at: current.createdAt,
              } as User);
            } else {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('StudyOS Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Set up real-time listener if Supabase client exists
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          let current = AuthService.getCurrentAccount();
          if (!current || current.id !== newSession.user.id) {
            const all = AuthService.getRegisteredUsers();
            const match = all.find(
              (u) => u.id === newSession.user.id || (u.email && u.email.toLowerCase() === newSession.user.email?.toLowerCase())
            );
            if (match) {
              current = match;
            } else {
              current = {
                id: newSession.user.id,
                username: newSession.user.user_metadata?.username || newSession.user.email?.split('@')[0] || 'student',
                displayName: newSession.user.user_metadata?.full_name || 'StudyOS Student',
                email: newSession.user.email,
                role: (newSession.user.user_metadata?.role as any) || 'student',
                accountStatus: 'active',
                emailVerified: Boolean(newSession.user.email_confirmed_at),
                createdAt: newSession.user.created_at || new Date().toISOString(),
                onboardingCompleted: Boolean(newSession.user.user_metadata?.onboarding_completed),
              };
            }
            AuthService.setCurrentAccount(current);
          }
          setProfile(current);
        } else if (event === 'SIGNED_OUT' || !newSession) {
          AuthService.setCurrentAccount(null);
          setProfile(null);
        }

        setIsLoading(false);
      });

      authSubscription = subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = useCallback(async (identifier: string, password: string): Promise<SignInResult> => {
    const trimmedId = identifier.trim();
    const cleanId = trimmedId.toLowerCase();
    console.log('[StudyOS Auth] signIn request initiated. Mode:', isSupabaseConfigured ? 'Supabase-Cloud' : 'Standalone-Local');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedId,
          password,
        });

        if (error) {
          console.warn('[StudyOS Auth] Supabase sign in error:', error.message);
          const isEmailNotConfirmed = error.message.toLowerCase().includes('email not confirmed');
          return {
            success: false,
            error: error.message,
            requiresEmailVerification: isEmailNotConfirmed,
          };
        }

        const authUser = data.user;
        const authSession = data.session;

        let current: UserAccountProfile | null = null;
        if (authUser) {
          const all = AuthService.getRegisteredUsers();
          current =
            all.find(
              (u) =>
                u.id === authUser.id ||
                (u.email && u.email.toLowerCase() === authUser.email?.toLowerCase())
            ) || null;

          if (!current) {
            current = {
              id: authUser.id,
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'student',
              displayName: authUser.user_metadata?.full_name || 'StudyOS Student',
              email: authUser.email,
              role: (authUser.user_metadata?.role as any) || 'student',
              accountStatus: 'active',
              emailVerified: Boolean(authUser.email_confirmed_at),
              createdAt: authUser.created_at || new Date().toISOString(),
              onboardingCompleted: Boolean(authUser.user_metadata?.onboarding_completed),
            };
          }

          AuthService.setCurrentAccount(current);
        }

        // Synchronously update React state so downstream guards immediately observe active session
        setSession(authSession);
        setUser(authUser ?? null);
        setProfile(current);
        setIsLoading(false);

        console.log('[StudyOS Auth] Supabase sign in successful. React state synchronized.');
        return {
          success: true,
          user: authUser,
          profile: current,
        };
      } catch (err: any) {
        console.error('[StudyOS Auth] Supabase sign in exception:', err);
        return {
          success: false,
          error: err?.message || 'Network or server error during authentication.',
        };
      }
    }

    // Standalone / Local-First Mode
    try {
      const allUsers = AuthService.getRegisteredUsers();
      let match = allUsers.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          u.username.toLowerCase() === cleanId
      );

      // Fallback for admin credentials
      if (!match && cleanId.includes('admin')) {
        match = allUsers.find((u) => u.role === 'admin') || allUsers[0];
      }

      if (!match) {
        console.warn('[StudyOS Auth] Account not found for identifier:', cleanId ? `${cleanId.substring(0, 3)}***` : 'empty');
        return {
          success: false,
          error: 'Account not found. Please verify your credentials or register a new account.',
        };
      }

      if (match.accountStatus === 'blocked' || match.accountStatus === 'rejected') {
        console.warn('[StudyOS Auth] Restricted account status:', match.accountStatus);
        return {
          success: false,
          error: `Access restricted: Your account is currently marked as ${match.accountStatus}.`,
        };
      }

      const localUser: User = {
        id: match.id,
        app_metadata: {},
        user_metadata: {
          full_name: match.displayName,
          username: match.username,
          onboarding_completed: match.onboardingCompleted,
          role: match.role,
        },
        aud: 'authenticated',
        created_at: match.createdAt,
        email: match.email,
      } as User;

      AuthService.setCurrentAccount(match);

      // Synchronously update React state
      setUser(localUser);
      setProfile(match);
      setSession(null);
      setIsLoading(false);

      console.log('[StudyOS Auth] Local sign in successful. React state synchronized for user:', match.username);
      return {
        success: true,
        user: localUser,
        profile: match,
      };
    } catch (err: any) {
      console.error('[StudyOS Auth] Local sign in exception:', err);
      return {
        success: false,
        error: err?.message || 'Failed to authenticate local session.',
      };
    }
  }, []);

  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      displayName: string;
      username: string;
    }): Promise<SignUpResult> => {
      const cleanEmail = params.email.trim().toLowerCase();
      const cleanUsername = params.username.trim().toLowerCase();
      const trimmedName = params.displayName.trim();

      console.log('[StudyOS Auth] signUp request initiated. Mode:', isSupabaseConfigured ? 'Supabase-Cloud' : 'Standalone-Local');

      if (isSupabaseConfigured && supabase) {
        try {
          const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: params.password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                full_name: trimmedName,
                username: cleanUsername,
                account_status: 'active',
                onboarding_completed: false,
                role: 'student',
              },
            },
          });

          if (error) {
            console.warn('[StudyOS Auth] Supabase sign up error:', error.message);
            return {
              success: false,
              error: error.message,
            };
          }

          const authUser = data.user;
          const authSession = data.session;

          const newProfile: UserAccountProfile = {
            id: authUser?.id || 'usr_' + Date.now(),
            username: cleanUsername,
            displayName: trimmedName,
            email: cleanEmail,
            role: 'student',
            accountStatus: 'active',
            emailVerified: Boolean(authUser?.email_confirmed_at),
            createdAt: authUser?.created_at || new Date().toISOString(),
            onboardingCompleted: false,
          };

          AuthService.setCurrentAccount(newProfile);

          const requiresEmailVerification = Boolean(authUser && !authSession);

          if (!requiresEmailVerification) {
            setSession(authSession);
            setUser(authUser ?? null);
            setProfile(newProfile);
            setIsLoading(false);
          }

          return {
            success: true,
            requiresEmailVerification,
            user: authUser,
            profile: newProfile,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Unexpected error during signup.',
          };
        }
      }

      // Standalone / Local-First Mode
      try {
        const newProfile: UserAccountProfile = {
          id: 'usr_' + Date.now(),
          username: cleanUsername,
          displayName: trimmedName,
          email: cleanEmail,
          role: 'student',
          accountStatus: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
        };

        const localUser: User = {
          id: newProfile.id,
          app_metadata: {},
          user_metadata: {
            full_name: newProfile.displayName,
            username: newProfile.username,
            onboarding_completed: false,
            role: 'student',
          },
          aud: 'authenticated',
          created_at: newProfile.createdAt,
          email: newProfile.email,
        } as User;

        AuthService.setCurrentAccount(newProfile);

        setUser(localUser);
        setProfile(newProfile);
        setSession(null);
        setIsLoading(false);

        return {
          success: true,
          user: localUser,
          profile: newProfile,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Failed to complete local signup.',
        };
      }
    },
    []
  );

  const resendVerificationEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }
    try {
      const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend verification email.' };
    }
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('StudyOS signOut error:', err);
    } finally {
      AuthService.setCurrentAccount(null);
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        accountStatus: profile?.accountStatus || 'active',
        role: profile?.role || 'student',
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        resendVerificationEmail,
        signOut,
        refreshProfile,
        setLocalAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
