// gestion_bolsas/src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { pool } from '@/app/api/lib/db';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent", // Para que necesite consentimiento cada vez
          access_type: "offline", // Para obtener un refresh token  
          response_type: "code", // Para obtener un código de autorización
          include_granted_scopes: false, // Para no incluir los scopes ya concedidos (scopes es la información que se solicita al usuario)
          hd: "", // Para restringir el acceso a un dominio específico (ejemplo: salesianos.edu)
        },
      },
    }),
  ],
  pages: {
    signIn: "/pages/login", // Ruta personalizada para la página de inicio de sesión
  },
  session: {
    strategy: "jwt", // Usar JWT para la sesión
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
          return false; // ❌ Deniega acceso
        }
        return true; // ✅ Usuario autorizado
      } catch (err) {
        console.error("❌ Error al buscar el usuario:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const [rows] = await pool.query(
            "SELECT Id_Usuario, rol FROM USUARIO WHERE email = ?",
            [user.email]
          );
          // Si el usuario existe en la base de datos, asigna su ID y rol al token 
          const dbUser = rows[0];
          if (dbUser) {
            token.id = dbUser.Id_Usuario; 
            token.role = dbUser.rol; // Puede ser 'Administrador', 'Contable', 'Jefe_Departamento'.
          }
        } catch (err) {
          console.error("❌ Error al obtener datos del usuario:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id; // Asigna el ID del usuario al objeto de sesión
      session.user.role = token.role; // Asigna el rol del usuario al objeto de sesión
      session.user.email = token.email; // Asigna el email del usuario al objeto de sesión
      session.user.name = token.name; // Asigna el nombre del usuario al objeto de sesión
      session.user.image = token.image; // Asigna la imagen del usuario al objeto de sesión
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Clave secreta para firmar el JWT
});

export { handler as GET, handler as POST }; // Exporta el handler para las rutas GET y POST