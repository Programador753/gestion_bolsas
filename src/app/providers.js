"use client";

import { SessionProvider, useSession } from "next-auth/react";
import Header from "./components/Header/header";
import Footer from "./components/Footer/footer";

function AuthLayout({ children }) {
  const { status } = useSession();

  const isAuthenticated = status === "authenticated";

  return (
    <>
      {isAuthenticated && <Header />}
      <main>{children}</main>
      {isAuthenticated && <Footer />}
    </>
  );
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthLayout>{children}</AuthLayout>
    </SessionProvider>
  );
}
