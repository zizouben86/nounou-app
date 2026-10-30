'use client';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-white">
        <div className="container-custom max-w-4xl">

          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-6 transition-colors">
            ← Retour à l accueil
          </Link>

          <h1 className="text-4xl font-extrabold mb-2">Politique de Confidentialité</h1>
          <p className="text-gray-500 mb-8">Dernière mise à jour : 29 octobre 2026</p>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Chez <strong>NounouHome</strong>, nous prenons la protection de vos données personnelles 
                très au sérieux. Cette politique explique quelles données nous collectons, comment nous 
                les utilisons, et quels sont vos droits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Données d identification :</strong> nom, prénom, email, téléphone</li>
                <li><strong>Données de localisation :</strong> adresse, ville, code postal</li>
                <li><strong>Données professionnelles (nounous) :</strong> diplômes, expérience, pièce d identité</li>
                <li><strong>Données de paiement :</strong> transactions via Mobile Money (jamais vos codes PIN)</li>
                <li><strong>Données d utilisation :</strong> messages, réservations, avis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer et gérer votre compte</li>
                <li>Faciliter la mise en relation parents/nounous</li>
                <li>Traiter les réservations et paiements</li>
                <li>Vérifier l identité des nounous</li>
                <li>Vous envoyer des notifications liées au service</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Partage des données</h2>
              <p>
                Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>L autre partie de la mise en relation (parents ↔ nounous)</li>
                <li>Nos prestataires de paiement (MTN Mobile Money, Orange Money)</li>
                <li>Les autorités en cas d obligation légale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos 
                données : chiffrement des mots de passe, connexions HTTPS, accès restreint aux données 
                sensibles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Conservation des données</h2>
              <p>
                Vos données sont conservées tant que votre compte est actif. En cas de suppression de 
                compte, elles sont effacées sous 90 jours, sauf obligation légale contraire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Vos droits</h2>
              <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d accès :</strong> consulter vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données</li>
                <li><strong>Droit à l effacement :</strong> supprimer votre compte</li>
                <li><strong>Droit d opposition :</strong> refuser certains traitements</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits : <strong>privacy@nounouhome.cm</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Cookies</h2>
              <p>
                Nous utilisons des cookies pour améliorer votre expérience (session, préférences). 
                Vous pouvez les refuser depuis les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. En cas de changement majeur, vous serez informé 
                par email ou notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>
                Pour toute question : <strong>privacy@nounouhome.cm</strong>
              </p>
            </section>
          </div>

          <div className="mt-12 flex gap-3">
            <Link href="/terms" className="btn-outline">Conditions d utilisation</Link>
            <Link href="/contact" className="btn-primary">Nous contacter</Link>
          </div>
        </div>
      </main>
    </>
  );
}