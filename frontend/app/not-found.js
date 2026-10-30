import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-32 pb-16 bg-gradient-to-br from-cream via-coral-50 to-mint-50 relative overflow-hidden">
        
        {/* Blobs décoratifs */}
        <div className="blob w-[400px] h-[400px] bg-coral-300 -top-20 -left-20 animate-float-slow" />
        <div className="blob w-[350px] h-[350px] bg-mint-300 bottom-0 -right-20 animate-float" />
        <div className="blob w-[300px] h-[300px] bg-sun-300 top-1/3 right-1/4 animate-float-delay" />

        <div className="container-custom max-w-2xl text-center relative z-10">
          
          {/* Logo 404 */}
          <div className="relative inline-block mb-6">
            <h1 className="text-[140px] md:text-[200px] font-extrabold leading-none text-gradient-coral select-none">
              404
            </h1>
            <div className="absolute -top-4 -right-8 text-6xl animate-float">🍼</div>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Oups ! Cette page n'existe pas
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Il semblerait que vous soyez perdu. La page que vous cherchez a peut-être été déplacée ou n'existe plus.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/" className="btn-primary !py-4 !px-8">
              🏠 Retour à l'accueil
            </Link>
            <Link href="/nannies" className="btn-secondary !py-4 !px-8">
              🔍 Trouver une nounou
            </Link>
          </div>

          {/* Liens utiles */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-soft p-6 border border-white/60">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Liens utiles
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/about" className="text-coral-600 hover:underline font-medium">
                À propos
              </Link>
              <Link href="/contact" className="text-coral-600 hover:underline font-medium">
                Contact
              </Link>
              <Link href="/faq" className="text-coral-600 hover:underline font-medium">
                FAQ
              </Link>
              <Link href="/login" className="text-coral-600 hover:underline font-medium">
                Connexion
              </Link>
              <Link href="/register" className="text-coral-600 hover:underline font-medium">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}