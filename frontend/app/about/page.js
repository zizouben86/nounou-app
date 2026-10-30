'use client';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="text-7xl mb-6 animate-float inline-block">🍼</div>
            <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
              À propos de <span className="text-gradient-coral">NounouHome</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La plateforme qui connecte les familles camerounaises aux meilleures nounous de confiance.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Notre mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Au Cameroun, trouver une nounou de confiance reste un défi majeur pour de nombreuses familles. 
              Entre le bouche-à-oreille limité, l'absence de vérification des profils et les difficultés 
              de paiement, les parents perdent un temps précieux et manquent de sérénité.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>NounouHome</strong> a été créé pour répondre à ce besoin : offrir une plateforme 
              moderne, sécurisée et adaptée aux réalités locales, où chaque famille peut trouver en quelques 
              clics une nounou vérifiée, proche de chez elle, et payer en toute sécurité via Mobile Money.
            </p>
          </div>

          {/* Valeurs */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: '🛡️',
                title: 'Confiance',
                desc: 'Chaque nounou est vérifiée : identité, casier judiciaire et diplômes contrôlés par notre équipe.',
                color: 'from-mint-100 to-mint-300',
              },
              {
                icon: '💛',
                title: 'Bienveillance',
                desc: 'Nous plaçons le bien-être des enfants et la tranquillité des parents au cœur de tout ce que nous faisons.',
                color: 'from-coral-100 to-coral-300',
              },
              {
                icon: '⚡',
                title: 'Simplicité',
                desc: 'Recherche, réservation et paiement en quelques clics, adaptés aux réalités camerounaises.',
                color: 'from-sun-100 to-sun-300',
              },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-soft p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center text-3xl mx-auto mb-4`}>
                  {v.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Chiffres */}
          <div className="bg-gradient-to-r from-coral-500 to-sun-500 rounded-3xl shadow-soft-xl p-8 md:p-12 text-white text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-8">NounouHome en chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '15 000+', label: 'Familles' },
                { value: '2 500+', label: 'Nounous' },
                { value: '4.9/5', label: 'Note moyenne' },
                { value: '99%', label: 'Satisfaction' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-4xl font-extrabold mb-1">{s.value}</div>
                  <div className="text-sm opacity-90">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Équipe */}
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Notre équipe</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              NounouHome est porté par une équipe passionnée de parents et d'entrepreneurs camerounais, 
              convaincus que la technologie peut améliorer le quotidien des familles.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Basés à <strong>Douala</strong>, nous travaillons chaque jour pour offrir la meilleure 
              expérience possible à nos utilisateurs à travers tout le Cameroun.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">Prêt à rejoindre l'aventure ?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary !py-4 !px-8">
                🚀 Créer mon compte
              </Link>
              <Link href="/contact" className="btn-secondary !py-4 !px-8">
                📧 Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}