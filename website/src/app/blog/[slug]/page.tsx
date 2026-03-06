import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

const articles: Record<string, {
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  content: string[];
}> = {
  'importance-echographie-prenatale': {
    title: 'L\'importance de l\'échographie prénatale',
    category: 'Prévention',
    date: '15 Février 2026',
    readTime: '5 min',
    author: 'Équipe CIMEF',
    content: [
      'L\'échographie prénatale est l\'un des examens les plus importants pendant la grossesse. Elle permet de suivre le développement du bébé, de détecter d\'éventuelles anomalies et de rassurer les futurs parents.',
      'Au cours d\'une grossesse normale, au moins trois échographies sont recommandées : une au premier trimestre (entre 11 et 14 semaines), une au deuxième trimestre (entre 20 et 24 semaines, appelée échographie morphologique) et une au troisième trimestre (entre 30 et 34 semaines).',
      'L\'échographie du premier trimestre permet de confirmer la grossesse, de dater la conception, de vérifier le nombre d\'embryons et de mesurer la clarté nucale, un marqueur important pour le dépistage de certaines anomalies chromosomiques.',
      'L\'échographie morphologique du deuxième trimestre est l\'examen le plus complet. Elle permet d\'examiner en détail tous les organes du bébé : le cerveau, le cœur, les poumons, les reins, le système digestif, les membres et la colonne vertébrale. C\'est souvent lors de cette échographie que les parents peuvent connaître le sexe du bébé.',
      'L\'échographie du troisième trimestre permet de vérifier la croissance du bébé, sa position dans l\'utérus et la quantité de liquide amniotique. Elle aide à préparer l\'accouchement.',
      'Au CIMEF de Tivaouane, nous disposons d\'équipements d\'échographie de dernière génération qui nous permettent de réaliser des examens précis et détaillés. Notre équipe de médecins spécialistes accompagne chaque future maman avec professionnalisme et bienveillance.',
      'N\'hésitez pas à nous contacter pour votre suivi échographique prénatal. Votre santé et celle de votre bébé sont notre priorité.',
    ],
  },
  'quand-faire-un-bilan-de-sante': {
    title: 'Quand faut-il faire un bilan de santé complet ?',
    category: 'Santé',
    date: '8 Février 2026',
    readTime: '4 min',
    author: 'Équipe CIMEF',
    content: [
      'Un bilan de santé régulier est essentiel pour maintenir une bonne santé et détecter précocement d\'éventuels problèmes. Mais à quelle fréquence faut-il le faire et quels examens sont recommandés ?',
      'Pour les adultes en bonne santé, un bilan de santé complet est recommandé tous les 2 à 3 ans avant 50 ans, puis chaque année après 50 ans. Cependant, en cas de facteurs de risque (antécédents familiaux, tabagisme, surpoids, diabète, hypertension), un suivi plus rapproché peut être nécessaire.',
      'Un bilan de santé standard comprend généralement : un examen clinique complet, des analyses de sang (NFS, glycémie, cholestérol, créatinine, bilan hépatique), un électrocardiogramme, une mesure de la tension artérielle et une analyse d\'urine.',
      'Pour les femmes, des examens complémentaires peuvent être recommandés : mammographie à partir de 50 ans, frottis cervical tous les 3 ans, échographie pelvienne.',
      'Pour les hommes, un dosage du PSA peut être proposé à partir de 50 ans pour le dépistage du cancer de la prostate.',
      'Au CIMEF, nous proposons des forfaits de bilans de santé adaptés à votre âge et à vos besoins. Notre équipe vous accompagne pour interpréter vos résultats et vous conseiller.',
    ],
  },
  'comprendre-votre-electrocardiogramme': {
    title: 'Comprendre votre électrocardiogramme (ECG)',
    category: 'Cardiologie',
    date: '1 Février 2026',
    readTime: '6 min',
    author: 'Équipe CIMEF',
    content: [
      'L\'électrocardiogramme (ECG) est un examen simple, rapide et totalement indolore qui permet d\'enregistrer l\'activité électrique du cœur. C\'est l\'un des examens les plus couramment réalisés en médecine.',
      'L\'ECG permet de détecter de nombreuses anomalies cardiaques : troubles du rythme (arythmies), anomalies de conduction, signes d\'infarctus du myocarde, hypertrophie des cavités cardiaques, et certaines anomalies congénitales.',
      'L\'examen dure environ 5 à 10 minutes. Le patient est allongé sur le dos, et des électrodes sont placées sur la poitrine, les bras et les jambes. Ces électrodes enregistrent les signaux électriques du cœur et les transmettent à un appareil qui les imprime sous forme de tracé.',
      'Le tracé ECG est composé de différentes ondes (P, QRS, T) qui correspondent aux différentes phases de l\'activité cardiaque. L\'onde P représente la contraction des oreillettes, le complexe QRS la contraction des ventricules, et l\'onde T la phase de récupération.',
      'Aucune préparation particulière n\'est nécessaire avant un ECG. Il est simplement recommandé de ne pas appliquer de crème sur la poitrine et de porter des vêtements faciles à retirer.',
      'Au CIMEF, nos ECG sont interprétés par des médecins spécialistes qui vous expliqueront vos résultats en détail.',
    ],
  },
  'radiographie-ce-quil-faut-savoir': {
    title: 'Radiographie : ce qu\'il faut savoir avant votre examen',
    category: 'Imagerie',
    date: '25 Janvier 2026',
    readTime: '4 min',
    author: 'Équipe CIMEF',
    content: [
      'La radiographie est l\'un des examens d\'imagerie médicale les plus anciens et les plus utilisés. Elle utilise les rayons X pour visualiser les structures internes du corps, notamment les os, les poumons et certains organes.',
      'L\'examen est rapide (quelques secondes à quelques minutes) et totalement indolore. Le patient se positionne devant l\'appareil, et le technicien prend les clichés nécessaires selon la zone à examiner.',
      'Avant une radiographie, il est important de signaler si vous êtes enceinte ou si vous pensez l\'être, car les rayons X peuvent être nocifs pour le fœtus. Il faut également retirer les bijoux et objets métalliques de la zone à radiographier.',
      'Les doses de rayons X utilisées en radiographie standard sont très faibles et ne présentent pas de risque significatif pour la santé. Cependant, le principe de précaution est toujours appliqué, et l\'examen n\'est prescrit que lorsqu\'il est médicalement justifié.',
      'Au CIMEF, nous utilisons des appareils de radiographie numérique qui permettent d\'obtenir des images de haute qualité avec des doses de rayons X réduites. Nos résultats sont disponibles rapidement.',
    ],
  },
  'prevention-maladies-cardiovasculaires': {
    title: 'Prévention des maladies cardiovasculaires au Sénégal',
    category: 'Prévention',
    date: '18 Janvier 2026',
    readTime: '7 min',
    author: 'Équipe CIMEF',
    content: [
      'Les maladies cardiovasculaires sont en constante augmentation en Afrique, y compris au Sénégal. Elles représentent une cause importante de mortalité et de morbidité. La prévention est donc essentielle.',
      'Les principaux facteurs de risque sont : l\'hypertension artérielle, le diabète, l\'excès de cholestérol, le tabagisme, la sédentarité, l\'obésité et le stress. La consommation excessive de sel et d\'aliments gras est également un facteur aggravant.',
      'Pour prévenir les maladies cardiovasculaires, il est recommandé de : adopter une alimentation équilibrée riche en fruits, légumes et céréales complètes ; pratiquer une activité physique régulière (au moins 30 minutes par jour) ; ne pas fumer ; limiter la consommation d\'alcool ; gérer son stress.',
      'Un suivi médical régulier est indispensable. Il est recommandé de faire contrôler sa tension artérielle, sa glycémie et son taux de cholestérol au moins une fois par an à partir de 40 ans.',
      'Les signes d\'alerte à ne pas ignorer : douleur thoracique, essoufflement inhabituel, palpitations, vertiges, douleur dans le bras gauche ou la mâchoire. En cas de symptômes, consultez immédiatement.',
      'Au CIMEF, nous proposons des bilans cardiovasculaires complets comprenant ECG, échographie cardiaque et analyses sanguines. N\'hésitez pas à nous consulter pour un dépistage.',
    ],
  },
  'analyses-biologiques-guide-complet': {
    title: 'Guide complet des analyses biologiques courantes',
    category: 'Analyses',
    date: '10 Janvier 2026',
    readTime: '8 min',
    author: 'Équipe CIMEF',
    content: [
      'Les analyses biologiques sont des examens de laboratoire réalisés à partir d\'échantillons de sang, d\'urine ou d\'autres liquides biologiques. Elles sont essentielles pour le diagnostic, le suivi et la prévention de nombreuses maladies.',
      'La Numération Formule Sanguine (NFS) est l\'analyse de sang la plus courante. Elle permet de compter les globules rouges, les globules blancs et les plaquettes, et de détecter des anomalies comme l\'anémie, les infections ou les troubles de la coagulation.',
      'La glycémie mesure le taux de sucre dans le sang. Elle est essentielle pour le dépistage et le suivi du diabète. Une glycémie à jeun normale est inférieure à 1,10 g/L.',
      'Le bilan lipidique mesure les taux de cholestérol total, de LDL-cholestérol (le "mauvais"), de HDL-cholestérol (le "bon") et de triglycérides. Un déséquilibre lipidique est un facteur de risque cardiovasculaire.',
      'La créatinine est un marqueur de la fonction rénale. Son dosage permet de détecter une insuffisance rénale. Le bilan hépatique (transaminases, gamma-GT, bilirubine) évalue le fonctionnement du foie.',
      'Pour la plupart des analyses, il est nécessaire d\'être à jeun depuis au moins 8 à 12 heures. Buvez de l\'eau, mais évitez le café, le thé et le jus de fruits.',
      'Au CIMEF, notre laboratoire d\'analyses est équipé d\'automates modernes qui garantissent des résultats fiables et rapides. Nos biologistes sont disponibles pour interpréter vos résultats.',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) return { title: 'Article non trouvé' };
  return {
    title: `${article.title} - Blog CIMEF`,
    description: article.content[0],
  };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) notFound();

  const otherSlugs = Object.keys(articles).filter((s) => s !== params.slug).slice(0, 3);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#636B2F] font-medium mb-6 hover:gap-3 transition-all text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#636B2F] text-white text-xs px-3 py-1 rounded-full font-medium">
              {article.category}
            </span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime} de lecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {article.author}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            {article.content.map((paragraph, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-5">
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-[#f8f9f0] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Besoin d&apos;un examen ?
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Contactez le CIMEF pour vos examens médicaux.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
            >
              Nous Contacter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related articles */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Autres articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherSlugs.map((slug) => {
              const a = articles[slug];
              return (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-[#636B2F]/20 transition-all"
                >
                  <span className="bg-[#636B2F]/10 text-[#3F4A1F] text-xs px-2.5 py-1 rounded-full font-medium">
                    {a.category}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-[#3F4A1F] transition leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{a.content[0]}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
