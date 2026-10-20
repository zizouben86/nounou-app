'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/admin/nannies/pending').then(({ data }) => setPending(data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-white rounded-3xl"></div>
        <div className="h-64 bg-white rounded-3xl"></div>
      </div>
    );
  }

  const totalRevenue = stats.revenue?.total || 0;
  const commission = stats.revenue?.commission || 0;
  const completionRate = stats.bookings.total > 0
    ? ((stats.bookings.completed / stats.bookings.total) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h1 className="text-3xl font-extrabold mb-2">Vue d ensemble</h1>
        <p className="text-gray-600">
          Statistiques et activite de NounouHome en temps reel
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-100 to-coral-300 flex items-center justify-center text-2xl mb-4">
            👥
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.users.total}</div>
          <div className="text-sm text-gray-500 font-medium">Utilisateurs</div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.users.parents} parents · {stats.users.nannies} nounous
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-2xl mb-4">
            📅
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.bookings.total}</div>
          <div className="text-sm text-gray-500 font-medium">Reservations</div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.bookings.completed} terminees ({completionRate}%)
          </div>
        </div>

        <div className="bg-gradient-to-br from-coral-500 to-sun-500 rounded-3xl shadow-soft-xl p-6 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4">
            💰
          </div>
          <div className="text-3xl font-extrabold">{totalRevenue.toFixed(0)} F</div>
          <div className="text-sm opacity-90 font-medium">Volume total</div>
          <div className="text-xs opacity-80 mt-1">
            Commission : {commission.toFixed(0)} F
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sun-100 to-sun-300 flex items-center justify-center text-2xl mb-4">
            ⏳
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.nannies.pending}</div>
          <div className="text-sm text-gray-500 font-medium">A verifier</div>
          <div className="text-xs text-gray-400 mt-1">
            Nounous en attente
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/admin/nannies"
          className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-soft-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sun-100 to-sun-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ⏳
            </div>
            <div>
              <div className="font-bold text-gray-900">Verifier les nounous</div>
              <div className="text-sm text-gray-500">
                {pending.length} en attente
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-soft-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-100 to-coral-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👥
            </div>
            <div>
              <div className="font-bold text-gray-900">Gerer utilisateurs</div>
              <div className="text-sm text-gray-500">
                {stats.users.total} inscrits
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/bookings"
          className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-soft-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <div className="font-bold text-gray-900">Voir reservations</div>
              <div className="text-sm text-gray-500">
                {stats.bookings.total} au total
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Nounous en attente preview */}
      {pending.length > 0 && (
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">⏳ Nounous en attente de verification</h2>
            <Link href="/admin/nannies" className="text-sm text-coral-600 font-semibold hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="space-y-3">
            {pending.slice(0, 3).map((nanny) => (
              <div key={nanny.id} className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center">
                  👩‍🍼
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {nanny.user.firstName} {nanny.user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{nanny.user.email}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Inscrite le {new Date(nanny.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}