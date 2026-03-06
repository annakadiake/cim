'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/a-propos', label: 'À Propos' },
  
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main navbar */}
      <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <Image src="/logo.png" alt="CIMEF" width={112} height={112} className="w-24 h-24 md:w-28 md:h-28 object-contain" />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[#3F4A1F] font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#636B2F] transition-all group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/contact"
                className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-[#636B2F]/25 transition-all"
              >
                Nous Contacter
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-gray-700 hover:text-[#3F4A1F] hover:bg-[#636B2F]/5 rounded-lg font-medium transition"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block text-center bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white px-5 py-3 rounded-lg font-medium mt-3"
              onClick={() => setIsOpen(false)}
            >
              Nous Contacter
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
