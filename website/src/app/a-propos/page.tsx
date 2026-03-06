import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Target, Eye, Heart, Users, Award,
  GraduationCap, ArrowRight, MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos - CIMEF Tivaouane',
  description: 'Découvrez le CIMEF, Cabinet d\'Imagerie Médicale et d\'Explorations Fonctionnelles de Tivaouane. Notre histoire, notre mission et notre équipe.',
};

const values = [
  {
    icon: Heart,
    title: 'Bienveillance',
    desc: 'Nous plaçons le patient au cœur de notre démarche avec empathie et respect.',
  },
  {
    icon: Award,
    title: 'Excellence',
    desc: 'Nous visons l\'excellence dans chaque examen et chaque interaction.',
  },
  {
    icon: Users,
    title: 'Accessibilité',
    desc: 'Des soins de qualité accessibles à tous, sans distinction.',
  },
  {
    icon: GraduationCap,
    title: 'Innovation',
    desc: 'Nous investissons dans les technologies les plus récentes pour votre santé.',
  },
];

const team = [
  {
    name: 'Dr. Coumba Gueye',
    role: 'Directrice & Radiologue',
    desc: 'Spécialiste en radiologie et imagerie médicale.',
  },
  {
    name: 'Équipe Médicale',
    role: 'Médecins Spécialistes',
    desc: 'Une équipe pluridisciplinaire de médecins qualifiés dans différentes spécialités.',
  },
  {
    name: 'Équipe Technique',
    role: 'Techniciens & Laborantins',
    desc: 'Des professionnels formés aux dernières techniques d\'imagerie médicale.',
  },
  {
    name: 'Équipe Administrative',
    role: 'Accueil & Gestion',
    desc: 'Un personnel administratif dédié pour un accueil chaleureux et un suivi efficace.',
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-3">À Propos</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Qui sommes-nous ?
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Le CIMEF est un cabinet de référence en imagerie médicale, au service de la
            population de Tivaouane et de toute la région.
          </p>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-2">Notre Histoire</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Un engagement pour la santé au Sénégal
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Le <strong>Cabinet d&apos;Imagerie Médicale et d&apos;Explorations Fonctionnelles (CIMEF)</strong> a
                  été créé avec la vision de fournir des services d&apos;imagerie médicale de qualité
                  à la population de Tivaouane et ses environs.
                </p>
                <p>
                  Depuis notre création, nous n&apos;avons cessé de nous développer et d&apos;investir dans
                  les équipements les plus modernes pour offrir à nos patients des diagnostics
                  précis et fiables.
                </p>
                <p>
                  Notre cabinet ambitionne de devenir une référence dans la région, en collaborant
                  étroitement avec les établissements de santé locaux et régionaux.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#636B2F]/10 to-[#3F4A1F]/5 rounded-3xl p-10 flex items-center justify-center">
              <Image src="/logo.png" alt="CIMEF" width={300} height={300} className="w-64 h-64 lg:w-72 lg:h-72 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#f8f9f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#636B2F]/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#636B2F]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Notre Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                Offrir des services d&apos;imagerie médicale et d&apos;explorations fonctionnelles
                de haute qualité, accessibles à tous, dans un environnement accueillant
                et sécurisé. Nous nous engageons à fournir des résultats précis et rapides
                pour accompagner les professionnels de santé dans leur diagnostic.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#636B2F]/10 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-[#636B2F]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Notre Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                Devenir le cabinet d&apos;imagerie médicale de référence au Sénégal, reconnu
                pour l&apos;excellence de ses services, la modernité de ses équipements et
                la compétence de son équipe. Nous aspirons à contribuer activement à
                l&apos;amélioration de la santé publique dans notre communauté.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-2">Nos Valeurs</p>
            <h2 className="text-3xl font-bold text-gray-900">
              Ce qui nous guide au quotidien
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-[#636B2F]/20 transition-all">
                <div className="w-14 h-14 bg-[#636B2F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-[#636B2F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-20 bg-[#f8f9f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-2">Notre Équipe</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Des professionnels à votre service
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Notre équipe pluridisciplinaire est composée de médecins spécialistes, de
              techniciens qualifiés et d&apos;un personnel administratif dévoué.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#636B2F] text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#3F4A1F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Faites confiance à notre expertise
          </h2>
          <p className="text-white/70 mb-8">
            Contactez-nous dès maintenant pour vos examens médicaux.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#3F4A1F] px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            Nous Contacter <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
