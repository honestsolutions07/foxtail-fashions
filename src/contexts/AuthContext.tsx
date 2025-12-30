'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Create profile for new users (non-blocking)
                if (event === 'SIGNED_IN' && session?.user) {
                    ensureProfileExists(session.user);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Function to ensure user profile exists in profiles table
    const ensureProfileExists = async (user: User) => {
        try {
            // Check if profile already exists using select without .single() to avoid throwing
            const { data: profiles, error: selectError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id);

            // If no profile exists (empty array), create one
            if (!selectError && (!profiles || profiles.length === 0)) {
                const { error } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        fox_coins: 0,
                        updated_at: new Date().toISOString(),
                    });

                if (error && error.code !== '23505') { // Ignore duplicate key errors
                    console.error('Error creating profile:', error);
                } else {
                    console.log('Profile created for user:', user.email);
                }
            }
        } catch (error) {
            // Profile might already exist (race condition), that's okay
            console.log('Profile check/creation:', error);
        }
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
