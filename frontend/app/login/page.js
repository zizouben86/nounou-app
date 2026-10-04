'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirection selon le role
      if (data.user.role === 'NANNY') {
        router.push('/nanny/dashboard');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Cote visuel */}
      <div className="hidden md:flex relative items-center justify-center overflow-hidden bg-gradient-to-br from-coral-500 to-sun-500">
        <div className="blob w-96 h-96 bg-white/20 -top-20 -left-20"></div>
        <div className="blob w-80 h-80 bg-mint-300/30 bottom-0 right-0"></div>
        <img
          src="https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=800&auto=format&fit=crop&q=80"
          alt="Nounou"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-white p-12 text-center">
          <div className="text-7xl mb-6 animate-float">🍼</div>
          <h2 className="text-4xl font-extrabold mb-4">Bon retour !</h2>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            Connectez-vous pour retrouver vos nounous et reservations.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center p-8 bg-cream relative overflow-hidden">
        <div className="blob w-72 h-72 bg-sun-300 -top-20 -right-20"></div>
        <div className="blob w-64 h-64 bg-mint-300 -bottom-20 -left-20"></div>

        <form
          onSubmit={submit}
          className="bg-white p-10 rounded-3xl shadow-soft-xl w-full max-w-md space-y-5 relative z-10 animate-fade-in-up"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍼</span>
            <span className="text-xl font-bold bg-gradient-to-r from-coral-500 to-sun-500 bg-clip-text text-transparent">
              NounouHome
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-800">Connexion</h1>
          <p className="text-gray-500">Ravi de vous revoir !</p>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-modern"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Mot de passe</label>
            <input
              type="password"
              placeholder="..."
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-modern"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-4 disabled:opacity-50">
            {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-coral-600 font-semibold hover:underline">
              Creer un compte
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}