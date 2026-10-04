'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function NannyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [nanny, setNanny] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({
    startDate: '',
    endDate: '',
    type: 'DAILY',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadNanny() {
      try {
        const { data } = await api.get(`/nannies/${id}`);
        setNanny(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Nounou introuvable');
      } finally {
        setLoading(false);
      }
    }
    loadNanny();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);

    const user = localStorage.getItem('user');
    if (!user) return router.push('/login');

    const parsed = JSON.parse(user);
    if (parsed.role !== 'PARENT') {
      setBookingError('Seuls les parents peuvent reserver.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        nannyId: nanny.id,
        startDate: new Date(booking.startDate).toISOString(),
        endDate: new Date(booking.endDate).toISOString(),
        type: booking.type,
        notes: booking.notes,
      });

      // Affiche un message de succes
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Erreur lors de la reservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const calcPrice = () => {
    if (!booking.startDate || !booking.endDate || !nanny) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
    return Math.round(hours * nanny.hourlyRate);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen bg-cream">
          <div className="container-custom max-w-4xl text-center">
            <div className="text-6xl animate-spin inline-block">⏳</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !nanny) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen bg-cream">
          <div className="container-custom max-w-4xl text-center">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold mb-6">{error || 'Nounou introuvable'}</h1>
            <Link href="/nannies" className="btn-primary">
              ← Retour a la liste
            </Link>
          </div>
        </main>
      </>
    );
  }

  const price = calcPrice();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-coral-50">
        <div className="container-custom max-w-5xl">

          <Link
            href="/nannies"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-coral-500 mb-6"
          >
            ← Retour a la liste
          </Link>

          <div className="grid md:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-soft-xl p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-5xl shadow-soft-lg">
                      👩‍🍼
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-mint-500 border-4 border-white flex items-center justify-center text-xs text-white font-bold">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold mb-1">
                      {nanny.user?.firstName} {nanny.user?.lastName}
                    </h1>
                    <p className="text-gray-500 flex items-center gap-2 mb-3">
                      📍 {nanny.city || 'Non precise'}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="badge-sun">
                        ⭐ {nanny.ratingAvg ? nanny.ratingAvg.toFixed(1) : '0.0'}/{nanny.ratingCount || 0} avis
                      </span>
                      <span className="badge-mint">✓ Verifiee</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-coral-50 rounded-2xl">
                    <div className="text-2xl font-extrabold text-coral-600">
                      {nanny.hourlyRate} F
                    </div>
                    <div className="text-xs text-gray-500">Par heure</div>
                  </div>
                  <div className="text-center p-4 bg-mint-50 rounded-2xl">
                    <div className="text-2xl font-extrabold text-mint-600">
                      {nanny.experienceYears || 0}
                    </div>
                    <div className="text-xs text-gray-500">Ans d&apos;exp.</div>
                  </div>
                  <div className="text-center p-4 bg-sun-50 rounded-2xl">
                    <div className="text-2xl font-extrabold text-sun-600">
                      {nanny.languages?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Langues</div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h2 className="font-bold text-lg mb-3">A propos</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {nanny.bio || 'Aucune description pour le moment.'}
                  </p>
                </div>

                {nanny.languages?.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h2 className="font-bold text-lg mb-3">Langues parlees</h2>
                    <div className="flex flex-wrap gap-2">
                      {nanny.languages.map((lang, i) => (
                        <span key={i} className="badge-coral">🌍 {lang}</span>
                      ))}
                    </div>
                  </div>
                )}

                {nanny.certifications?.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h2 className="font-bold text-lg mb-3">Certifications</h2>
                    <div className="flex flex-wrap gap-2">
                      {nanny.certifications.map((cert, i) => (
                        <span key={i} className="badge-mint">🎓 {cert}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {nanny.reviews?.length > 0 && (
                <div className="bg-white rounded-3xl shadow-soft-xl p-8">
                  <h2 className="font-bold text-lg mb-6">Avis des parents</h2>
                  <div className="space-y-4">
                    {nanny.reviews.map((r) => (
                      <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{r.author?.firstName || 'Anonyme'}</span>
                          <span className="text-sun-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:sticky md:top-28 h-fit">
              <div className="bg-white rounded-3xl shadow-soft-xl p-6">
                {bookingSuccess ? (
                  <div className="text-center py-4">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-extrabold mb-2">Demande envoyee !</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Votre demande a ete transmise a <strong>{nanny.user?.firstName}</strong>.
                      Vous pourrez payer des qu&apos;elle aura accepte.
                    </p>

                    <div className="bg-sun-50 border-2 border-sun-200 rounded-2xl p-4 mb-6 text-left text-xs">
                      <div className="font-bold text-sun-800 mb-2">📋 Etapes suivantes :</div>
                      <ol className="space-y-1 text-sun-700 list-decimal list-inside">
                        <li>La nounou accepte votre demande</li>
                        <li>Vous recevez une notification</li>
                        <li>Vous payez via Mobile Money</li>
                        <li>La reservation est confirmee</li>
                      </ol>
                    </div>

                    <Link href="/dashboard" className="btn-primary w-full !py-3">
                      📊 Voir mes reservations
                    </Link>
                  </div>
                ) : !showBooking ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-extrabold text-coral-600">
                        {nanny.hourlyRate} F<span className="text-base text-gray-500">/h</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Tarif horaire</p>
                    </div>

                    <button
                      onClick={() => setShowBooking(true)}
                      className="btn-primary w-full !py-4 mb-3"
                    >
                      📅 Demander une reservation
                    </button>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-2">✓ Profil verifie</div>
                      <div className="flex items-center gap-2">✓ Paiement securise</div>
                      <div className="flex items-center gap-2">✓ Paiement apres acceptation</div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleBooking}>
                    <button
                      type="button"
                      onClick={() => setShowBooking(false)}
                      className="text-sm text-gray-500 hover:text-coral-500 mb-4"
                    >
                      ← Retour
                    </button>

                    <h3 className="text-xl font-bold mb-4">📅 Nouvelle demande</h3>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Debut</label>
                        <input
                          type="datetime-local"
                          required
                          value={booking.startDate}
                          onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                          className="input-modern !py-2 !text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Fin</label>
                        <input
                          type="datetime-local"
                          required
                          value={booking.endDate}
                          onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                          className="input-modern !py-2 !text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                        <select
                          value={booking.type}
                          onChange={(e) => setBooking({ ...booking, type: e.target.value })}
                          className="input-modern !py-2 !text-sm"
                        >
                          <option value="HOURLY">A l&apos;heure</option>
                          <option value="DAILY">Journee</option>
                          <option value="WEEKLY">Semaine</option>
                          <option value="REGULAR">Regulier</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">
                          Notes (optionnel)
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Age des enfants, besoins specifiques..."
                          value={booking.notes}
                          onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                          className="input-modern !py-2 !text-sm resize-none"
                        />
                      </div>
                    </div>

                    {price > 0 && (
                      <div className="bg-coral-50 rounded-2xl p-4 mb-4 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Montant estime
                        </div>
                        <div className="text-3xl font-extrabold text-coral-600">
                          {price} FCFA
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          A payer apres acceptation
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                        ⚠️ {bookingError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading || price === 0}
                      className="btn-primary w-full !py-4 disabled:opacity-50"
                    >
                      {bookingLoading ? '⏳...' : '📩 Envoyer la demande'}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      💳 Le paiement sera disponible apres acceptation
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}