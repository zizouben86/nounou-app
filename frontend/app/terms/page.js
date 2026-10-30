'use client';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-white">
        <div className="container-custom max-w-4xl">

          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-6 transition-colors">
            ← Retour à l accueil
          </Link>

          <h1 className="text-4xl font-extrabold mb-2">Conditions Générales d Utilisation</h1>
          <p className="text-gray-500 mb-8">Dernière mise à jour : 29 octobre 2026</p>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d Utilisation (CGU) régissent l utilisation de la plateforme 
                <strong> NounouHome</strong>, accessible à l adresse <strong>nounouhome.cm</strong>. 
                En utilisant notre service, vous acceptez sans réserve les présentes conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description du service</h2>
              <p>
                NounouHome est une plateforme de mise en relation entre des familles (parents) et des 
                professionnels de la garde d enfants (nounous). Nous ne sommes pas un employeur, mais un 
                intermédiaire technique permettant aux deux parties de se rencontrer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Inscription</h2>
              <p>
                Pour utiliser NounouHome, vous devez créer un compte en fournissant des informations 
                exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.
              </p>
              <p>
                <strong>Pour les nounous :</strong> une vérification d identité (CNI, casier judiciaire, 
                diplômes) est obligatoire avant validation du profil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Obligations des utilisateurs</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir des informations véridiques et à jour</li>
                <li>Ne pas usurper l identité d autrui</li>
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas utiliser la plateforme à des fins illégales</li>
                <li>Signaler tout comportement suspect à notre équipe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Paiements</h2>
              <p>
                Les paiements sont effectués via <strong>MTN Mobile Money</strong> ou <strong>Orange Money</strong>. 
                Une commission de 15% est prélevée sur chaque transaction pour couvrir les frais de service.
              </p>
              <p>
                Les paiements sont sécurisés et les remboursements sont possibles en cas de litige, 
                après examen de notre équipe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Responsabilités</h2>
              <p>
                NounouHome met tout en œuvre pour vérifier les profils des nounous, mais ne peut être tenu 
                responsable des actes commis lors des prestations. Nous recommandons aux parents de 
                rencontrer la nounou avant la première garde.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Résiliation</h2>
              <p>
                Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. NounouHome se 
                réserve le droit de suspendre ou supprimer tout compte ne respectant pas les présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Modification des CGU</h2>
              <p>
                Nous nous réservons le droit de modifier ces CGU à tout moment. Les utilisateurs seront 
                informés par email en cas de changement majeur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Droit applicable</h2>
              <p>
                Les présentes CGU sont régies par le droit camerounais. Tout litige sera soumis aux 
                tribunaux compétents de Douala.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>
                Pour toute question : <strong>contact@nounouhome.cm</strong>
              </p>
            </section>
          </div>

          <div className="mt-12 flex gap-3">
            <Link href="/privacy" className="btn-outline">Politique de confidentialité</Link>
            <Link href="/contact" className="btn-primary">Nous contacter</Link>
          </div>
        </div>
      </main>
    </>
  );
}