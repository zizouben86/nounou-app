'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

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
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => console.log('Geolocalisation refusee')
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
              : '📍 Activez la geolocalisation pour voir les nounous pres de vous'}
          </p>

          <div className="bg-white p-6 rounded-3xl shadow-soft mb-6">
            <div className="grid md:grid-cols-5 gap-4">
              <input
                placeholder="Ville"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input-modern"
              />
              <input
                type="number"
                placeholder="Tarif max"
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
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              <strong>{nannies.length}</strong> nounou(s) trouvee(s)
            </p>
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn-outline !py-2 !px-4 !text-sm"
            >
              {showMap ? 'Voir la liste' : 'Voir la carte'}
            </button>
          </div>

          {showMap && (
            <div className="mb-8">
              <NannyMap nannies={nannies} userLocation={userLocation} />
            </div>
          )}

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
                    <span className="text-coral-600 font-bold">{n.hourlyRate} EUR/h</span>
                    <span className="badge-sun">⭐ {n.ratingAvg.toFixed(1)}</span>
                  </div>
                  {n.distance !== undefined && n.distance !== null && (
                    <div className="mt-2 text-xs text-mint-600 font-semibold">
                      📏 A {n.distance} km de vous
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {nannies.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <p className="text-gray-500">Aucune nounou trouvee avec ces filtres.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}