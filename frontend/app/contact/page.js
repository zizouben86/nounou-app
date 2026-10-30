'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simule l'envoi pour l'instant
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert('Erreur lors de l envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-coral-50">
        <div className="container-custom max-w-5xl">

          <div className="text-center mb-12">
            <div className="text-6xl mb-4 animate-float inline-block">📧</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Contactez-<span className="text-gradient-coral">nous</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une question, un problème ou une suggestion ? Nous sommes là pour vous aider.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '📞', title: 'Téléphone', value: '+237 6 XX XX XX XX', sub: 'Lun-Ven, 8h-18h' },
              { icon: '📧', title: 'Email', value: 'contact@nounouhome.cm', sub: 'Réponse sous 24h' },
              { icon: '📍', title: 'Adresse', value: 'Douala, Cameroun', sub: 'Akwa, Boulevard de la Liberté' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-soft p-6 text-center">
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-gray-700 font-semibold text-sm mb-1">{c.value}</p>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="bg-white rounded-3xl shadow-soft-xl p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-extrabold mb-2">Message envoyé !</h2>
              <p className="text-gray-600 mb-6">
                Merci de nous avoir contactés. Nous vous répondrons sous 24h.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-primary"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom complet *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Sujet *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-modern"
                  required
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="question">Question générale</option>
                  <option value="probleme">Signaler un problème</option>
                  <option value="nounou">Devenir nounou</option>
                  <option value="parent">Aide pour les parents</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-modern"
                  rows={6}
                  placeholder="Décrivez votre demande en détail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-4 disabled:opacity-50"
              >
                {loading ? '⏳ Envoi en cours...' : '📧 Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}