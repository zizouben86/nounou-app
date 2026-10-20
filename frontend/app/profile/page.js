'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [children, setChildren] = useState([]);
  const [childModal, setChildModal] = useState(false);
  const [newChild, setNewChild] = useState({
    firstName: '',
    birthDate: '',
    allergies: '',
    specialNeeds: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    api.get('/users/me')
      .then(({ data }) => {
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.parentProfile?.address || '',
          city: data.parentProfile?.city || '',
          postalCode: data.parentProfile?.postalCode || '',
        });
        setChildren(data.parentProfile?.children || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', form);
      alert('✅ Profil mis a jour !');

      // Rafraichir les donnees locales
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.firstName = form.firstName;
      stored.lastName = form.lastName;
      localStorage.setItem('user', JSON.stringify(stored));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const addChild = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/me/children', newChild);
      setChildren([...children, data]);
      setChildModal(false);
      setNewChild({ firstName: '', birthDate: '', allergies: '', specialNeeds: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const deleteChild = async (childId) => {
    if (!confirm('Supprimer cet enfant ?')) return;
    try {
      await api.delete('/users/me/children/' + childId);
      setChildren(children.filter((c) => c.id !== childId));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years === 0) return months + ' mois';
    return years + ' an' + (years > 1 ? 's' : '');
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container-custom max-w-3xl">
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

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-coral-50">
        <div className="container-custom max-w-3xl">

          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-3 transition-colors"
            >
              ← Retour au dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Mon profil
            </h1>
            <p className="text-gray-600 mt-1">
              Gerez vos informations personnelles et vos enfants
            </p>
          </div>

          {/* Formulaire profil */}
          <form onSubmit={save} className="bg-white rounded-3xl shadow-soft-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral-300 to-sun-300 flex items-center justify-center text-4xl shadow-soft">
                👤
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {form.firstName} {form.lastName}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Prenom</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nom</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Telephone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-modern"
                placeholder="6XX XXX XXX"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Adresse</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-modern"
                placeholder="123 rue de la Paix"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Ville</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-modern"
                  placeholder="Douala"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Code postal</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="input-modern"
                  placeholder="00000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:opacity-50"
            >
              {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer les modifications'}
            </button>
          </form>

          {/* Enfants */}
          <div className="bg-white rounded-3xl shadow-soft-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                👶 Mes enfants
              </h2>
              <button
                onClick={() => setChildModal(true)}
                className="btn-primary !py-2 !px-4 !text-sm"
              >
                ➕ Ajouter
              </button>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-5xl mb-3">👶</div>
                <p className="text-sm">Aucun enfant enregistre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="border-2 border-gray-100 hover:border-coral-300 rounded-2xl p-4 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-100 to-sun-100 flex items-center justify-center text-xl">
                        👶
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {child.firstName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateAge(child.birthDate)}
                          {child.allergies && ' • Allergies : ' + child.allergies}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChild(child.id)}
                      className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal ajout enfant */}
      {childModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setChildModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Ajouter un enfant</h2>

            <form onSubmit={addChild} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Prenom *</label>
                <input
                  type="text"
                  value={newChild.firstName}
                  onChange={(e) => setNewChild({ ...newChild, firstName: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={newChild.birthDate}
                  onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Allergies (optionnel)
                </label>
                <input
                  type="text"
                  value={newChild.allergies}
                  onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                  className="input-modern"
                  placeholder="Arachides, lactose..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Besoins specifiques (optionnel)
                </label>
                <textarea
                  value={newChild.specialNeeds}
                  onChange={(e) => setNewChild({ ...newChild, specialNeeds: e.target.value })}
                  className="input-modern"
                  rows={2}
                  placeholder="Traitement, handicap, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setChildModal(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1">
                  ➕ Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}