'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import Navbar from '../../../components/Navbar';
import Reveal from '../../../components/Reveal';
import Icon from '../../../components/Icon';

export default function NannyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [cancelledIds, setCancelledIds] = useState([]);

  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) setFilter(urlFilter);
  }, [searchParams]);

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

  // ═══════════════════════════════════════════════════════
  //  Socket : ecouter les annulations de reservation
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleBookingCancelled = (data) => {
      console.log('[Socket] Reservation annulee :', data);

      // 1. Retirer la ligne du state
      setBookings((prev) => prev.filter((b) => b.id !== data.bookingId));

      // 2. Ajouter a la liste des annulations (pour animation)
      setCancelledIds((prev) => [...prev, data.bookingId]);

      // 3. Toast
      setToast({
        message: `${data.parentName} a annule la reservation`,
        type: 'warning',
      });
      setTimeout(() => setToast(null), 5000);

      // 4. Recharger les stats (le compteur change)
      setTimeout(() => {
        loadStats();
      }, 500);

      // 5. Retirer de cancelledIds apres animation
      setTimeout(() => {
        setCancelledIds((prev) => prev.filter((id) => id !== data.bookingId));
      }, 3000);
    };

    socket.on('booking:cancelled', handleBookingCancelled);

    return () => {
      socket.off('booking:cancelled', handleBookingCancelled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const loadStats = async () => {
    try {
      const { data } = await api.get('/nanny/me/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
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

      // Animation de retrait si refus
      if (action === 'refuse') {
        setCancelledIds((prev) => [...prev, bookingId]);
        setBookings((prev) => prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ));
      }

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
    if (b.status === 'CANCELLED') return { label: 'Annulee', class: 'bg-red-100 text-red-700', icon: 'xCircle' };
    if (b.status === 'COMPLETED') return { label: 'Terminee', class: 'bg-sky-100 text-sky-700', icon: 'checkCircle' };
    if (b.status === 'CONFIRMED') return { label: 'Confirmee', class: 'bg-mint-100 text-mint-700', icon: 'checkCircle' };
    return { label: 'En attente', class: 'bg-sun-100 text-sun-700', icon: 'clock' };
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
            <Icon name="loader" size={56} className="animate-spin text-coral-500 mx-auto mb-4" />
            <p className="text-gray-500">Chargement de votre espace...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-soft-xl animate-fade-in-down max-w-md ${
            toast.type === 'error'
              ? 'bg-red-500 text-white'
              : toast.type === 'warning'
              ? 'bg-sun-500 text-white'
              : 'bg-mint-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Icon
              name={toast.type === 'error' ? 'xCircle' : toast.type === 'warning' ? 'alert' : 'checkCircle'}
              size={18}
            />
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
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-white shadow-soft-lg">
                    <Icon name="baby" size={40} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                      Bonjour {user.firstName} !
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`badge flex items-center gap-1 ${
                          profile?.isAvailable ? 'badge-mint' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon name="checkCircle" size={12} />
                        {profile?.isAvailable ? 'Disponible' : 'Indisponible'}
                      </span>
                      {profile?.verificationStatus === 'VERIFIED' && (
                        <span className="badge-mint flex items-center gap-1">
                          <Icon name="verified" size={12} />
                          Profil verifie
                        </span>
                      )}
                      {profile?.ratingCount > 0 && (
                        <span className="badge-sun flex items-center gap-1">
                          <Icon name="star" size={12} fill="currentColor" />
                          {profile.ratingAvg.toFixed(1)} ({profile.ratingCount} avis)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={toggleAvailability}
                    className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
                  >
                    <Icon name={profile?.isAvailable ? 'eyeOff' : 'eye'} size={16} />
                    {profile?.isAvailable ? 'Me rendre indisponible' : 'Me rendre disponible'}
                  </button>
                  <Link
                    href="/nanny/profile"
                    className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2"
                  >
                    <Icon name="settings" size={16} />
                    Mon profil
                  </Link>
                  <button
                    onClick={logout}
                    className="btn-outline !py-2 !px-4 !text-sm flex items-center gap-2"
                  >
                    <Icon name="logout" size={16} />
                    Deconnexion
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'En attente', value: stats?.bookings.pending || 0, icon: 'clock', color: 'sun' },
              { label: 'Confirmees', value: stats?.bookings.confirmed || 0, icon: 'checkCircle', color: 'mint' },
              { label: 'Terminees', value: stats?.bookings.completed || 0, icon: 'award', color: 'sky' },
              { label: 'Revenus nets', value: `${stats?.revenue.net.toFixed(0) || 0} F`, icon: 'wallet', color: 'coral' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl shadow-soft p-5 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center text-${s.color}-600 mb-3`}>
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="bg-white rounded-3xl shadow-soft-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="calendar" size={22} />
                  Demandes de reservation
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'PENDING', label: 'En attente', count: stats?.bookings.pending },
                  { id: 'CONFIRMED', label: 'Confirmees', count: stats?.bookings.confirmed },
                  { id: 'COMPLETED', label: 'Terminees', count: stats?.bookings.completed },
                  { id: 'CANCELLED', label: 'Annulees', count: stats?.bookings.cancelled },
                  { id: 'ALL', label: 'Toutes', count: stats?.bookings.total },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      filter === f.id
                        ? 'bg-coral-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                    {f.count !== undefined && (
                      <span className={`ml-2 text-xs ${filter === f.id ? 'opacity-90' : 'opacity-60'}`}>
                        {f.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Icon name="calendar" size={72} className="text-gray-300 mx-auto mb-4 animate-float" />
                  <p className="text-gray-500 mb-2">
                    {filter === 'PENDING'
                      ? 'Aucune nouvelle demande pour le moment.'
                      : 'Aucune reservation dans cette categorie.'}
                  </p>
                  {filter === 'PENDING' && !profile?.isAvailable && (
                    <p className="text-sm text-gray-400">
                      Passez en mode disponible pour recevoir des demandes.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredBookings.map((b) => {
                    const status = getStatusInfo(b);
                    const parent = b.parent?.user;
                    const isPaid = b.paymentStatus === 'SUCCESS';
                    const isCancelled = cancelledIds.includes(b.id);

                    return (
                      <li
                        key={b.id}
                        className={`border-2 rounded-2xl p-5 transition-all duration-500 ${
                          isCancelled
                            ? 'border-red-200 bg-red-50/50 opacity-60 scale-95'
                            : 'border-gray-100 hover:border-coral-200 hover:shadow-soft'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-200 to-sun-200 flex items-center justify-center text-coral-700 shrink-0">
                              <Icon name="users" size={26} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-800">
                                  {parent?.firstName} {parent?.lastName}
                                </h3>
                                <span className={`badge ${status.class} !text-[10px] flex items-center gap-1`}>
                                  <Icon name={status.icon} size={10} />
                                  {status.label}
                                </span>
                                {isPaid && b.status !== 'CANCELLED' && (
                                  <span className="badge bg-mint-500 text-white !text-[10px] flex items-center gap-1">
                                    <Icon name="wallet" size={10} />
                                    Paye
                                  </span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 space-y-1 mt-2">
                                <div className="flex items-center gap-2">
                                  <Icon name="calendar" size={14} className="text-gray-400 shrink-0" />
                                  <span>
                                    {new Date(b.startDate).toLocaleDateString('fr-FR', {
                                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })} - {new Date(b.endDate).toLocaleDateString('fr-FR', {
                                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })}
                                  </span>
                                </div>

                                {parent?.phone && (
                                  <div className="flex items-center gap-2">
                                    <Icon name="phone" size={14} className="text-gray-400 shrink-0" />
                                    <span>{parent.phone}</span>
                                  </div>
                                )}

                                {b.notes && (
                                  <div className="flex items-start gap-2 text-xs text-gray-500 italic">
                                    <Icon name="message" size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                    <span>{b.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-stretch sm:items-end gap-3 lg:min-w-[220px]">
                            <div className="text-right">
                              <div className="text-2xl font-extrabold text-coral-600">
                                {b.totalPrice?.toFixed(0)} F
                              </div>
                              <div className="text-xs text-gray-500">{b.type}</div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {b.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => respondBooking(b.id, 'accept')}
                                    disabled={actionLoading === b.id}
                                    className="btn-mint !py-2 !px-4 !text-xs flex-1 disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    <Icon name="check" size={14} />
                                    Accepter
                                  </button>
                                  <button
                                    onClick={() => respondBooking(b.id, 'refuse')}
                                    disabled={actionLoading === b.id}
                                    className="btn-outline !py-2 !px-4 !text-xs flex-1 hover:!border-red-300 hover:!text-red-500 disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    <Icon name="close" size={14} />
                                    Refuser
                                  </button>
                                </div>
                              )}

                              {b.status === 'CONFIRMED' && isPaid && (
                                <button
                                  onClick={() => completeBooking(b.id)}
                                  disabled={actionLoading === b.id}
                                  className="btn-primary !py-2 !px-4 !text-xs disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  <Icon name="checkCircle" size={14} />
                                  Marquer terminee
                                </button>
                              )}

                              {b.status === 'CONFIRMED' && !isPaid && (
                                <div className="text-xs text-gray-500 bg-sun-50 border-2 border-dashed border-sun-200 rounded-xl px-4 py-3 text-center flex items-center gap-2 justify-center">
                                  <Icon name="clock" size={14} className="text-sun-600" />
                                  En attente du paiement
                                </div>
                              )}

                              {b.status === 'CANCELLED' && (
                                <div className="text-xs text-red-500 bg-red-50 border-2 border-dashed border-red-200 rounded-xl px-4 py-3 text-center flex items-center gap-2 justify-center">
                                  <Icon name="xCircle" size={14} />
                                  Annulee par le parent
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
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon name="wallet" size={24} strokeWidth={2.2} />
                  </div>
                  <h2 className="text-2xl font-extrabold">Mes revenus</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                      Revenus confirmes
                    </div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.net.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Prestations terminees et payees</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                      En attente d&apos;encaissement
                    </div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.pendingNet.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Prestations a realiser</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-mint-600">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                      Total verse
                    </div>
                    <div className="text-3xl font-extrabold">
                      {stats?.revenue.net.toFixed(0)} <span className="text-lg">F</span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">Somme recue</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/nanny/profile"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-mint-600 font-semibold rounded-full hover:-translate-y-0.5 transition"
                  >
                    <Icon name="creditCard" size={18} />
                    Configurer mes paiements
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