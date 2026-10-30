'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

const faqs = [
  {
    category: 'Pour les parents',
    questions: [
      {
        q: 'Comment trouver une nounou sur NounouHome ?',
        a: 'Créez un compte parent, puis utilisez la barre de recherche pour filtrer les nounous par ville, tarif et langues. Cliquez sur le profil qui vous intéresse pour voir ses détails, ses diplômes et ses avis.',
      },
      {
        q: 'Les nounous sont-elles vérifiées ?',
        a: 'Oui. Chaque nounou doit fournir sa pièce d\'identité, un casier judiciaire de moins de 3 mois et ses diplômes. Notre équipe vérifie manuellement chaque profil avant validation.',
      },
      {
        q: 'Comment se passe le paiement ?',
        a: 'Le paiement se fait en ligne via MTN Mobile Money ou Orange Money. Une commission de 15% est prélevée pour couvrir les frais de service. Le reste est versé à la nounou.',
      },
      {
        q: 'Puis-je annuler une réservation ?',
        a: 'Oui, vous pouvez annuler une réservation depuis votre tableau de bord. Si l\'annulation est faite plus de 48h avant la prestation, vous êtes remboursé intégralement.',
      },
    ],
  },
  {
    category: 'Pour les nounous',
    questions: [
      {
        q: 'Comment devenir nounou sur NounouHome ?',
        a: 'Inscrivez-vous avec le rôle "Nounou", complétez votre profil (bio, tarif, expérience) et uploadez vos documents de vérification (CNI, casier judiciaire, diplômes). Une fois validé par notre équipe, votre profil sera visible par les parents.',
      },
      {
        q: 'Combien de temps prend la vérification ?',
        a: 'La vérification prend généralement 24 à 48 heures. Vous recevrez un email dès que votre profil sera validé ou si des documents supplémentaires sont nécessaires.',
      },
      {
        q: 'Comment suis-je payée ?',
        a: 'Vous recevez 85% du montant total de la réservation sur votre compte Mobile Money (MTN ou Orange). Le versement est effectué après la prestation.',
      },
    ],
  },
  {
    category: 'Sécurité et confiance',
    questions: [
      {
        q: 'Que faire en cas de problème avec une nounou ?',
        a: 'Contactez immédiatement notre support via la page Contact. Nous traiterons votre signalement en priorité et prendrons les mesures nécessaires (suspension du profil, remboursement, etc.).',
      },
      {
        q: 'Mes données personnelles sont-elles protégées ?',
        a: 'Oui. Vos données sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement. Consultez notre Politique de confidentialité pour plus de détails.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-sky-50">
        <div className="container-custom max-w-4xl">

          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-6 transition-colors">
            ← Retour à l'accueil
          </Link>

          <div className="text-center mb-12">
            <div className="text-6xl mb-4 animate-float inline-block">❓</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Foire Aux <span className="text-gradient-coral">Questions</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez les réponses aux questions les plus fréquentes sur NounouHome.
            </p>
          </div>

          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const globalIndex = catIndex * 100 + index;
                  const isOpen = openIndex === globalIndex;
                  return (
                    <div key={index} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                      <button
                        onClick={() => toggle(globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-cream-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                        <span className={`text-2xl text-coral-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-coral-500 to-sun-500 rounded-3xl p-8 text-center text-white shadow-soft-xl mt-12">
            <h3 className="text-2xl font-extrabold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="opacity-90 mb-6">Notre équipe est là pour vous aider.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-coral-600 font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              📧 Nous contacter
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}