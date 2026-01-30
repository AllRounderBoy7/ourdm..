import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyevygppwrhadxegqqvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZXZ5Z3Bwd3JoYWR4ZWdxcXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTY5MTcsImV4cCI6MjA4NTE5MjkxN30.-YBncgAj_2qOLJDaWI11NPpGAr2bwvEmo8bgB0WgKaQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google OAuth sign in
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Listen to auth changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};
