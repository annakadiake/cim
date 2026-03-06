import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - CIMEF Tivaouane',
  description: 'Actualités et articles de santé du CIMEF Tivaouane. Conseils médicaux, prévention et informations sur nos services.',
};

const articles = [
  {
    slug: 'importance-echographie-prenatale',
    title: 'L\'importance de l\'échographie prénatale',
    excerpt: 'L\'échographie prénatale est un examen essentiel pour suivre le développement du bébé et détecter d\'éventuelles anomalies. Découvrez pourquoi cet examen est indispensable.',
    category: 'Prévention',
    date: '15 Février 2026',
    readTime: '5 min',
    author: 'Équipe CIMEF',
  },
  {
    slug: 'quand-faire-un-bilan-de-sante',
    title: 'Quand faut-il faire un bilan de santé complet ?',
    excerpt: 'Un bilan de santé régulier permet de détecter précocement les maladies et d\'adapter votre mode de vie. Voici les recommandations selon votre âge.',
    category: 'Santé',
    date: '8 Février 2026',
    readTime: '4 min',
    author: 'Équipe CIMEF',
  },
  {
    slug: 'comprendre-votre-electrocardiogramme',
    title: 'Comprendre votre électrocardiogramme (ECG)',
    excerpt: 'L\'ECG est un examen simple et indolore qui enregistre l\'activité électrique du cœur. Apprenez à comprendre cet examen et ses résultats.',
    category: 'Cardiologie',
    date: '1 Février 2026',
    readTime: '6 min',
    author: 'Équipe CIMEF',
  },
  {
    slug: 'radiographie-ce-quil-faut-savoir',
    title: 'Radiographie : ce qu\'il faut savoir avant votre examen',
    excerpt: 'La radiographie utilise les rayons X pour visualiser l\'intérieur du corps. Voici comment vous préparer et à quoi vous attendre lors de votre examen.',
    category: 'Imagerie',
    date: '25 Janvier 2026',
    readTime: '4 min',
    author: 'Équipe CIMEF',
  },
  {
    slug: 'prevention-maladies-cardiovasculaires',
    title: 'Prévention des maladies cardiovasculaires au Sénégal',
    excerpt: 'Les maladies cardiovasculaires sont en augmentation en Afrique. Découvrez les facteurs de risque et les mesures de prévention essentielles.',
    category: 'Prévention',
    date: '18 Janvier 2026',
    readTime: '7 min',
    author: 'Équipe CIMEF',
  },
  {
    slug: 'analyses-biologiques-guide-complet',
    title: 'Guide complet des analyses biologiques courantes',
    excerpt: 'NFS, glycémie, cholestérol, créatinine... Découvrez les analyses de sang les plus courantes et ce qu\'elles révèlent sur votre santé.',
    category: 'Analyses',
    date: '10 Janvier 2026',
    readTime: '8 min',
    author: 'Équipe CIMEF',
  },
];

const categories = ['Tous', 'Prévention', 'Santé', 'Cardiologie', 'Imagerie', 'Analyses'];

export default function BlogPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-3">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Actualités & Santé
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Articles, conseils et actualités pour mieux comprendre votre santé
            et nos services d&apos;imagerie médicale.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  cat === 'Tous'
                    ? 'bg-[#636B2F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-[#636B2F]/10 hover:text-[#3F4A1F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured article */}
          <Link href={`/blog/${articles[0].slug}`} className="block group mb-12">
            <div className="grid md:grid-cols-2 gap-8 bg-[#f8f9f0] rounded-3xl overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-br from-[#636B2F]/20 to-[#3F4A1F]/10 min-h-[280px] flex items-center justify-center">
                <div className="w-20 h-20 bg-[#636B2F]/20 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#3F4A1F]">C</span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#636B2F] text-white text-xs px-3 py-1 rounded-full font-medium">
                    {articles[0].category}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {articles[0].readTime}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#3F4A1F] transition">
                  {articles[0].title}
                </h2>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {articles[0].author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {articles[0].date}</span>
                  </div>
                  <span className="text-[#636B2F] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all text-sm">
                    Lire <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Other articles grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#636B2F]/20 transition-all"
              >
                <div className="bg-gradient-to-br from-[#636B2F]/10 to-[#3F4A1F]/5 h-40 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#636B2F]/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-[#3F4A1F]">C</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#636B2F]/10 text-[#3F4A1F] text-xs px-2.5 py-1 rounded-full font-medium">
                      {article.category}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#3F4A1F] transition leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                    <span className="text-[#636B2F] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
