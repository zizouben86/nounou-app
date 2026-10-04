'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';

export default function StripeOnboarding() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/payments/onboard/status').then(({ data }) => setStatus(data));
  }, []);

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/onboard');
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-3xl shadow-soft-xl p-10 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h1 className="text-3xl font-extrabold mb-4">Recevez vos paiements</h1>
            <p className="text-gray-600 mb-8">
              Connectez votre compte Stripe pour recevoir vos paiements en toute sécurité.
            </p>

            {status?.onboarded ? (
              <div className="badge-mint !text-base !px-6 !py-3">
                ✅ Compte configuré
              </div>
            ) : (
              <button onClick={start} disabled={loading} className="btn-primary !py-4 !px-8">
                {loading ? '⏳ Redirection...' : '🚀 Configurer mon compte Stripe'}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}