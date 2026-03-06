import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a2008] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="CIMEF Logo" width={40} height={40} className="w-10 h-10 rounded-xl object-contain" />
              <span className="text-xl font-bold text-white">CIMEF</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Cabinet d&apos;Imagerie Médicale et d&apos;Explorations Fonctionnelles de Tivaouane.
              Un service de santé de qualité au cœur du Sénégal.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Navigation</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/services', label: 'Nos Services' },
                { href: '/a-propos', label: 'À Propos' },
                { href: '/contact', label: 'Nous Contacter' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#c8d96f] transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Nos Services</h3>
            <ul className="space-y-3 text-sm">
              <li>Échographie</li>
              <li>Échodoppler</li>
              <li>Radiographie Standard</li>
              <li>Électrocardiogramme</li>
              <li>HSG & UCR</li>
              <li>MAPA</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-[#c8d96f] shrink-0" />
                <span>Tivaouane, Sénégal</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-[#c8d96f] shrink-0" />
                <div>
                  <a href="tel:+221773002697" className="hover:text-[#c8d96f] transition block">+221 77 300 26 97</a>
                  <a href="tel:+221766555556" className="hover:text-[#c8d96f] transition block">+221 76 655 55 56</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-[#c8d96f] shrink-0" />
                <a href="mailto:cimeftivaouane@gmail.com" className="hover:text-[#c8d96f] transition">
                  cimeftivaouane@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-[#c8d96f] shrink-0" />
                <div>
                  <p>Ouvert 24h/24 - 7j/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} CIMEF Tivaouane. Tous droits réservés.</p>
          <p>Cabinet d&apos;Imagerie Médicale et d&apos;Explorations Fonctionnelles</p>
        </div>
      </div>
    </footer>
  );
}
