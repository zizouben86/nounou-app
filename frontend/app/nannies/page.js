'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

// Chargement dynamique de la carte (SSR incompatible)
const NannyMap = dynamic(() => import('../../components/NannyMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-cream-100 rounded-3xl animate-pulse" />,
});

export default function NanniesList() {
  const [nannies, setNannies] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    maxRate: '',
    languages: '',
    maxKm: 20,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    // Demander la géolocalisation au chargement
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => console.log('Géolocalisation refusée')
      );
    }
    search();
  }, []);

  const search = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (userLocation) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
      }
      const { data } = await api.get('/nannies', { params });
      setNannies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-cream to-mint-50">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold mb-2">Trouver une nounou</h1>
          <p className="text-gray-600 mb-6">
            {userLocation
              ? `📍 Recherche autour de vous (${filters.maxKm} km)`
              : '📍 Activez la géolocalisation pour voir les nounous près de vous'}
          </p>

          {/* Filtres */}
          <div className="bg-white p-6 rounded-3xl shadow-soft mb-6">
            <div className="grid md:grid-cols-5 gap-4">
              <input
                placeholder="Ville (ex: Douala)"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input-modern"
              />
              <input
                type="number"
                placeholder="Tarif max (FCFA/h)"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                className="input-modern"
              />
              <input
                placeholder="Langues"
                value={filters.languages}
                onChange={(e) => setFilters({ ...filters, languages: e.target.value })}
                className="input-modern"
              />
              <select
                value={filters.maxKm}
                onChange={(e) => setFilters({ ...filters, maxKm: e.target.value })}
                className="input-modern"
              >
                <option value="5">Dans 5 km</option>
                <option value="10">Dans 10 km</option>
                <option value="20">Dans 20 km</option>
                <option value="50">Dans 50 km</option>
              </select>
              <button onClick={search} disabled={loading} className="btn-primary">
                {loading ? '⏳' : '🔍 Rechercher'}
              </button>
            </div>
          </div>

          {/* Toggle carte/liste */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              <strong>{nannies.length}</strong> nounou(s) trouvée(s)
            </p>
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn-outline !py-2 !px-4 !text-sm"
            >
              {showMap ? '📋 Voir la liste' : '🗺️ Voir la carte'}
            </button>
          </div>

          {/* Carte */}
          {showMap && (
            <div className="mb-8">
              <NannyMap nannies={nannies} userLocation={userLocation} />
            </div>
          )}

          {/* Liste */}
          {!showMap && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nannies.map((n) => (
                <Link key={n.id} href={`/nannies/${n.id}`} className="card p-6 block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-2xl">
                      👩‍🍼
                    </div>
                    <div>
                      <div className="font-bold">
                        {n.user.firstName} {n.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">📍 {n.city}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-coral-600 font-bold">{n.hourlyRate} FCFA/h</span>
                    <span className="badge-sun">⭐ {n.ratingAvg.toFixed(1)}</span>
                  </div>
                  {n.distance && (
                    <div className="mt-2 text-xs text-mint-600 font-semibold">
                      📏 À {n.distance} km de vous
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {nannies.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <p className="text-gray-500">Aucune nounou trouvée avec ces filtres.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}