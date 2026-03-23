import { useEffect, useState, createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export function useSession() {
  return useContext(SessionContext);
}

export function useSessionProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const MIN_SPLASH_MS = 2000;
    const start = Date.now();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => {
        setSession(session);
        setIsLoading(false);
      }, remaining);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isLoading };
}
