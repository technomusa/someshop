import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001/api"}/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                device_name: "POS_Web_Client",
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
          }

          const data = await response.json();
          const loginData = data.data || data;

          if (!loginData.token) {
            throw new Error("No token received from server");
          }

          // Return user object with token
          return {
            id: loginData.user.id.toString(),
            email: loginData.user.email,
            name: loginData.user.name,
            token: loginData.token,
            user: loginData.user,
            currentShop: loginData.current_shop,
            accessibleShops: loginData.accessible_shops,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authorization failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.user = user.user;
        token.currentShop = user.currentShop;
        token.accessibleShops = user.accessibleShops;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.currentShop = token.currentShop;
      session.accessibleShops = token.accessibleShops;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production",
});

export { handler as GET, handler as POST };
