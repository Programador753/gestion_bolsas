import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/pages/login", // Ruta personalizada
  },
  session: {
    strategy: "jwt",
  },
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id; // Almacena el ID del usuario en el token
        }
        return token;
        },
        async session({ session, token }) {
        session.user.id = token.id; // Agrega el ID del usuario a la sesión
        return session;
        },
    },
});

// ✅ Exportar como funciones nombradas
export { handler as GET, handler as POST };
