'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Reveal from '../../components/Reveal';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, spent: 0 });
  const [cancelModal, setCancelModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const u = JSON.parse(stored);
    if (u.role === 'NANNY') return router.push('/nanny/dashboard');
    setUser(u);
    loadBookings();

    // Message de succes si on vient de creer une reservation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('booking') === 'created') {
      showToast('Demande envoyee ! En attente d\'acceptation par la nounou.', 'success');
    }
  }, [router]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/me');
      setBookings(data);

      const paid = data.filter((b) => b.paymentStatus === 'SUCCESS');
      const pending = data.filter((b) => b.status === 'PENDING');
      const spent = paid.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      setStats({
        total: data.length,
        paid: paid.length,
        pending: pending.length,
        spent,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return b.status === 'PENDING';
    if (filter === 'TO_PAY') return b.status === 'CONFIRMED' && b.paymentStatus !== 'SUCCESS';
    if (filter === 'PAID') return b.paymentStatus === 'SUCCESS';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${cancelModal.id}/status`, { status: 'CANCELLED' });
      setCancelModal(null);
      loadBookings();
      showToast('Reservation annulee');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setActionLoading(true);
    try {
      await api.post('/reviews', {
        bookingId: reviewModal.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
      loadBookings();
      showToast('Merci pour votre avis !');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (b) => {
    if (b.status === 'CANCELLED') return { label: 'Refusee', class: 'bg-gray-100 text-gray-600' };
    if (b.status === 'COMPLETED') return { label: 'Terminee', class: 'bg-sky-100 text-sky-700' };
    if (b.status === 'PENDING') return { label: 'En attente de la nounou', class: 'bg-sun-100 text-sun-700' };
    if (b.status === 'CONFIRMED' && b.paymentStatus !== 'SUCCESS') {
      return { label: 'Acceptee — a payer', class: 'bg-coral-100 text-coral-700' };
    }
    if (b.status === 'CONFIRMED' && b.paymentStatus === 'SUCCESS') {
      return { label: 'Payee', class: 'bg-mint-100 text-mint-700' };
    }
    if (b.paymentStatus === 'FAILED') return { label: 'Paiement echoue', class: 'bg-red-100 text-red-700' };
    return { label: b.status, class: 'bg-gray-100 text-gray-600' };
  };

  const getCountdown = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target - now;
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `Dans ${days}j ${hours}h`;
    if (hours > 0) return `Dans ${hours}h`;
    return 'Bientot';
  };

  const canPay = (b) => b.status === 'CONFIRMED' && b.paymentStatus !== 'SUCCESS';
  const canCancel = (b) => b.status === 'PENDING' || (b.status === 'CONFIRMED' && b.paymentStatus !== 'SUCCESS');
  const canReview = (b) => b.status === 'COMPLETED' && !b.review;

  if (!user) return null;

  return (
    <>
      <Navbar />

      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-soft-xl animate-fade-in-down max-w-md ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-mint-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span>{toast.type === 'error' ? '❌' : '✅'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream via-coral-50 to-mint-50 relative overflow-hidden">
        <div className="blob w-96 h-96 bg-coral-300 -top-20 -right-20"></div>
        <div className="blob w-80 h-80 bg-mint-300 bottom-0 -left-20"></div>

        <div className="container-custom relative z-10">
          <Reveal>
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-300 to-sun-300 flex items-center justify-center text-3xl">
                  👋
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold">Bonjour {user.firstName || 'cher parent'} !</h1>
                  <p className="text-gray-500">Bienvenue sur votre espace NounouHome</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/nannies" className="btn-primary !py-2 !px-4 !text-sm">
                  ➕ Nouvelle reservation
                </Link>
                <button onClick={logout} className="btn-outline !py-2 !px-4 !text-sm">
                  👋 Deconnexion
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Reservations', value: stats.total, icon: '📅' },
              { label: 'Payees', value: stats.paid, icon: '✅' },
              { label: 'En attente', value: stats.pending, icon: '⏳' },
              { label: 'Total depense', value: `${stats.spent.toFixed(0)} F`, icon: '💰' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl shadow-soft p-4 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-extrabold text-gray-800">{loading ? '—' : s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="bg-white rounded-3xl shadow-soft-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">📋 Mes reservations</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'ALL', label: 'Toutes', count: stats.total },
                  { id: 'PENDING', label: 'En attente nounou', count: stats.pending },
                  { id: 'TO_PAY', label: 'A payer' },
                  { id: 'PAID', label: 'Payees', count: stats.paid },
                  { id: 'COMPLETED', label: 'Terminees' },
                  { id: 'CANCELLED', label: 'Refusees' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      filter === f.id ? 'bg-coral-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                    {f.count !== undefined && (
                      <span className={`ml-2 text-xs ${filter === f.id ? 'opacity-90' : 'opacity-60'}`}>{f.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-7xl mb-4 animate-float">{filter === 'ALL' ? '🗓️' : '🔍'}</div>
                  <p className="text-gray-500 mb-6">
                    {filter === 'ALL' ? 'Aucune reservation pour le moment.' : 'Aucune reservation dans cette categorie.'}
                  </p>
                  {filter === 'ALL' && (
                    <Link href="/nannies" className="btn-mint">🔍 Trouver une nounou</Link>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredBookings.map((b) => {
                    const status = getStatusInfo(b);
                    const countdown = getCountdown(b.startDate);

                    return (
                      <li
                        key={b.id}
                        className="border-2 border-gray-100 hover:border-coral-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-soft"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-200 to-sky-200 flex items-center justify-center text-2xl shrink-0">
                              👩‍🍼
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-800">
                                  {b.nanny?.user?.firstName} {b.nanny?.user?.lastName}
                                </h3>
                                <span className={`badge ${status.class} !text-[10px]`}>{status.label}</span>
                                {countdown && (
                                  <span className="badge bg-coral-100 text-coral-700 !text-[10px]">⏰ {countdown}</span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 space-y-0.5">
                                <div>
                                  📅 {new Date(b.startDate).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                  })} → {new Date(b.endDate).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                  })}
                                </div>
                                {b.notes && <div className="text-xs text-gray-500 italic truncate">💬 {b.notes}</div>}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="text-right">
                              <div className="text-xl font-extrabold text-coral-600">{b.totalPrice?.toFixed(0)} F</div>
                              <div className="text-xs text-gray-500">{b.type}</div>
                            </div>

                            <div className="flex gap-2">
                              {b.status === 'PENDING' && (
                                <span className="badge bg-sun-100 text-sun-700 !text-[10px] whitespace-nowrap">
                                  ⏳ Attente nounou
                                </span>
                              )}
                              {canPay(b) && (
                                <Link href={`/bookings/${b.id}/pay`} className="btn-primary !py-2 !px-4 !text-xs whitespace-nowrap">
                                  💳 Payer
                                </Link>
                              )}
                              {canReview(b) && (
                                <button onClick={() => setReviewModal(b)} className="btn-mint !py-2 !px-4 !text-xs whitespace-nowrap">
                                  ⭐ Noter
                                </button>
                              )}
                              {canCancel(b) && (
                                <button
                                  onClick={() => setCancelModal(b)}
                                  className="btn-outline !py-2 !px-4 !text-xs whitespace-nowrap hover:!border-red-300 hover:!text-red-500"
                                >
                                  ✖ Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </main>

      {cancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setCancelModal(null)}
        >
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-5xl mx-auto mb-4">⚠️</div>
              <h2 className="text-2xl font-extrabold mb-2">Annuler cette reservation ?</h2>
              <p className="text-gray-600 text-sm">La nounou sera notifiee immediatement.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} disabled={actionLoading} className="btn-outline flex-1 !py-3">
                Garder
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full shadow-soft-lg disabled:opacity-50"
              >
                {actionLoading ? '⏳...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setReviewModal(null)}
        >
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sun-100 to-sun-300 flex items-center justify-center text-5xl mx-auto mb-4">⭐</div>
              <h2 className="text-2xl font-extrabold mb-1">Notez la nounou</h2>
              <p className="text-gray-500 text-sm">
                {reviewModal.nanny?.user?.firstName} {reviewModal.nanny?.user?.lastName}
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`text-4xl transition-transform duration-200 hover:scale-125 ${
                    star <= reviewData.rating ? 'text-sun-500' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows="4"
              placeholder="Partagez votre experience..."
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              className="input-modern resize-none mb-4"
            />

            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} disabled={actionLoading} className="btn-outline flex-1 !py-3">
                Annuler
              </button>
              <button
                onClick={handleReview}
                disabled={actionLoading || reviewData.rating < 1}
                className="btn-primary flex-1 !py-3 disabled:opacity-50"
              >
                {actionLoading ? '⏳...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}