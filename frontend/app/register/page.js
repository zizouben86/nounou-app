'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'PARENT',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Formulaire */}
      <div className="flex items-center justify-center p-8 bg-cream relative overflow-hidden order-2 md:order-1">
        <div className="blob w-72 h-72 bg-coral-300 -top-20 -left-20"></div>
        <div className="blob w-64 h-64 bg-mint-300 -bottom-20 -right-20"></div>

        <form
          onSubmit={submit}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-5 relative z-10 animate-fade-in-up"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <span className="text-3xl group-hover:animate-wiggle inline-block">🍼</span>
            <span className="text-xl font-bold bg-gradient-to-r from-coral-500 to-sun-500 bg-clip-text text-transparent">
              NounouHome
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-800">
            Créez votre compte 🎉
          </h1>
          <p className="text-gray-500">Rejoignez la communauté en 1 minute.</p>

          {/* Choix du rôle */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Je suis…
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'PARENT', label: 'Parent', icon: '👨‍👩‍👧' },
                { value: 'NANNY', label: 'Nounou', icon: '👩‍🍼' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`py-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                    form.role === r.value
                      ? 'border-coral-500 bg-coral-50 text-coral-600 scale-105 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-coral-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{r.icon}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="input-modern"
              required
            />
            <input
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="input-modern"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-modern"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe (min 8 caractères)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-modern"
            required
          />

          <button disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? '⏳ Création...' : '✨ Créer mon compte'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-coral-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>

      {/* Côté image */}
      <div className="hidden md:flex relative items-center justify-center overflow-hidden bg-gradient-to-br from-mint-500 to-sky-500 order-1 md:order-2">
        <div className="blob w-96 h-96 bg-white/20 -top-20 -right-20"></div>
        <div className="blob w-80 h-80 bg-coral-300/30 bottom-0 left-0"></div>

        <img
          src="https://images.unsplash.com/photo-1543342384-1f1350e27861?w=800&auto=format&fit=crop&q=80"
          alt="Enfants heureux"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <div className="relative z-10 text-white p-12 text-center">
          <div className="text-7xl mb-6 animate-float">💛</div>
          <h2 className="text-4xl font-extrabold mb-4">
            Rejoignez NounouHome
          </h2>
          <p className="text-lg opacity-90 max-w-md mx-auto mb-6">
            Des milliers de familles et de nounous nous font déjà confiance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🔍 Recherche facile', '✅ Profils vérifiés', '💬 Messagerie', '🔒 Paiement sécurisé'].map((f, i) => (
              <span key={i} className="badge bg-white/20 backdrop-blur text-white">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}