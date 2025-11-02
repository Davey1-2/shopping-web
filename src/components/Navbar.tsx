"use client";

import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold">Shopping Lists</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
