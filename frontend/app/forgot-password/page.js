'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-coral-50 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10">

            {sent ? (
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h1 className="text-2xl font-extrabold mb-3">Email envoye !</h1>
                <p className="text-gray-600 mb-6">
                  Si un compte existe pour <strong>{email}</strong>, un lien de
                  reinitialisation vient d'etre envoye.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Verifiez aussi vos spams. Le lien expire dans 1 heure.
                </p>
                <Link href="/login" className="btn-primary w-full">
                  Retour a la connexion
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-3">🔐</div>
                  <h1 className="text-2xl font-extrabold mb-2">
                    Mot de passe oublie ?
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Entrez votre email, nous vous enverrons un lien pour
                    reinitialiser votre mot de passe.
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="input-modern"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? '⏳ Envoi...' : '📧 Envoyer le lien'}
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