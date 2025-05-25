import { getToken } from "next-auth/jwt"; // Importa función para obtener el token JWT de NextAuth
import { NextResponse } from "next/server"; // Importa objeto para crear respuestas en middlewares

const secret = process.env.NEXTAUTH_SECRET; // Obtiene el secreto de NextAuth de las variables de entorno

export default async function middleware(req) { // Middleware principal que intercepta las peticiones
  const token = await getToken({ req, secret, raw: true }); // Obtiene el token JWT de la petición
  const { pathname } = req.nextUrl; // Extrae el pathname de la URL solicitada

  // Logs para depuración
  console.log("Token:", token);
  console.log("Pathname:", pathname);

  // Excluir las rutas de NextAuth, login, y archivos estáticos
  const isAuthRoute = pathname.startsWith("/api/auth"); // Rutas de autenticación NextAuth
  const isLoginPage = pathname === "/pages/login"; // Ruta de login
  const isStaticFile = pathname.startsWith("/_next/"); // Archivos estáticos
  const isApiRoute = pathname.startsWith("/api/"); // Rutas de API
   const isPublicImage = pathname.startsWith("/logoSalesianosWeb.png") || pathname.startsWith("/images/"); // Imágenes públicas

  // Si no hay token y no estás en las rutas de autenticación, login, archivos estáticos o API, redirige a login
  if (!token && !isAuthRoute && !isLoginPage && !isStaticFile && !isApiRoute && !isPublicImage) {
    console.log("Redirigiendo a /pages/login porque no hay token");
    return NextResponse.redirect(new URL("/pages/login", req.url)); // Redirige a login
  }

  // Si ya estás autenticado y vas a /pages/login, redirige a la página principal
  if (token && isLoginPage) {
    console.log("Redirigiendo a la página principal porque ya estás autenticado");
    return NextResponse.redirect(new URL("/", req.url)); // Redirige a la home
  }

  // Si ninguna de las condiciones anteriores se cumple, pasa la solicitud
  return NextResponse.next(); // Permite continuar con la petición
}

export const config = {
  matcher: ["/((?!api/auth|/pages/login|/_next).*)"], // Excluye /api/auth, /pages/login y recursos estáticos
};
