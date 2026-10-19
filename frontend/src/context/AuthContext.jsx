import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) fetchRole(session.user.id);
        if (!session) setRole(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch role from users table
  const fetchRole = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data) setRole(data.role);
  };

  // SIGN UP
  const signUp = async (email, password, userRole) => {
    try {
      // 1️⃣ Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) return { success: false, error: authError };

      const userId = authData.user.id;

      // 2️⃣ Insert into users table
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ id: userId, email, role: userRole }]);

      if (insertError) return { success: false, error: insertError };

      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // SIGN IN
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error };

      // Fetch role
      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (roleError) return { success: false, error: roleError };

      setSession(data.session || data); // update session
      setRole(userData.role);

      return { success: true, role: userData.role };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // SIGN OUT
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, setSession, role, setRole, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);