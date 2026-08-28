import { signOut } from "next-auth/react";

export const handleLogout = async (router) => {
  try {
    // Call backend logout endpoint
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    await fetch(`${apiBaseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {
      // Logout endpoint might fail, but we continue with NextAuth signOut
    });
  } catch (e) {
    console.warn("Backend logout failed:", e);
  }

  // Sign out from NextAuth (clears session)
  await signOut({ redirect: false });

  // Redirect to login
  router.push("/");
};

export const getAuthToken = async () => {
  // This is now handled by api-client.js using getSession()
  // Kept here for reference if needed elsewhere
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return session?.accessToken;
};
