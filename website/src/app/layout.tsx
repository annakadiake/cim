import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CIMEF Tivaouane - Cabinet d'Imagerie Médicale et d'Explorations Fonctionnelles",
  description: "CIMEF Tivaouane : votre centre d'imagerie médicale de référence au Sénégal. Échographie, radiographie, scanner, ECG et analyses biologiques.",
  keywords: "CIMEF, Tivaouane, imagerie médicale, échographie, radiographie, scanner, ECG, Sénégal",
  openGraph: {
    title: "CIMEF Tivaouane - Centre d'Imagerie Médicale",
    description: "Cabinet d'Imagerie Médicale et d'Explorations Fonctionnelles de Tivaouane, Sénégal.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
