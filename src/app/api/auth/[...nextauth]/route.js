// gestion_bolsas/src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"; // Importa NextAuth para manejar la autenticación
import GoogleProvider from "next-auth/providers/google"; // Proveedor de autenticación con Google
import { pool } from "@/app/api/lib/db"; // Importa la conexión a la base de datos

export const authOptions = { // Opciones de configuración para NextAuth
  providers: [
    GoogleProvider({ // Configura Google como proveedor de autenticación
      clientId: process.env.GOOGLE_CLIENT_ID, // ID de cliente de Google
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Secreto de cliente de Google
      authorization: {
        params: {
          prompt: "consent", // Solicita consentimiento cada vez
          access_type: "offline", // Permite refresh tokens
          response_type: "code", // Tipo de respuesta OAuth
          include_granted_scopes: false, // No incluye permisos previos
          hd: "", // Permite cualquier dominio de Google
        },
      },
    }),
  ],
  pages: {
    signIn: "/pages/login", // Página personalizada de login
  },
  session: {
    strategy: "jwt", // Usa JWT para las sesiones
  },
  callbacks: { // Callbacks para personalizar el flujo de autenticación
    async signIn({ user }) { // Se ejecuta al iniciar sesión
      try {
        const [rows] = await pool.query(
          "SELECT * FROM USUARIO WHERE email = ?",
          [user.email]
        ); // Busca el usuario en la base de datos

        if (rows.length === 0) { // Si no existe, no permite el acceso
          console.log("❌ Usuario no autorizado:", user.email);
          return false;
        }
        return true; // Si existe, permite el acceso
      } catch (err) {
        console.error("❌ Error al buscar el usuario:", err); // Error en la consulta
        return false;
      }
    },

    async jwt({ token, user, account, profile }) { // Personaliza el token JWT
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.image = user.image; // Añade la imagen al token
      }

      if (user?.email) {
        try {
          const [rows] = await pool.query(
            "SELECT Id_Usuario, rol, DEPARTAMENTO.Id_Departamento, DEPARTAMENTO.nombre AS departamento FROM USUARIO, DEPARTAMENTO WHERE USUARIO.Id_Departamento = DEPARTAMENTO.Id_Departamento AND email = ?",
            [user.email]
          ); // Obtiene datos adicionales del usuario
          const dbUser = rows[0];
          if (dbUser) {
            token.id = dbUser.Id_Usuario;
            token.role = dbUser.rol;
            token.departamento = dbUser.departamento;
            token.Id_Departamento = dbUser.Id_Departamento;
          }
        } catch (err) {
          console.error("❌ Error al obtener datos del usuario:", err); // Error en la consulta
        }
      }

      return token; // Devuelve el token personalizado
    },

    async session({ session, token }) { // Personaliza la sesión enviada al cliente
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.departamento = token.departamento;
      session.user.Id_Departamento = token.Id_Departamento;
      return session; // Devuelve la sesión personalizada
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secreto para firmar los tokens
};

const handler = NextAuth(authOptions); // Crea el handler de NextAuth con las opciones
export { handler as GET, handler as POST }; // Exporta el handler para los métodos GET y POST
