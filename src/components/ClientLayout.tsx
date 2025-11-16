"use client";

import Navbar from "./Navbar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
