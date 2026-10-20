'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Lien invalide : token manquant');
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10">

            {success ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-extrabold mb-3">
                  Mot de passe modifie !
                </h1>
                <p className="text-gray-600 mb-6">
                  Vous allez etre redirige vers la page de connexion...
                </p>
                <Link href="/login" className="btn-primary w-full">
                  Se connecter maintenant
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-3">🔑</div>
                  <h1 className="text-2xl font-extrabold mb-2">
                    Nouveau mot de passe
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Choisissez un mot de passe fort (min. 8 caracteres).
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="input-modern"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Confirmez le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      className="input-modern"
                      required
                      minLength={8}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? '⏳ Modification...' : '🔐 Reinitialiser'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-coral-600 hover:underline font-semibold"
                  >
                    ← Retour a la connexion
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}