'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Reveal from '../../components/Reveal';

export default function NanniesPage() {
  const [nannies, setNannies] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    maxRate: '',
    minExperience: '',
    languages: '',
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Charge toutes les nounous au montage
  useEffect(() => {
    fetchNannies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNannies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/nannies', { params: filters });
      setNannies(Array.isArray(data) ? data : [data]);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setNannies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNannies();
  };

  const resetFilters = () => {
    setFilters({ city: '', maxRate: '', minExperience: '', languages: '' });
    setTimeout(fetchNannies, 0);
  };

  return (
    <>
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-cream via-mint-50 to-coral-50 relative overflow-hidden">
        <div className="blob w-96 h-96 bg-coral-300 -top-32 -right-32"></div>
        <div className="blob w-80 h-80 bg-mint-300 bottom-0 -left-20"></div>

        <div className="container-custom relative z-10">
          <Reveal>
            <div className="text-center mb-10">
              <span className="badge-mint mb-4">👩‍🍼 {nannies.length} nounou(s) disponible(s)</span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Trouvez votre <span className="text-gradient-coral">nounou ideale</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des centaines de nounous verifiees, pretes a s&apos;occuper de vos enfants.
              </p>
            </div>
          </Reveal>

          {/* Barre de filtres */}
          <Reveal delay={150}>
            <form
              onSubmit={handleSearch}
              className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-soft-xl border border-white/60 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  placeholder="📍 Ville"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="input-modern !py-3"
                />
                <input
                  type="number"
                  placeholder="💰 Tarif max"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  className="input-modern !py-3"
                />
                <input
                  type="number"
                  placeholder="🎓 Ann. exp."
                  value={filters.minExperience}
                  onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
                  className="input-modern !py-3"
                />
                <input
                  placeholder="🌍 Langues"
                  value={filters.languages}
                  onChange={(e) => setFilters({ ...filters, languages: e.target.value })}
                  className="input-modern !py-3"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary !py-3 w-full disabled:opacity-50"
                >
                  {loading ? '⏳' : '🔍'} Rechercher
                </button>
              </div>

              {searched && (
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-gray-500 hover:text-coral-500 transition-colors"
                  >
                    ↺ Reinitialiser les filtres
                  </button>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ RESULTATS ═══════════ */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {loading && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 animate-spin inline-block">⏳</div>
              <p className="text-gray-500">Recherche en cours...</p>
            </div>
          )}

          {!loading && nannies.length === 0 && searched && (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="text-7xl mb-6 animate-float">🔍</div>
              <h2 className="text-2xl font-bold mb-3">Aucune nounou trouvee</h2>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos criteres de recherche.
              </p>
              <button onClick={resetFilters} className="btn-primary">
                🔄 Voir toutes les nounous
              </button>
            </div>
          )}

          {!loading && nannies.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {nannies.length} nounou{nannies.length > 1 ? 's' : ''} trouvee{nannies.length > 1 ? 's' : ''}
                </h2>
                <div className="badge-mint">✓ Toutes verifiees</div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nannies.map((nanny, i) => (
                  <Reveal key={nanny.id} delay={i * 80}>
                    <Link
                      href={`/nannies/${nanny.id}`}
                      className="card p-6 block group relative overflow-hidden h-full"
                    >
                      {/* Halo au survol */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-coral-200 to-sun-200 rounded-full opacity-0 group-hover:opacity-50 blur-3xl transition-opacity duration-700"></div>

                      {/* En-tete */}
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-3xl shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                            👩‍🍼
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-mint-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                            ✓
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg group-hover:text-coral-600 transition-colors truncate">
                            {nanny.user?.firstName} {nanny.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                            📍 {nanny.city || 'Non precise'}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 relative z-10 min-h-[2.5rem]">
                        {nanny.bio || 'Aucune description pour le moment.'}
                      </p>

                      {/* Infos */}
                      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                        {nanny.experienceYears > 0 && (
                          <span className="badge bg-sky-100 text-sky-700 !text-[10px]">
                            🎓 {nanny.experienceYears} an{nanny.experienceYears > 1 ? 's' : ''}
                          </span>
                        )}
                        {nanny.languages && nanny.languages.length > 0 && (
                          <span className="badge bg-coral-100 text-coral-700 !text-[10px]">
                            🌍 {nanny.languages.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Prix + note */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 relative z-10">
                        <div>
                          <span className="text-xl font-extrabold text-coral-600">
                            {nanny.hourlyRate} €
                          </span>
                          <span className="text-sm text-gray-500">/h</span>
                        </div>
                        <div className="badge-sun">
                          ⭐ {nanny.ratingAvg ? nanny.ratingAvg.toFixed(1) : '0.0'} ({nanny.ratingCount || 0})
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      {!loading && nannies.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-coral-500 to-sun-600 relative overflow-hidden">
          <div className="blob w-96 h-96 bg-white/20 -top-32 -left-32"></div>
          <div className="container-custom text-center relative z-10">
            <div className="text-6xl mb-4 animate-float">💛</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Vous etes nounou ?
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">
              Rejoignez NounouHome et proposez vos services a des milliers de familles.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-coral-600 font-bold rounded-full shadow-soft-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              🚀 Devenir nounou
            </Link>
          </div>
        </section>
      )}
    </>
  );
}