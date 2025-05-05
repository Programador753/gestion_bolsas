"use client";

import { SessionProvider } from "next-auth/react";
import Header from "./components/Header/header";
import Footer from "./components/Footer/footer";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </SessionProvider>
  );
}
