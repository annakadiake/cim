import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f8f9f0] via-white to-[#f0f2e6] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#636B2F] font-semibold text-sm uppercase tracking-wider mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Notre équipe est à votre disposition pour vous accompagner.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-[#f8f9f0] rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Nos Coordonnées</h2>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#636B2F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#636B2F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Adresse</h3>
                  <p className="text-gray-500 text-sm">Tivaouane, Sénégal</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#636B2F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#636B2F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Téléphone</h3>
                  <a href="tel:+221773002697" className="text-gray-500 text-sm hover:text-[#636B2F] transition block">
                    +221 77 300 26 97
                  </a>
                  <a href="tel:+221766555556" className="text-gray-500 text-sm hover:text-[#636B2F] transition block">
                    +221 76 655 55 56
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#636B2F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#636B2F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:cimeftivaouane@gmail.com" className="text-gray-500 text-sm hover:text-[#636B2F] transition">
                    cimeftivaouane@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#636B2F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#636B2F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Horaires</h3>
                  <p className="text-gray-500 text-sm">Ouvert 24h/24 - 7j/7</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden min-h-[350px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15345.123!2d-16.82!3d14.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10d8c!2sTivaouane!5e0!3m2!1sfr!2ssn!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation CIMEF Tivaouane"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
