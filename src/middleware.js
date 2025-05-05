import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export default async function middleware(req) {
  const token = await getToken({ req, secret, raw: true });
  const { pathname } = req.nextUrl;

  // Excluir las rutas de NextAuth del middleware
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (!token && !isAuthRoute && pathname.startsWith("/pages/rutas/")) {
    return NextResponse.redirect(new URL("/pages/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|login).*)"],
};
