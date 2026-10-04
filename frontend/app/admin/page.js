'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const u = JSON.parse(stored);
    if (u.role !== 'ADMIN') return router.push('/dashboard');

    api.get('/admin/stats').then(({ data }) => setStats(data));
    api.get('/admin/nannies/pending').then(({ data }) => setPending(data));
    api.get('/admin/users').then(({ data }) => setUsers(data.users));
  }, [router]);

  const verify = async (id, status) => {
    await api.patch(`/admin/nannies/${id}/verify`, { status });
    setPending(pending.filter((n) => n.id !== id));
  };

  if (!stats) return null;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 min-h-screen bg-gradient-to-br from-cream to-sky-50">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold mb-8">🛠️ Dashboard Admin</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { id: 'overview', label: '📊 Vue d\'ensemble' },
              { id: 'pending', label: `⏳ En attente (${pending.length})` },
              { id: 'users', label: '👥 Utilisateurs' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  tab === t.id ? 'bg-coral-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-coral-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '👥', label: 'Utilisateurs', value: stats.users.total, sub: `${stats.users.parents} parents · ${stats.users.nannies} nounous`, color: 'from-coral-100 to-coral-300' },
                { icon: '📅', label: 'Réservations', value: stats.bookings.total, sub: `${stats.bookings.completed} terminées`, color: 'from-mint-100 to-mint-300' },
                { icon: '💰', label: 'Chiffre d\'affaires', value: `${stats.revenue.total.toFixed(0)} €`, sub: `Commission: ${stats.revenue.commission.toFixed(0)} €`, color: 'from-sun-100 to-sun-300' },
                { icon: '⏳', label: 'À vérifier', value: stats.nannies.pending, sub: 'Nounous en attente', color: 'from-sky-100 to-sky-300' },
              ].map((c, i) => (
                <div key={i} className="card p-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl mb-4`}>
                    {c.icon}
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900">{c.value}</div>
                  <div className="font-semibold text-gray-700">{c.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'pending' && (
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center text-gray-500">
                  ✅ Aucune nounou en attente de vérification
                </div>
              ) : (
                pending.map((n) => (
                  <div key={n.id} className="bg-white rounded-3xl p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg">{n.user.firstName} {n.user.lastName}</div>
                      <div className="text-sm text-gray-500">{n.user.email}</div>
                      <div className="text-sm text-gray-500 mt-1">📍 {n.city} · {n.hourlyRate} €/h</div>
                      <p className="text-sm text-gray-600 mt-2 max-w-xl">{n.bio}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => verify(n.id, 'VERIFIED')} className="btn-mint !py-2 !px-4 !text-sm">
                        ✅ Valider
                      </button>
                      <button onClick={() => verify(n.id, 'REJECTED')} className="btn-outline !py-2 !px-4 !text-sm">
                        ❌ Refuser
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Nom</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Rôle</th>
                    <th className="text-left p-4 font-semibold">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-cream-100">
                      <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          u.role === 'ADMIN' ? 'bg-coral-100 text-coral-700' :
                          u.role === 'NANNY' ? 'bg-mint-100 text-mint-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}