// gestion_bolsas/src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { pool } from "@/app/api/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          include_granted_scopes: false,
          hd: "",
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
    async signIn({ user }) {
      try {
        const [rows] = await pool.query(
          "SELECT * FROM USUARIO WHERE email = ?",
          [user.email]
        );

        if (rows.length === 0) {
          console.log("❌ Usuario no autorizado:", user.email);
          return false;
        }
        return true;
      } catch (err) {
        console.error("❌ Error al buscar el usuario:", err);
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.image = user.image; // ✅ Aquí copiamos la imagen
      }

      if (user?.email) {
        try {
          const [rows] = await pool.query(
            "SELECT Id_Usuario, rol, DEPARTAMENTO.Id_Departamento, DEPARTAMENTO.nombre AS departamento FROM USUARIO, DEPARTAMENTO WHERE USUARIO.Id_Departamento = DEPARTAMENTO.Id_Departamento AND email = ?",
            [user.email]
          );
          const dbUser = rows[0];
          if (dbUser) {
            token.id = dbUser.Id_Usuario;
            token.role = dbUser.rol;
            token.departamento = dbUser.departamento;
            token.Id_Departamento = dbUser.Id_Departamento;
          }
        } catch (err) {
          console.error("❌ Error al obtener datos del usuario:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.departamento = token.departamento;
      session.user.Id_Departamento = token.Id_Departamento;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
