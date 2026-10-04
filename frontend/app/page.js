'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';

export default function Home() {
  const [filters, setFilters] = useState({ city: '', maxRate: '', languages: '' });
  const [nannies, setNannies] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get('/nannies', { params: filters });
      setNannies(data);
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          🎨 HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 animated-gradient-bg overflow-hidden">
        {/* Blobs décoratifs animés */}
        <div className="blob w-[500px] h-[500px] bg-coral-300 -top-32 -left-32 animate-float-slow" />
        <div className="blob w-[400px] h-[400px] bg-mint-300 top-40 -right-32 animate-float" />
        <div className="blob w-[350px] h-[350px] bg-sun-300 bottom-0 left-1/3 animate-float-delay" />
        <div className="blob w-[250px] h-[250px] bg-sky-300 top-1/2 right-1/4 animate-float-slow" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* ─── Colonne texte ─── */}
            <div className="lg:col-span-6 animate-fade-in-up">
              {/* Badge de confiance */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-soft border border-white/60 mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500" />
                </span>
                <span className="text-xs md:text-sm font-semibold text-gray-700">
                  +15 000 familles nous font confiance
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 text-gray-900">
                La garde d'enfants{' '}
                <span className="relative inline-block">
                  <span className="text-gradient-coral">réinventée</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C50 4 150 4 198 10"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#FF7A6B" />
                        <stop offset="0.5" stopColor="#FFB84D" />
                        <stop offset="1" stopColor="#5DCFA0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{' '}
                pour vous 💛
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Trouvez en quelques clics une nounou de confiance près de chez vous.
                Profils vérifiés, réservation simple et paiement sécurisé.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/register" className="btn-primary !py-4 !px-7 !text-base">
                  <span>🚀 Commencer gratuitement</span>
                </Link>
                <Link href="#how" className="btn-secondary !py-4 !px-7 !text-base">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-coral-500/10 flex items-center justify-center text-xs">
                      ▶
                    </span>
                    Comment ça marche
                  </span>
                </Link>
              </div>

              {/* Preuve sociale */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex -space-x-3">
                  {['👩', '👨', '👩‍🦰', '👨‍🦱', '👩‍🦱'].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full border-[3px] border-white bg-gradient-to-br from-coral-300 to-sun-300 flex items-center justify-center text-lg shadow-soft"
                      style={{ zIndex: 10 - i }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sun-500 text-sm">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong className="text-coral-600">4.9/5</strong> sur 3 200+ avis
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Colonne visuelle ─── */}
            <div className="lg:col-span-6 relative animate-fade-in delay-200">
              {/* Image principale */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-soft-xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-smooth">
                <img
                  src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=900&auto=format&fit=crop&q=80"
                  alt="Nounou bienveillante avec enfant"
                  className="w-full h-[420px] md:h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Badge flottant 1 — Note */}
              <div className="absolute -left-4 md:-left-8 top-12 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-soft-xl animate-float border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sun-100 to-sun-300 flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 text-lg leading-tight">4.9/5</div>
                    <div className="text-xs text-gray-500">Note moyenne</div>
                  </div>
                </div>
              </div>

              {/* Badge flottant 2 — Vérifiée */}
              <div className="absolute -right-4 md:-right-6 top-1/3 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-soft-xl animate-float-delay border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 text-sm leading-tight">
                      Nounou vérifiée
                    </div>
                    <div className="text-xs text-gray-500">Casier + diplômes</div>
                  </div>
                </div>
              </div>

              {/* Badge flottant 3 — Familles */}
              <div className="absolute left-4 md:left-8 -bottom-4 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-soft-xl animate-float-slow border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-100 to-coral-300 flex items-center justify-center text-2xl">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 text-lg leading-tight">
                      15k+
                    </div>
                    <div className="text-xs text-gray-500">Familles heureuses</div>
                  </div>
                </div>
              </div>

              {/* Éléments décoratifs */}
              <div className="absolute -top-4 -right-2 text-4xl animate-float">✨</div>
              <div className="absolute bottom-1/4 -left-6 text-3xl animate-float-delay">💛</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow hidden md:block">
          <div className="w-6 h-10 rounded-full border-2 border-coral-400 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-coral-500 animate-pulse-soft" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          📊 BARRE DE STATISTIQUES
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { value: '15 000+', label: 'Familles satisfaites', icon: '👨‍👩‍👧', color: 'coral' },
              { value: '2 500+', label: 'Nounous vérifiées', icon: '👩‍🍼', color: 'mint' },
              { value: '99%', label: 'Avis positifs', icon: '⭐', color: 'sun' },
              { value: '24/7', label: 'Support client', icon: '💬', color: 'sky' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="text-center p-6 rounded-3xl hover:bg-gradient-to-br hover:from-cream-100 hover:to-white transition-all duration-500 group cursor-default">
                  <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 inline-block">
                    {s.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-coral-500 via-sun-500 to-mint-500 bg-clip-text text-transparent mb-2">
                    {s.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          🔍 FORMULAIRE DE RECHERCHE RAPIDE
          ═══════════════════════════════════════════════════ */}
      <section id="search" className="relative py-20 md:py-28 bg-gradient-to-br from-coral-50 via-cream to-mint-50 overflow-hidden">
        <div className="blob w-[400px] h-[400px] bg-sun-300 -top-20 right-0" />
        <div className="blob w-[300px] h-[300px] bg-coral-300 bottom-0 left-0" />

        <div className="container-custom relative z-10">
          <Reveal>
            <div className="text-center mb-12">
              <span className="badge-coral mb-4 animate-pulse-soft">
                🔍 Recherche rapide
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Trouvez votre nounou{' '}
                <span className="text-gradient-coral">en quelques secondes</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Filtrez parmi des centaines de nounous vérifiées selon vos critères.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <form
              onSubmit={search}
              className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-soft-xl border border-white/60 mb-12 max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ville */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coral-500 pointer-events-none">
                    📍
                  </span>
                  <input
                    placeholder="Ville ou code postal"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="input-icon"
                  />
                </div>

                {/* Tarif */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mint-500 pointer-events-none">
                    💰
                  </span>
                  <input
                    type="number"
                    placeholder="Tarif max (€/h)"
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                    className="input-icon"
                  />
                </div>

                {/* Langues */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sun-500 pointer-events-none">
                    🌍
                  </span>
                  <input
                    placeholder="Langues (fr, en)"
                    value={filters.languages}
                    onChange={(e) => setFilters({ ...filters, languages: e.target.value })}
                    className="input-icon"
                  />
                </div>

                {/* Bouton */}
                <button
                  disabled={loading}
                  className="btn-primary !py-3.5 !text-base disabled:opacity-50 w-full"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      <span>Recherche...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍 Rechercher</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>

          {/* Résultats */}
          <div id="results">
            {nannies.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nannies.map((n, i) => (
                  <Reveal key={n.id} delay={i * 80}>
                    <Link
                      href={`/nannies/${n.id}`}
                      className="card p-6 block group relative overflow-hidden"
                    >
                      {/* Halo au survol */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-coral-200 to-sun-200 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-700" />

                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-3xl shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                            👩‍🍼
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-mint-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                            ✓
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-coral-600 transition-colors">
                            {n.user.firstName} {n.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            📍 {n.city}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 relative z-10">
                        {n.bio}
                      </p>

                      <div className="flex justify-between items-center relative z-10 pt-3 border-t border-gray-100">
                        <span className="text-xl font-extrabold text-coral-600">
                          {n.hourlyRate} €
                          <span className="text-sm font-normal text-gray-500">/h</span>
                        </span>
                        <span className="badge-sun">
                          ⭐ {n.ratingAvg.toFixed(1)} ({n.ratingCount})
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}

            {nannies.length === 0 && (
              <Reveal>
                <div className="text-center py-16 max-w-md mx-auto">
                  <div className="text-7xl mb-6 animate-float">🔍</div>
                  <p className="text-lg text-gray-600">
                    Lancez une recherche pour découvrir nos nounous vérifiées ✨
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          🎯 COMMENT ÇA MARCHE
          ═══════════════════════════════════════════════════ */}
      <section id="how" className="section-padding bg-white relative overflow-hidden">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <span className="badge-mint mb-4">🎯 Simple et rapide</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trois étapes seulement pour trouver votre nounou idéale.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-coral-200 via-mint-200 to-sun-200" />

            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Recherchez',
                desc: 'Filtrez les nounous selon votre ville, budget et besoins spécifiques.',
                color: 'from-coral-100 to-coral-300',
                text: 'text-coral-600',
              },
              {
                step: '02',
                icon: '💬',
                title: 'Échangez',
                desc: 'Discutez avec les nounous, posez vos questions et planifiez un rendez-vous.',
                color: 'from-mint-100 to-mint-300',
                text: 'text-mint-600',
              },
              {
                step: '03',
                icon: '📅',
                title: 'Réservez',
                desc: 'Réservez et payez en ligne en toute sécurité. Aussi simple que ça !',
                color: 'from-sun-100 to-sun-300',
                text: 'text-sun-600',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="relative">
                  <div className="card p-8 relative h-full text-center">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-4">
                      <span className={`text-2xl font-black ${item.text}`}>
                        {item.step}
                      </span>
                    </div>
                    <div
                      className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center text-4xl mb-6 shadow-soft-lg mx-auto mt-4 group-hover:animate-wiggle`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ⭐ SECTION TÉMOIGNAGES
          ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-gradient-to-b from-cream to-white relative overflow-hidden">
        <div className="blob w-[400px] h-[400px] bg-coral-200 top-20 -left-32" />
        <div className="blob w-[350px] h-[350px] bg-mint-200 bottom-0 -right-32" />

        <div className="container-custom relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="badge-sun mb-4">💛 Témoignages</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Ils nous adorent
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des milliers de familles nous font confiance chaque jour.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie L.',
                role: 'Maman de 2 enfants',
                text: "Une plateforme exceptionnelle ! J'ai trouvé la nounou parfaite en 2 jours. Le processus de vérification m'a rassurée.",
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
                color: 'from-coral-100 to-coral-300',
                city: 'Paris',
              },
              {
                name: 'Thomas M.',
                role: 'Papa de jumelles',
                text: 'Enfin une solution simple et moderne pour la garde d\'enfants. Le paiement en ligne est un vrai plus !',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
                color: 'from-mint-100 to-mint-300',
                city: 'Lyon',
              },
              {
                name: 'Amina K.',
                role: 'Nounou professionnelle',
                text: 'Grâce à NounouHome, je gère mon planning facilement et je rencontre des familles formidables. Je recommande !',
                avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
                color: 'from-sun-100 to-sun-300',
                city: 'Marseille',
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="card p-8 h-full relative group">
                  {/* Guillemet décoratif */}
                  <div className="absolute top-4 right-6 text-7xl text-coral-100 font-serif leading-none select-none group-hover:text-coral-200 transition-colors">
                    "
                  </div>

                  {/* Badge vérifié */}
                  <div className="badge-mint mb-4">
                    ✓ Avis vérifié
                  </div>

                  {/* Étoiles */}
                  <div className="flex gap-0.5 text-sun-500 text-lg mb-5">
                    ⭐⭐⭐⭐⭐
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                    {t.text}
                  </p>

                  <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-soft"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">
                        {t.role} • {t.city}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          🚀 CTA FINAL
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-coral-500 via-coral-600 to-sun-600 overflow-hidden">
        <div className="blob w-[500px] h-[500px] bg-white/20 -top-32 -left-32" />
        <div className="blob w-[400px] h-[400px] bg-mint-300/40 -bottom-20 -right-20" />
        <div className="blob w-[300px] h-[300px] bg-sun-300/40 top-1/3 right-1/3" />

        <Reveal>
          <div className="container-custom text-center relative z-10">
            <div className="text-7xl mb-6 animate-float inline-block">🍼</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
              Prêt à trouver votre nounou idéale ?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers de familles qui nous font déjà confiance.
              Inscription gratuite en moins d'une minute.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-coral-600 font-bold rounded-full shadow-soft-xl transition-all duration-300 ease-smooth hover:-translate-y-1 hover:scale-105 active:scale-95"
              >
                <span>🎉 Créer mon compte gratuit</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/nannies"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-full border-2 border-white/80 backdrop-blur-sm transition-all duration-300 ease-smooth hover:bg-white hover:text-coral-600 hover:-translate-y-1 hover:scale-105"
              >
                <span>🔍 Voir les nounous</span>
              </Link>
            </div>

            <p className="text-white/70 text-sm mt-8">
              ✓ Sans engagement • ✓ Paiement sécurisé • ✓ Support 24/7
            </p>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          🦶 FOOTER
          ═══════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-300 py-16 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🍼</span>
                <span className="text-2xl font-extrabold text-white">NounouHome</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                La plateforme de confiance pour la garde d'enfants à domicile en France.
              </p>
              <div className="flex gap-2">
                {['📘', '📷', '🐦', '💼'].map((icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-coral-500 hover:-translate-y-1 transition-all duration-300"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Découvrir</h4>
              <ul className="space-y-2 text-sm">
                {['Trouver une nounou', 'Devenir nounou', 'Tarifs', 'Avis clients'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-coral-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Aide</h4>
              <ul className="space-y-2 text-sm">
                {['FAQ', 'Contact', 'CGU', 'Confidentialité'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-coral-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">
                Recevez nos conseils pour parents.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-coral-500 transition-colors"
                />
                <button className="w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 flex items-center justify-center transition-colors">
                  →
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2025 NounouHome. Tous droits réservés.</p>
            <p>Fait avec 💛 en France</p>
          </div>
        </div>
      </footer>
    </>
  );
}