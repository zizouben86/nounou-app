'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function NannyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'NANNY') return router.push('/dashboard');
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    // On utilise Promise.allSettled pour ne pas planter si une route echoue
    Promise.allSettled([
      api.get('/bookings/me'),
      api.get('/nannies/me'),
    ]).then((results) => {
      // 1. Traitement des reservations
      if (results[0].status === 'fulfilled') {
        const bookingsData = results[0].value.data || [];
        setBookings(bookingsData);
        
        const stats = {
          total: bookingsData.length,
          pending: bookingsData.filter((b) => b.status === 'PENDING').length,
          confirmed: bookingsData.filter((b) => b.status === 'CONFIRMED').length,
          completed: bookingsData.filter((b) => b.status === 'COMPLETED').length,
          revenue: bookingsData
            .filter((b) => b.status === 'COMPLETED')
            .reduce((sum, b) => sum + b.totalPrice * 0.85, 0),
        };
        setStats(stats);
      } else {
        console.error("Erreur chargement bookings:", results[0].reason);
      }

      // 2. Traitement du profil
      if (results[1].status === 'fulfilled') {
        setProfile(results[1].value.data);
      } else {
        console.error("Erreur chargement profil:", results[1].reason);
      }

      setLoading(false);
    });
  }, [user]);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch('/bookings/' + bookingId + '/status', { status });
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      alert('Statut mis a jour');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const statusColors = {
    PENDING: 'bg-sun-100 text-sun-700',
    CONFIRMED: 'bg-mint-100 text-mint-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
    COMPLETED: 'bg-sky-100 text-sky-700',
  };

  const statusLabels = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmee',
    CANCELLED: 'Annulee',
    COMPLETED: 'Terminee',
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container-custom max-w-6xl">
            <div className="animate-pulse space-y-6">
              <div className="h-40 bg-white rounded-3xl"></div>
              <div className="h-96 bg-white rounded-3xl"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom max-w-6xl">

          {/* Header */}
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-4xl shadow-soft">
                  👩‍🍼
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    Bonjour {user.firstName} !
                  </h1>
                  <p className="text-gray-500">
                    Voici un apercu de votre activite sur NounouHome
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/nanny/profile" className="btn-secondary !py-2 !px-4 !text-sm">
                  ✏️ Modifier mon profil
                </Link>
                <button onClick={logout} className="btn-outline !py-2 !px-4 !text-sm">
                  👋 Deconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-3xl shadow-soft p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-coral-100 flex items-center justify-center text-xl">
                  📅
                </div>
                <div className="text-xs text-gray-500 font-semibold uppercase">
                  Reservations
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">
                {stats.total}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-sun-100 flex items-center justify-center text-xl">
                  ⏳
                </div>
                <div className="text-xs text-gray-500 font-semibold uppercase">
                  En attente
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">
                {stats.pending}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center text-xl">
                  ✅
                </div>
                <div className="text-xs text-gray-500 font-semibold uppercase">
                  Terminees
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">
                {stats.completed}
              </div>
            </div>

            <div className="bg-gradient-to-br from-coral-500 to-sun-500 rounded-3xl shadow-soft-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                  💰
                </div>
                <div className="text-xs font-semibold uppercase opacity-90">
                  Revenus
                </div>
              </div>
              <div className="text-3xl font-extrabold">
                {stats.revenue.toFixed(0)} EUR
              </div>
            </div>
          </div>

          {/* Reservations */}
          <div className="bg-white rounded-3xl shadow-soft-xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              📋 Mes reservations
            </h2>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-float">📭</div>
                <p className="text-gray-500">
                  Aucune reservation pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-2 border-gray-100 hover:border-coral-300 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-100 to-sun-100 flex items-center justify-center text-xl shrink-0">
                          👤
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900">
                              {booking.parent?.user?.firstName} {booking.parent?.user?.lastName}
                            </h3>
                            <span className={'badge ' + (statusColors[booking.status] || 'bg-gray-100')}>
                              {statusLabels[booking.status] || booking.status}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 space-y-0.5">
                            <div>
                              📅 Du {new Date(booking.startDate).toLocaleDateString('fr-FR')}
                              {' '}au {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                            </div>
                            {booking.notes && (
                              <div className="text-gray-500 italic">
                                💬 {booking.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-coral-600">
                            {booking.totalPrice.toFixed(0)} EUR
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 md:ml-4">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              className="btn-mint !py-2 !px-4 !text-sm"
                            >
                              ✅ Accepter
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              className="btn-outline !py-2 !px-4 !text-sm"
                            >
                              ❌ Refuser
                            </button>
                          </>
                        )}

                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                            className="btn-primary !py-2 !px-4 !text-sm"
                          >
                            🎉 Marquer terminee
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}