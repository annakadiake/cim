import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  HeartPulse, Activity, Waves,
  Baby, ArrowRight, Phone, CheckCircle2,
  Zap, Heart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nos Services - CIMEF Tivaouane',
  description: 'Découvrez les services du CIMEF : échographie, échodoppler, radiographie, ECG, explorations fonctionnelles, MAPA, HSG et UCR.',
};

const services = [
  {
    icon: null,
    title: 'Échographie',
    desc: 'Examens échographiques complets avec des appareils de dernière génération pour un diagnostic précis et fiable.',
    details: [
      'Échographie abdominale',
      'Échographie abdomino-pelvienne',
      'Échographie pelvienne',
      'Échographie mammaire',
      'Échographie contenu scrotal',
      'Échographie thyroïde / cervicale',
      'Échographie appareil urinaire',
      'Échographie obstétricale',
      'Échographie parties molles / Tuméfaction / Masse',
      'Échographie auriculaire',
      'Échographie trans-fontanelle',
      'Échographie cardiaque',
    ],
  },
  {
    icon: Waves,
    title: 'Échodoppler',
    desc: 'Exploration vasculaire par échodoppler pour évaluer la circulation sanguine artérielle et veineuse.',
    details: [
      'Échodoppler aorte / des artères rénales',
      'Échodoppler des bourses',
      'Échodoppler artério-veineux des membres inférieurs / supérieurs',
      'Échodoppler artériel des membres inférieurs / supérieurs',
      'Échodoppler veineux des membres inférieurs / supérieurs',
      'Échodoppler artériel des troncs supra aortiques',
    ],
  },
  {
    icon: Activity,
    title: 'Électrocardiogramme (ECG)',
    desc: 'Enregistrement de l\'activité électrique du cœur pour détecter les troubles du rythme et les anomalies cardiaques.',
    details: [
      'ECG de repos standard',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Radiographie Standard',
    desc: 'Radiographies numériques pour un diagnostic rapide et précis de l\'ensemble du corps.',
    details: [
      'Radiographie standard (toutes régions anatomiques)',
    ],
  },
  {
    icon: Baby,
    title: 'HSG & UCR',
    desc: 'Examens radiologiques spécialisés pour l\'exploration de l\'appareil génital et urinaire.',
    details: [
      'Hystérosalpingographie (HSG)',
      'Urétro-cystographie rétrograde (UCR)',
    ],
  },
  {
    icon: Zap,
    title: 'Explorations Fonctionnelles',
    desc: 'Examens fonctionnels pour évaluer le fonctionnement de vos organes et systèmes.',
    details: [
      'Explorations fonctionnelles diverses',
    ],
  },
  {
    icon: Heart,
    title: 'MAPA',
    desc: 'Mesure Ambulatoire de la Pression Artérielle sur 24h pour un suivi précis de votre tension.',
    details: [
      'Mesure Ambulatoire de la Pression Artérielle (MAPA)',
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-3">Nos Services</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Services d&apos;Imagerie Médicale
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Le CIMEF met à votre disposition une gamme complète d&apos;examens médicaux
            réalisés par des professionnels qualifiés avec des équipements modernes.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex-row`}
            >
              <div className="md:w-1/3 bg-gradient-to-br from-[#636B2F]/5 to-[#3F4A1F]/10 p-8 flex flex-col justify-center items-center text-center">
                {service.icon === null ? (
                  <Image src="/echo.jpeg" alt="Échographie" width={120} height={120} className="w-32 h-32 rounded-2xl object-cover mb-4 shadow-lg" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
              </div>
              <div className="md:w-2/3 p-8">
                <p className="text-gray-600 mb-5 leading-relaxed">{service.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#636B2F] shrink-0" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#3F4A1F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d&apos;un examen ?
          </h2>
          <p className="text-white/70 mb-8">
            Contactez-nous pour obtenir plus d&apos;informations sur nos services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-[#3F4A1F] px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
            >
              Nous Contacter <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+221773002697"
              className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Phone className="w-5 h-5" /> Appeler
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
