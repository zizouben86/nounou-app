'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

// URL du backend pour afficher les fichiers
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function AdminNannies() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/nannies/pending').catch((err) => { console.error("Erreur pending:", err); return { data: [] }; }),
      api.get('/nannies').catch((err) => { console.error("Erreur all:", err); return { data: [] }; }),
    ]).then(([pendingRes, allRes]) => {
      console.log("Pending data:", pendingRes.data);
      console.log("All data:", allRes.data);
      setPending(pendingRes.data || []);
      setAll(allRes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const verify = async (id, status) => {
    if (!confirm(status === 'VERIFIED' ? 'Valider cette nounou ?' : 'Rejeter cette nounou ?')) return;
    try {
      await api.patch('/admin/nannies/' + id + '/verify', { status });
      setPending(pending.filter((n) => n.id !== id));
      setSelected(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  // Fonction pour afficher l'URL complète du fichier
  const getFileUrl = (path) => {
    if (!path) return null;
    return `${API_URL}${path}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h1 className="text-3xl font-extrabold mb-2">Vérification des nounous</h1>
        <p className="text-gray-600">Validez ou rejetez les profils en attente</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('pending')}
          className={'px-5 py-2.5 rounded-full font-semibold text-sm transition-all ' + (tab === 'pending' ? 'bg-coral-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-coral-50')}
        >
          ⏳ En attente ({pending.length})
        </button>
        <button
          onClick={() => setTab('all')}
          className={'px-5 py-2.5 rounded-full font-semibold text-sm transition-all ' + (tab === 'all' ? 'bg-coral-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-coral-50')}
        >
          ✅ Toutes les nounous ({all.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center text-gray-500">
          Chargement...
        </div>
      ) : (tab === 'pending' && pending.length === 0) ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-3">✅</div>
          <p className="text-gray-600">Aucune nounou en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(tab === 'pending' ? pending : all).map((nanny) => (
            <div key={nanny.id} className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-3xl shrink-0">
                    👩‍🍼
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg">
                        {nanny.user.firstName} {nanny.user.lastName}
                      </h3>
                      {nanny.verificationStatus === 'VERIFIED' && (
                        <span className="badge-mint">✓ Vérifiée</span>
                      )}
                      {nanny.verificationStatus === 'PENDING' && (
                        <span className="badge-sun">⏳ En attente</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      <div>📧 {nanny.user.email}</div>
                      <div>📍 {nanny.city} · 💰 {nanny.hourlyRate} EUR/h</div>
                      {/* Indicateur de documents */}
                      <div className="flex gap-2 mt-1">
                        {nanny.idCardUrl ? <span className="text-xs text-green-600 font-bold">📄 CNI OK</span> : <span className="text-xs text-red-400">❌ CNI</span>}
                        {nanny.criminalRecordUrl ? <span className="text-xs text-green-600 font-bold">📄 Casier OK</span> : <span className="text-xs text-red-400">❌ Casier</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelected(nanny)}
                    className="btn-outline !py-2 !px-4 !text-sm"
                  >
                    👁️ Détails
                  </button>
                  {tab === 'pending' && (
                    <>
                      <button
                        onClick={() => verify(nanny.id, 'VERIFIED')}
                        className="btn-mint !py-2 !px-4 !text-sm"
                      >
                        ✅ Valider
                      </button>
                      <button
                        onClick={() => verify(nanny.id, 'REJECTED')}
                        className="btn-outline !py-2 !px-4 !text-sm !text-red-600 !border-red-200 hover:!bg-red-50"
                      >
                        ❌ Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal details */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-3xl">
                  👩‍🍼
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selected.user.firstName} {selected.user.lastName}
                  </h2>
                  <div className="text-sm text-gray-500">{selected.user.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="bg-cream-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Bio</div>
                  <p className="text-gray-700">{selected.bio || 'Non renseignée'}</p>
                </div>
                <div className="bg-cream-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Tarif / Expérience</div>
                  <div className="text-gray-700 font-semibold">{selected.hourlyRate} EUR/h · {selected.experienceYears} ans</div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  🛡️ Documents de vérification
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">CNI / Passeport</span>
                    {selected.idCardUrl ? (
                      <a 
                        href={getFileUrl(selected.idCardUrl)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-coral-600 hover:underline bg-coral-50 px-3 py-1 rounded-full"
                      >
                        👁️ Ouvrir
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold">❌ Manquant</span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Casier judiciaire</span>
                    {selected.criminalRecordUrl ? (
                      <a 
                        href={getFileUrl(selected.criminalRecordUrl)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-coral-600 hover:underline bg-coral-50 px-3 py-1 rounded-full"
                      >
                        👁️ Ouvrir
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold">❌ Manquant</span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Diplômes</span>
                    {selected.diplomaUrl ? (
                      <a 
                        href={getFileUrl(selected.diplomaUrl)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-coral-600 hover:underline bg-coral-50 px-3 py-1 rounded-full"
                      >
                        👁️ Ouvrir
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Optionnel</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selected.verificationStatus === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => verify(selected.id, 'REJECTED')}
                  className="btn-outline flex-1 !text-red-600 !border-red-200 hover:!bg-red-50"
                >
                  ❌ Rejeter
                </button>
                <button
                  onClick={() => verify(selected.id, 'VERIFIED')}
                  className="btn-mint flex-1"
                >
                  ✅ Valider
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}