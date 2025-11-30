"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Settings } from "lucide-react";
import { useState } from "react";
import ConfigPanel from "./ConfigPanel";

export default function Navbar() {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Domovní stránka" },
    { href: "/shopping-lists", label: "Všechny nákupní seznamy" },
  ];

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-white" />
              <Link
                href="/"
                className="text-2xl font-bold hover:text-blue-200 transition-colors"
              >
                Shopping-App
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2 text-blue-100 hover:bg-blue-500 hover:text-white rounded-md transition-colors"
                title="Nastavení"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
}
