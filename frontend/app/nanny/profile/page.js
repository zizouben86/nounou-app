'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

const LANGUES = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Douala', 'Bamiliké', 'Ewondo'];
const CERTIFICATIONS = ['CAP Petite Enfance', 'BAFA', 'PSC1', 'Auxiliaire de puériculture', 'Assistante maternelle'];

export default function NannyProfileEdit() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    hourlyRate: 15,
    experienceYears: 0,
    city: '',
    postalCode: '',
    languages: [],
    certifications: [],
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'NANNY') return router.push('/dashboard');
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    api.get('/nannies/me')
      .then(({ data }) => {
        setProfile(data);
        setForm({
          bio: data.bio || '',
          hourlyRate: data.hourlyRate || 15,
          experienceYears: data.experienceYears || 0,
          city: data.city || '',
          postalCode: data.postalCode || '',
          languages: data.languages || [],
          certifications: data.certifications || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const toggleItem = (field, value) => {
    const current = form[field] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setForm({ ...form, [field]: updated });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/nannies/me', form);
      setSaved(true);
      alert('✅ Profil mis à jour !');
      
      // Redirection vers le dashboard nounou après 1,5 seconde
      setTimeout(() => {
        router.push('/nanny/dashboard');
      }, 1500);
      
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      setSaving(false);
    }
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      await api.post('/nannies/me/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { data } = await api.get('/nannies/me');
      setProfile(data);
      alert('✅ Document envoyé avec succès !');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l envoi');
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container-custom max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-white rounded-3xl"></div>
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
        <div className="container-custom max-w-4xl">

          <div className="mb-6">
            <Link
              href="/nanny/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-3 transition-colors"
            >
              ← Retour au dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Mon profil
            </h1>
            <p className="text-gray-600 mt-1">
              Compléter votre profil augmente vos chances d'être contactée
            </p>
          </div>

          {/* Barre de progression */}
          <div className="bg-white rounded-3xl shadow-soft p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Complétion du profil
              </span>
              <span className="text-sm font-bold text-coral-600">
                {calculateCompletion(form)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral-500 to-sun-500 transition-all duration-500"
                style={{ width: calculateCompletion(form) + '%' }}
              />
            </div>
          </div>

          <form onSubmit={save} className="space-y-6">

            {/* Bio */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <label className="block font-bold text-lg mb-3 flex items-center gap-2">
                📝 À propos de moi
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="input-modern"
                rows={5}
                placeholder="Décrivez votre expérience, votre approche avec les enfants, vos qualités..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {form.bio.length}/500 caractères
              </p>
            </div>

            {/* Section Vérification */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                🛡️ Vérification d'identité
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pour rassurer les parents, veuillez fournir vos documents. Vos informations restent confidentielles.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Pièce d'identité (CNI/Passeport) *</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('idCard', e.target.files[0])}
                    className="input-modern"
                  />
                  {profile?.idCardUrl && <span className="text-xs text-mint-600 mt-1 block">✅ Document déjà fourni</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Casier judiciaire (moins de 3 mois) *</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('criminalRecord', e.target.files[0])}
                    className="input-modern"
                  />
                  {profile?.criminalRecordUrl && <span className="text-xs text-mint-600 mt-1 block">✅ Document déjà fourni</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Diplômes (optionnel)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('diploma', e.target.files[0])}
                    className="input-modern"
                  />
                  {profile?.diplomaUrl && <span className="text-xs text-mint-600 mt-1 block">✅ Document déjà fourni</span>}
                </div>
              </div>
            </div>

            {/* Tarif et expérience */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-soft p-6">
                <label className="block font-bold text-lg mb-3">
                  💰 Tarif horaire
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="input-modern !pr-20"
                    min="1"
                    max="50000"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    FCFA/h
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-soft p-6">
                <label className="block font-bold text-lg mb-3">
                  🎓 Années d'expérience
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: parseInt(e.target.value) || 0 })}
                    className="input-modern !pr-20"
                    min="0"
                    max="50"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    an(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Ville */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <label className="block font-bold text-lg mb-3 flex items-center gap-2">
                📍 Localisation
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ville (ex: Douala)"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-modern"
                  required
                />
                <input
                  type="text"
                  placeholder="Code postal (ex: 00000)"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="input-modern"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Changez votre ville mettra à jour votre position sur la carte
              </p>
            </div>

            {/* Langues */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <label className="block font-bold text-lg mb-4">
                🗣️ Langues parlées
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUES.map((lang) => {
                  const selected = form.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem('languages', lang)}
                      className={
                        'px-4 py-2 rounded-full font-medium transition-all ' +
                        (selected
                          ? 'bg-coral-500 text-white shadow-soft'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }
                    >
                      {selected ? '✓ ' : '+ '}{lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <label className="block font-bold text-lg mb-4">
                🎓 Diplômes et certifications
              </label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => {
                  const selected = form.certifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleItem('certifications', cert)}
                      className={
                        'px-4 py-2 rounded-full font-medium transition-all ' +
                        (selected
                          ? 'bg-mint-500 text-white shadow-soft'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }
                    >
                      {selected ? '✓ ' : '+ '}{cert}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-4 bg-white rounded-3xl shadow-soft-xl p-4 flex flex-col md:flex-row gap-3">
              <Link href="/nanny/dashboard" className="btn-outline flex-1">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {saving ? '⏳ Sauvegarde...' : saved ? '✅ Enregistré !' : '💾 Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

function calculateCompletion(form) {
  let score = 0;
  const checks = [
    { value: form.bio, weight: 20, min: 50 },
    { value: form.hourlyRate, weight: 15, min: 1 },
    { value: form.experienceYears, weight: 10, min: 0 },
    { value: form.city, weight: 15, min: 1 },
    { value: form.postalCode, weight: 5, min: 1 },
    { value: form.languages, weight: 15, min: 1 },
    { value: form.certifications, weight: 20, min: 1 },
  ];

  checks.forEach((check) => {
    if (Array.isArray(check.value)) {
      if (check.value.length >= check.min) score += check.weight;
    } else if (typeof check.value === 'string') {
      if (check.value.length >= check.min) score += check.weight;
    } else if (typeof check.value === 'number') {
      if (check.value >= check.min) score += check.weight;
    }
  });

  return Math.min(100, score);
}