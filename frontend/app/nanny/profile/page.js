'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function NannyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    bio: '',
    hourlyRate: 15,
    experienceYears: 0,
    city: '',
    postalCode: '',
    languagesInput: '',
    certificationsInput: '',
  });

  // Chargement
  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return router.push('/login');
        const u = JSON.parse(stored);
        if (u.role !== 'NANNY') return router.push('/dashboard');

        const { data } = await api.get('/nanny/me/profile');
        setForm({
          bio: data.bio || '',
          hourlyRate: data.hourlyRate || 15,
          experienceYears: data.experienceYears || 0,
          city: data.city || '',
          postalCode: data.postalCode || '',
          languagesInput: (data.languages || []).join(', '),
          certificationsInput: (data.certifications || []).join(', '),
        });
      } catch (err) {
        showToast('Erreur de chargement', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const languages = form.languagesInput
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const certifications = form.certificationsInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      await api.put('/nanny/me/profile', {
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate),
        experienceYears: Number(form.experienceYears),
        city: form.city,
        postalCode: form.postalCode,
        languages,
        certifications,
      });
      showToast('Profil mis a jour !');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen bg-cream">
          <div className="container-custom text-center">
            <div className="text-6xl animate-spin inline-block">⏳</div>
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
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-soft-xl animate-fade-in-down ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-mint-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>{toast.type === 'error' ? '❌' : '✅'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom max-w-3xl">

          <Link
            href="/nanny/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-coral-500 mb-6"
          >
            ← Retour au tableau de bord
          </Link>

          <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-3xl">
                ⚙️
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Mon profil nounou</h1>
                <p className="text-sm text-gray-500">
                  Ces informations sont visibles par les parents
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  📝 Bio / Presentation
                </label>
                <textarea
                  rows="4"
                  placeholder="Decrivez votre experience, votre approche avec les enfants..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input-modern resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    💰 Tarif horaire (FCFA)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    🎓 Annees d&apos;experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    📍 Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Douala"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    🌍 Langues (separees par virgule)
                  </label>
                  <input
                    type="text"
                    placeholder="Francais, Anglais"
                    value={form.languagesInput}
                    onChange={(e) => setForm({ ...form, languagesInput: e.target.value })}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    🎓 Certifications
                  </label>
                  <input
                    type="text"
                    placeholder="CAP Petite Enfance, PSC1"
                    value={form.certificationsInput}
                    onChange={(e) => setForm({ ...form, certificationsInput: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full !py-4 disabled:opacity-50"
              >
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}