'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Reveal from '../../../components/Reveal';

export default function NannyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const u = JSON.parse(stored);

    if (u.role === 'PARENT') return router.push('/dashboard');
    if (u.role === 'ADMIN') return router.push('/admin');

    setUser(u);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, bookingsRes] = await Promise.all([
        api.get('/nanny/me/profile'),
        api.get('/nanny/me/stats'),
        api.get('/nanny/me/bookings'),
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await api.patch('/nanny/me/availability');
      setProfile({ ...profile, isAvailable: data.isAvailable });
      showToast(data.isAvailable ? 'Vous etes disponible' : 'Vous etes indisponible');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const respondBooking = async (bookingId, action) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/nanny/me/bookings/${bookingId}/respond`, { action });
      showToast(action === 'accept' ? 'Reservation acceptee !' : 'Reservation refusee');
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const completeBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/nanny/me/bookings/${bookingId}/complete`);
      showToast('Prestation terminee !');
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const getStatusInfo = (b) => {
    if (b.status === 'CANCELLED') return { label: 'Refusee', class: 'bg-gray-100 text-gray-600', icon: '✖' };
    if (b.status === 'COMPLETED') return { label: 'Terminee', class: 'bg-sky-100 text-sky-700', icon: '✓' };
    if (b.status === 'CONFIRMED') return { label: 'Confirmee', class: 'bg-mint-100 text-mint-700', icon: '✓' };
    return { label: 'En attente', class: 'bg-sun-100 text-sun-700', icon: '⏳' };
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return b.status === 'PENDING';
    if (filter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen bg-cream">
          <div className="container-custom text-center">
            <div className="text-6xl animate-spin inline-block">⏳</div>
            <p className="text-gray-500 mt-4">Chargement de votre espace...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-soft-xl animate-fade-in-down max-w-md ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-mint-500 text-white'}`}>
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span>{toast.type === 'error' ? '❌' : '✅'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream via-mint-50 to-coral-50 relative overflow-hidden">
        <div className="blob w-96 h-96 bg-mint-300 -top-20 -left-20"></div>
        <div className="blob w-80 h-80 bg-coral-300 bottom-0 -right-20"></div>

        <div className="container-custom relative z-10">
          <Reveal>
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-4xl shadow-soft-lg">
                    👩‍🍼
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Bonjour {user.firstName} !</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`badge ${profile?.isAvailable ? 'badge-mint' : 'bg-gray-100 text-gray-600'}`}>
                        {profile?.isAvailable ? '🟢 Disponible' : '⚪ Indisponible'}
                      </span>
                      {profile?.verificationStatus === 'VERIFIED' && (
                        <span className="badge-mint">✓ Profil verifie</span>
                      )}
                      {profile?.ratingCount > 0 && (
                        <span className="badge-sun">⭐ {profile.ratingAvg.toFixed(1)} ({profile.ratingCount} avis)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={toggleAvailability} className="btn-secondary !py-2 !px-4 !text-sm">
                    {profile?.isAvailable ? '⏸️ Me rendre indisponible' : '▶️ Me rendre disponible'}
                  </button>
                  <Link href="/nanny/profile" className="btn-primary !py-2 !px-4 !text-sm">
                    ⚙️ Mon profil
                  </Link>
                  <button onClick={logout} className="btn-outline !py-2 !px-4 !text-sm">
                    👋 Deconnexion
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'En attente', value: stats?.bookings.pending || 0, icon: '⏳' },
              { label: 'Confirmees', value: stats?.bookings.confirmed || 0, icon: '✅' },
              { label: 'Terminees', value: stats?.bookings.completed || 0, icon: '🏁' },
              { label: 'Revenus nets', value: `${stats?.revenue.net.toFixed(0) || 0} F`, icon: '💰' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl shadow-soft p-4 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-extrabold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="bg-white rounded-3xl shadow-soft-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">📥 Demandes de reservation</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'PENDING', label: 'En attente', count: stats?.bookings.pending },
                  { id: 'CONFIRMED', label: 'Confirmees', count: stats?.bookings.confirmed },
                  { id: 'COMPLETED', label: 'Terminees', count: stats?.bookings.completed },
                  { id: 'CANCELLED', label: 'Refusees', count: stats?.bookings.cancelled },
                  { id: 'ALL', label: 'Toutes', count: stats?.bookings.total },
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

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-7xl mb-4 animate-float">{filter === 'PENDING' ? '📭' : '🗓️'}</div>
                  <p className="text-gray-500 mb-2">
                    {filter === 'PENDING' ? 'Aucune nouvelle demande pour le moment.' : 'Aucune reservation dans cette categorie.'}
                  </p>
                  {filter === 'PENDING' && !profile?.isAvailable && (
                    <p className="text-sm text-gray-400">Passez en mode disponible pour recevoir des demandes.</p>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredBookings.map((b) => {
                    const status = getStatusInfo(b);
                    const parent = b.parent?.user;
                    const isPaid = b.paymentStatus === 'SUCCESS';

                    return (
                      <li
                        key={b.id}
                        className="border-2 border-gray-100 hover:border-coral-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-soft"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-200 to-sun-200 flex items-center justify-center text-2xl shrink-0">
                              👨‍👩‍👧
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-800">
                                  {parent?.firstName} {parent?.lastName}
                                </h3>
                                <span className={`badge ${status.class} !text-[10px]`}>
                                  {status.icon} {status.label}
                                </span>
                                {isPaid && (
                                  <span className="badge bg-mint-500 text-white !text-[10px]">💰 Paye</span>
                                )}
                                {!isPaid && b.status === 'CONFIRMED' && (
                                  <span className="badge bg-sun-100 text-sun-700 !text-[10px]">💳 Non paye</span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 space-y-1 mt-2">
                                <div className="flex items-center gap-2">
                                  <span>📅</span>
                                  <span>
                                    {new Date(b.startDate).toLocaleDateString('fr-FR', {
                                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })} → {new Date(b.endDate).toLocaleDateString('fr-FR', {
                                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })}
                                  </span>
                                </div>

                                {parent?.phone && (
                                  <div className="flex items-center gap-2">
                                    <span>📞</span>
                                    <span>{parent.phone}</span>
                                  </div>
                                )}

                                {b.parent?.children?.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span>👶</span>
                                    <span>{b.parent.children.length} enfant{b.parent.children.length > 1 ? 's' : ''}</span>
                                  </div>
                                )}

                                {b.notes && (
                                  <div className="flex items-start gap-2 text-xs text-gray-500 italic">
                                    <span>💬</span>
                                    <span>{b.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-stretch sm:items-end gap-3 lg:min-w-[220px]">
                            <div className="text-right">
                              <div className="text-2xl font-extrabold text-coral-600">{b.totalPrice?.toFixed(0)} F</div>
                              <div className="text-xs text-gray-500">{b.type}</div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {b.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => respondBooking(b.id, 'accept')}
                                    disabled={actionLoading === b.id}
                                    className="btn-mint !py-2 !px-4 !text-xs flex-1 disabled:opacity-50"
                                  >
                                    {actionLoading === b.id ? '⏳' : '✅ Accepter'}
                                  </button>
                                  <button
                                    onClick={() => respondBooking(b.id, 'refuse')}
                                    disabled={actionLoading === b.id}
                                    className="btn-outline !py-2 !px-4 !text-xs flex-1 hover:!border-red-300 hover:!text-red-500 disabled:opacity-50"
                                  >
                                    {actionLoading === b.id ? '⏳' : '❌ Refuser'}
                                  </button>
                                </div>
                              )}

                              {b.status === 'CONFIRMED' && isPaid && (
                                <button
                                  onClick={() => completeBooking(b.id)}
                                  disabled={actionLoading === b.id}
                                  className="btn-primary !py-2 !px-4 !text-xs disabled:opacity-50"
                                >
                                  {actionLoading === b.id ? '⏳' : '🏁 Marquer terminee'}
                                </button>
                              )}

                              {b.status === 'CONFIRMED' && !isPaid && (
                                <div className="text-xs text-gray-500 bg-sun-50 border-2 border-dashed border-sun-200 rounded-xl px-4 py-3 text-center">
                                  💳 En attente du paiement du parent
                                </div>
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

          <Reveal delay={300}>
            <div className="mt-8 bg-gradient-to-br from-mint-500 to-mint-600 rounded-3xl shadow-soft-xl p-8 text-white relative overflow-hidden">
              <div className="blob w-72 h-72 bg-white/20 -top-20 -right-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-4xl">💰</div>
                  <h2 className="text-2xl font-extrabold">Mes revenus</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Revenus confirmes</div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.net.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Prestations terminees et payees</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">En attente d&apos;encaissement</div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.pendingNet.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Prestations a realiser</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-mint-600">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Total verse</div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.net.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Somme recue</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/nanny/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-mint-600 font-semibold rounded-full hover:-translate-y-0.5 transition">
                    💳 Configurer mes paiements
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}