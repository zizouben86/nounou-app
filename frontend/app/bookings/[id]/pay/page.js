'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import Navbar from '../../../../components/Navbar';

export default function PayBooking() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState(null);
  const [step, setStep] = useState('loading'); // loading | form | pending | success | failed
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollIntervalRef = useRef(null);

  // ─────────────────────────────────────────────
  // 1. Charger la reservation
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function loadBooking() {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return router.push('/login');

        const { data } = await api.get('/bookings/me');
        const found = data.find((b) => b.id === id);

        if (!found) {
          setError('Reservation introuvable');
          setStep('failed');
          return;
        }

        if (found.paymentStatus === 'SUCCESS') {
          setBooking(found);
          setStep('success');
          return;
        }

        setBooking(found);
        setStep('form');
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de chargement');
        setStep('failed');
      }
    }
    loadBooking();
  }, [id, router]);

  // ─────────────────────────────────────────────
  // 2. Detecter l'operateur au fil de la saisie
  // ─────────────────────────────────────────────
  useEffect(() => {
    const cleaned = phone.replace(/\D/g, '');

    if (/^(237)?(67|68|650|651|652|653|654)/.test(cleaned)) {
      setOperator('MTN');
    } else if (/^(237)?(69|655|656|657|658|659)/.test(cleaned)) {
      setOperator('ORANGE');
    } else {
      setOperator(null);
    }
  }, [phone]);

  // ─────────────────────────────────────────────
  // 3. Polling du statut
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'pending') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        setPollCount((c) => c + 1);
        const { data } = await api.get('/payments/campay/status/' + id);

        if (data.status === 'SUCCESSFUL') {
          setStep('success');
          clearInterval(pollIntervalRef.current);
        } else if (data.status === 'FAILED') {
          setError('Le paiement a echoue. Verifiez votre solde Mobile Money.');
          setStep('failed');
          clearInterval(pollIntervalRef.current);
        }
      } catch (err) {
        // Silence — on retente au prochain tick
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [step, id]);

  // ─────────────────────────────────────────────
  // 4. Initier le paiement
  // ─────────────────────────────────────────────
  const handlePay = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post('/payments/campay/initiate', {
        bookingId: id,
        phoneNumber: phone,
      });

      setPayment(data);
      setStep('pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 12);
    return cleaned;
  };

  // ═════════════════════════════════════════════
  //  RENDU
  // ═════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream via-coral-50 to-mint-50 relative overflow-hidden">
        <div className="blob w-96 h-96 bg-coral-300 -top-20 -right-20"></div>
        <div className="blob w-80 h-80 bg-mint-300 bottom-0 -left-20"></div>

        <div className="container-custom max-w-xl relative z-10">

          {/* ═══════ LOADING ═══════ */}
          {step === 'loading' && (
            <div className="bg-white rounded-3xl shadow-soft-xl p-10 text-center">
              <div className="text-5xl mb-4 animate-spin inline-block">⏳</div>
              <p className="text-gray-600">Chargement de la reservation...</p>
            </div>
          )}

          {/* ═══════ FORMULAIRE ═══════ */}
          {step === 'form' && booking && (
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10 animate-fade-in-up">
              {/* Header */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-coral-500 transition-colors mb-6"
              >
                <span>←</span> Retour au tableau de bord
              </Link>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-3xl shadow-soft">
                  💳
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold">Paiement Mobile Money</h1>
                  <p className="text-sm text-gray-500">Securise via MTN MoMo / Orange Money</p>
                </div>
              </div>

              {/* Recapitulatif */}
              <div className="bg-gradient-to-br from-cream-100 to-coral-50 rounded-2xl p-6 mb-8 border border-coral-100">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Montant a payer
                </div>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-coral-500 to-sun-500 bg-clip-text text-transparent mb-4">
                  {booking.totalPrice.toFixed(0)} <span className="text-2xl">FCFA</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Date debut</div>
                    <div className="font-semibold">
                      {new Date(booking.startDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Date fin</div>
                    <div className="font-semibold">
                      {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handlePay} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    📱 Numero Mobile Money
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="237 6XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="input-modern text-lg tracking-wide"
                    required
                    minLength="11"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format international : 237 + numero (ex: 237670000000)
                  </p>
                </div>

                {/* Detection operateur */}
                {operator && (
                  <div
                    className={`p-4 rounded-2xl flex items-center gap-4 animate-fade-in ${
                      operator === 'MTN'
                        ? 'bg-yellow-50 border-2 border-yellow-200'
                        : 'bg-orange-50 border-2 border-orange-200'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                        operator === 'MTN' ? 'bg-yellow-400 text-black' : 'bg-orange-500 text-white'
                      }`}
                    >
                      {operator === 'MTN' ? 'M' : 'O'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">
                        {operator === 'MTN' ? 'MTN Mobile Money' : 'Orange Money'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Detecte automatiquement depuis votre numero
                      </div>
                    </div>
                    <div className="badge-mint">✓</div>
                  </div>
                )}

                {!operator && phone.length >= 3 && (
                  <div className="p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                      {phone.length < 11
                        ? '⏳ Continuez a saisir votre numero...'
                        : '❌ Numero non reconnu. Utilisez MTN (67/68) ou Orange (69/655)'}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !operator}
                  className="btn-primary w-full !py-4 !text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      <span>Initiation...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>
                        Payer {booking.totalPrice.toFixed(0)} FCFA
                      </span>
                    </>
                  )}
                </button>

                {/* Infos securite */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                  <span className="flex items-center gap-1">🔒 Paiement securise</span>
                  <span className="flex items-center gap-1">⚡ Instantane</span>
                </div>
              </form>
            </div>
          )}

          {/* ═══════ ATTENTE ═══════ */}
          {step === 'pending' && payment && (
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10 text-center animate-fade-in-up">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-mint-200 animate-ping opacity-40"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-5xl">
                  📱
                </div>
              </div>

              <h2 className="text-2xl font-extrabold mb-3">
                Confirmez sur votre telephone
              </h2>
              <p className="text-gray-600 mb-6">
                Une notification a ete envoyee au{' '}
                <strong className="text-coral-600">{phone}</strong>
              </p>

              {/* Code USSD */}
              {payment.ussdCode && (
                <div className="bg-gradient-to-br from-sun-100 to-sun-200 border-2 border-sun-300 rounded-2xl p-6 mb-6 text-left">
                  <div className="font-bold text-sun-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Instructions {payment.operator === 'MTN' ? 'MTN MoMo' : 'Orange Money'}
                  </div>
                  <ol className="space-y-2 text-sm text-sun-900">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <span>
                        Composez le <strong className="text-lg">{payment.ussdCode}</strong>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <span>Choisissez <strong>&quot;Payer&quot;</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <span>Entrez votre code PIN</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <span>Validez le paiement</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Reference */}
              <div className="bg-gray-50 rounded-xl p-3 mb-6 text-xs text-gray-600">
                Reference : <code className="font-mono">{payment.reference}</code>
              </div>

              {/* Indicateur d'attente */}
              <div className="flex items-center justify-center gap-3 text-gray-500 mb-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-mint-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-mint-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-mint-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
                <span className="text-sm">En attente de confirmation...</span>
              </div>

              <p className="text-xs text-gray-400">
                Verification {pollCount + 1} • Toutes les 3 secondes
              </p>
            </div>
          )}

          {/* ═══════ SUCCES ═══════ */}
          {step === 'success' && (
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10 text-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mint-100 to-mint-300 flex items-center justify-center text-6xl mx-auto mb-6 shadow-soft-lg">
                ✅
              </div>

              <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-mint-500 to-mint-600 bg-clip-text text-transparent">
                Paiement confirme !
              </h2>
              <p className="text-gray-600 mb-8">
                Votre reservation est confirmee. La nounou a ete notifiee.
              </p>

              <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-2xl p-6 mb-8 text-left">
                <div className="text-xs uppercase tracking-wider text-mint-700 mb-1">
                  Montant paye
                </div>
                <div className="text-3xl font-extrabold text-mint-700 mb-3">
                  {booking?.totalPrice?.toFixed(0) || '—'} FCFA
                </div>
                <div className="text-sm text-mint-800">
                  Reference : <code className="font-mono text-xs">{payment?.reference || '—'}</code>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary flex-1 !py-4"
                >
                  📊 Tableau de bord
                </button>
                <button
                  onClick={() => router.push('/messages')}
                  className="btn-secondary flex-1 !py-4"
                >
                  💬 Contacter la nounou
                </button>
              </div>
            </div>
          )}

          {/* ═══════ ECHEC ═══════ */}
          {step === 'failed' && (
            <div className="bg-white rounded-3xl shadow-soft-xl p-8 md:p-10 text-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-6xl mx-auto mb-6">
                ❌
              </div>

              <h2 className="text-2xl font-extrabold mb-3 text-red-600">
                Paiement echoue
              </h2>
              <p className="text-gray-600 mb-8">
                {error || 'Une erreur est survenue lors du paiement.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setStep('form');
                  }}
                  className="btn-primary flex-1 !py-4"
                >
                  🔄 Reessayer
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-outline flex-1 !py-4"
                >
                  Retour
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}