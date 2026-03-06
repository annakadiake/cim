import Link from 'next/link';
import Image from 'next/image';
import {
  Scan, Activity, Waves,
  Heart, Zap, Baby, Clock, Users, Award,
  Shield, ArrowRight, Phone, CheckCircle2,
} from 'lucide-react';

const services = [
  {
    icon: Scan,
    title: 'Échographie',
    desc: 'Échographies abdominale, pelvienne, obstétricale, mammaire, cardiaque, thyroïdienne et bien plus.',
  },
  {
    icon: Waves,
    title: 'Échodoppler',
    desc: 'Exploration vasculaire artérielle et veineuse des membres, de l\'aorte et des troncs supra aortiques.',
  },
  {
    icon: Activity,
    title: 'Électrocardiogramme',
    desc: 'ECG pour l\'évaluation complète de votre activité cardiaque.',
  },
  {
    icon: Scan,
    title: 'Radiographie Standard',
    desc: 'Radiographies numériques pour un diagnostic rapide et précis.',
  },
  {
    icon: Baby,
    title: 'HSG & UCR',
    desc: 'Hystérosalpingographie et urétro-cystographie rétrograde.',
  },
  {
    icon: Heart,
    title: 'MAPA',
    desc: 'Mesure Ambulatoire de la Pression Artérielle sur 24h.',
  },
];


export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#636B2F] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F4A1F] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#636B2F]/10 text-[#3F4A1F] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Cabinet d&apos;Imagerie Médicale de Tivaouane
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Votre santé,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#636B2F] to-[#3F4A1F]">
                  notre priorité
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Le CIMEF vous offre des services d&apos;imagerie médicale de pointe dans un
                environnement moderne et accueillant, avec une équipe de professionnels dévoués.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#636B2F]/25 transition-all flex items-center gap-2"
                >
                  Nous Contacter
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+221773002697"
                  className="border-2 border-[#636B2F] text-[#3F4A1F] px-8 py-4 rounded-xl font-semibold hover:bg-[#636B2F]/5 transition-all flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="w-full aspect-square max-w-lg mx-auto bg-gradient-to-br from-[#636B2F]/20 to-[#3F4A1F]/10 rounded-3xl flex items-center justify-center">
                <Image src="/logo.png" alt="CIMEF" width={300} height={300} className="w-64 h-64 lg:w-72 lg:h-72 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-2">Nos Services</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des examens médicaux complets
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Nous mettons à votre disposition une gamme complète d&apos;examens d&apos;imagerie médicale
              et d&apos;explorations fonctionnelles.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#636B2F]/30 hover:shadow-lg hover:shadow-[#636B2F]/5 transition-all bg-white"
              >
                <div className="w-12 h-12 bg-[#636B2F]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#636B2F] group-hover:text-white transition-all">
                  <service.icon className="w-6 h-6 text-[#636B2F] group-hover:text-white transition-all" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-[#3F4A1F] font-semibold hover:gap-3 transition-all"
            >
              Voir tous nos services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why CIMEF */}
      <section className="py-20 bg-[#f8f9f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-2">Pourquoi nous choisir</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Un cabinet médical de confiance
              </h2>
              <div className="space-y-5">
                {[
                  { title: 'Équipements modernes', desc: 'Appareils d\'imagerie de dernière génération pour des résultats précis.' },
                  { title: 'Équipe qualifiée', desc: 'Médecins spécialistes et techniciens expérimentés à votre service.' },
                  { title: 'Résultats rapides', desc: 'Délais de rendu optimisés pour un suivi médical efficace.' },
                  { title: 'Tarifs accessibles', desc: 'Des soins de qualité à des prix adaptés à tous les budgets.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#636B2F] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: Clock, label: 'Disponibilité', value: '24h/7j' },
                  { icon: Users, label: 'Équipe', value: 'Qualifiée' },
                  { icon: Award, label: 'Équipements', value: 'Modernes' },
                  { icon: Shield, label: 'Sécurité', value: '100%' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="w-12 h-12 bg-[#636B2F]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-[#636B2F]" />
                    </div>
                    <p className="text-2xl font-bold text-[#3F4A1F]">{item.value}</p>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prenez soin de votre santé dès aujourd&apos;hui
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            N&apos;attendez pas pour consulter. Notre équipe est à votre disposition pour vous
            accompagner dans votre parcours de santé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-[#3F4A1F] px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
            >
              Nous Contacter
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+221773002697"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              +221 77 300 26 97
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
