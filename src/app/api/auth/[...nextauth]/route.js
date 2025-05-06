// gestion_bolsas/src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",                   // Fuerza que pregunte cada vez
          access_type: "offline",              // Para obtener refresh token
          response_type: "code",               // Flujo estándar de OAuth
          include_granted_scopes: false,       // Previene la selección automática
          hd: "",                              // No limitar a un dominio
        },
      },
    }),
  ],
  pages: {
    signIn: "/pages/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.access_token) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
