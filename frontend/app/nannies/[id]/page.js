'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function NannyProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [nanny, setNanny] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    type: 'DAILY',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get('/nannies/' + id)
      .then(({ data }) => {
        setNanny(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Nounou introuvable');
        setLoading(false);
      });
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return router.push('/login');

    setBookingLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        nannyId: nanny.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        type: bookingData.type,
        notes: bookingData.notes,
      });

      setBookingModal(false);
      router.push('/bookings/' + data.id + '/pay');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la reservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) return router.push('/login');
    router.push('/messages?to=' + nanny.userId);
  };

  // Calcul du prix estimé
  const estimatedPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate || !nanny) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
    return +(hours * nanny.hourlyRate).toFixed(2);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
          <div className="container-custom max-w-5xl">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-white rounded-3xl"></div>
              <div className="h-96 bg-white rounded-3xl"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !nanny) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold mb-2">Nounou introuvable</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link href="/nannies" className="btn-primary">
              Voir toutes les nounous
            </Link>
          </div>
        </main>
      </>
    );
  }

  const nannyName = nanny.user.firstName + ' ' + nanny.user.lastName;

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom max-w-5xl">

          {/* Bouton retour */}
          <Link
            href="/nannies"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-6 transition-colors"
          >
            ← Retour a la liste
          </Link>

          {/* ═══════════════════════════════════════ */}
          {/* CARTE PRINCIPALE */}
          {/* ═══════════════════════════════════════ */}
          <div className="bg-white rounded-3xl shadow-soft-xl overflow-hidden mb-6">

            {/* Header avec gradient */}
            <div className="h-32 bg-gradient-to-r from-coral-500 via-sun-500 to-mint-500 relative">
              <div className="absolute top-4 right-4">
                {nanny.verificationStatus === 'VERIFIED' && (
                  <span className="badge bg-white/95 backdrop-blur text-mint-700 shadow-lg">
                    ✓ Verifiee
                  </span>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 pt-6 mb-6">

                {/* Avatar */}
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-6xl shadow-soft-xl border-4 border-white shrink-0">
                  👩‍🍼
                </div>

                {/* Nom + infos */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {nannyName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      📍 {nanny.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-sun-500">⭐</span>
                      <strong className="text-gray-900">{nanny.ratingAvg.toFixed(1)}</strong>
                      <span className="text-sm">({nanny.ratingCount} avis)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      🎓 {nanny.experienceYears} an{nanny.experienceYears > 1 ? 's' : ''} d'experience
                    </span>
                  </div>
                </div>

                {/* Tarif + boutons */}
                <div className="flex flex-col gap-3 md:items-end">
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-coral-600">
                      {nanny.hourlyRate} EUR
                      <span className="text-base font-normal text-gray-500">/h</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleContact}
                      className="btn-secondary !py-3 !px-5"
                    >
                      💬 Contacter
                    </button>
                    <button
                      onClick={() => setBookingModal(true)}
                      className="btn-primary !py-3 !px-5"
                    >
                      📅 Reserver
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">A propos</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {nanny.bio}
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* GRILLE D'INFOS */}
          {/* ═══════════════════════════════════════ */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">

            {/* Langues */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🗣️ Langues parlees
              </h3>
              {nanny.languages && nanny.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nanny.languages.map((lang, i) => (
                    <span key={i} className="badge-coral">
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Non specifiees</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🎓 Diplomes et certifications
              </h3>
              {nanny.certifications && nanny.certifications.length > 0 ? (
                <ul className="space-y-2">
                  {nanny.certifications.map((cert, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-mint-600 mt-0.5">✓</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">Non specifiees</p>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* DISPONIBILITES */}
          {/* ═══════════════════════════════════════ */}
          {nanny.disponibilities && nanny.disponibilities.length > 0 && (
            <div className="bg-white rounded-3xl shadow-soft p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                📅 Disponibilites hebdomadaires
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => {
                  const dispo = nanny.disponibilities.find((d) => d.dayOfWeek === i);
                  return (
                    <div
                      key={i}
                      className={'p-3 rounded-2xl text-center ' + (dispo ? 'bg-mint-50 border-2 border-mint-300' : 'bg-gray-50 border-2 border-gray-100')}
                    >
                      <div className="font-bold text-sm mb-1">{day}</div>
                      {dispo ? (
                        <div className="text-xs text-mint-700 font-medium">
                          {dispo.startTime}<br />{dispo.endTime}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Indispo</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* AVIS */}
          {/* ═══════════════════════════════════════ */}
          <div className="bg-white rounded-3xl shadow-soft p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                ⭐ Avis des parents
              </h3>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-sun-500">
                  {nanny.ratingAvg.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">
                  {nanny.ratingCount} avis
                </div>
              </div>
            </div>

            {nanny.reviews && nanny.reviews.length > 0 ? (
              <div className="space-y-4">
                {nanny.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-200 to-sun-200 flex items-center justify-center text-sm font-bold">
                        {review.author.firstName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {review.author.firstName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-sun-500">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm ml-13">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Aucun avis pour le moment</p>
              </div>
            )}
          </div>

          {/* CTA final */}
          <div className="bg-gradient-to-r from-coral-500 to-sun-500 rounded-3xl p-8 text-center text-white shadow-soft-xl">
            <div className="text-4xl mb-3">🍼</div>
            <h3 className="text-2xl font-extrabold mb-2">
              Prete a garder vos enfants ?
            </h3>
            <p className="opacity-90 mb-6">
              Reservez en quelques clics et payez via MTN MoMo ou Orange Money
            </p>
            <button
              onClick={() => setBookingModal(true)}
              className="bg-white text-coral-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              📅 Reserver maintenant
            </button>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════ */}
      {/* MODAL DE RESERVATION */}
      {/* ═══════════════════════════════════════ */}
      {bookingModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setBookingModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reserver {nanny.user.firstName}</h2>
              <button
                onClick={() => setBookingModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Debut</label>
                <input
                  type="datetime-local"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Fin</label>
                <input
                  type="datetime-local"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Type</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="input-modern"
                >
                  <option value="HOURLY">A l'heure</option>
                  <option value="DAILY">Journee</option>
                  <option value="WEEKLY">Semaine</option>
                  <option value="REGULAR">Regulier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Notes (optionnel)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="input-modern"
                  rows={2}
                  placeholder="Infos sur les enfants, allergies, etc."
                />
              </div>

              {/* Estimation du prix */}
              {estimatedPrice() > 0 && (
                <div className="bg-cream-100 rounded-2xl p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Prix estime</span>
                    <strong className="text-coral-600 text-lg">
                      {estimatedPrice()} EUR
                    </strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    {nanny.hourlyRate} EUR/h × duree
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModal(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn-primary flex-1"
                >
                  {bookingLoading ? '⏳...' : '💳 Continuer vers paiement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}