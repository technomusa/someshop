import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePOSStore } from "@/lib/store";

/**
 * Hook to sync NextAuth session with POS store
 * Initializes currentUser from session when session is loaded
 */
export function useSyncSessionWithStore() {
  const { data: session, status } = useSession();
  const { initializeUserFromSession } = usePOSStore();

  useEffect(() => {
    if (status === "authenticated" && session) {
      initializeUserFromSession(session);
    }
  }, [session, status, initializeUserFromSession]);

  return { session, status };
}
