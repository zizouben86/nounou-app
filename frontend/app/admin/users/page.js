'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = filter !== 'all' ? { role: filter } : {};
    api.get('/admin/users', { params })
      .then(({ data }) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateRole = async (userId, newRole) => {
    if (!confirm('Changer le role de cet utilisateur ?')) return;
    try {
      await api.patch('/admin/users/' + userId + '/role', { role: newRole });
      setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm('Supprimer ' + name + ' ? Cette action est irreversible.')) return;
    try {
      await api.delete('/admin/users/' + userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(s) ||
      u.firstName?.toLowerCase().includes(s) ||
      u.lastName?.toLowerCase().includes(s)
    );
  });

  const roleBadge = (role) => {
    if (role === 'ADMIN') return 'bg-coral-100 text-coral-700';
    if (role === 'NANNY') return 'bg-mint-100 text-mint-700';
    return 'bg-sky-100 text-sky-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h1 className="text-3xl font-extrabold mb-2">Utilisateurs</h1>
        <p className="text-gray-600">Gerez les comptes parents, nounous et admins</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-3xl shadow-soft p-4 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-modern flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'PARENT', label: 'Parents' },
            { value: 'NANNY', label: 'Nounous' },
            { value: 'ADMIN', label: 'Admins' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={'px-4 py-2.5 rounded-full font-semibold text-sm transition-all ' + (filter === f.value ? 'bg-coral-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center text-gray-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-3">👥</div>
          <p className="text-gray-600">Aucun utilisateur trouve</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left p-4 font-semibold">Nom</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Inscription</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-cream-50">
                    <td className="p-4 font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className={'text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ' + roleBadge(u.role)}
                      >
                        <option value="PARENT">PARENT</option>
                        <option value="NANNY">NANNY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteUser(u.id, u.firstName + ' ' + u.lastName)}
                        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors ml-auto"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}