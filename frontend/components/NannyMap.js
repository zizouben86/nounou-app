'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

const fixLeafletIcons = () => {
  if (typeof window === 'undefined') return;
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function NannyMap({ nannies = [], userLocation = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[500px] bg-cream-100 rounded-3xl animate-pulse" />;
  }

  const defaultCenter = [4.0511, 9.7679];
  const firstWithCoords = nannies.find((n) => n.latitude && n.longitude);
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : firstWithCoords
    ? [firstWithCoords.latitude, firstWithCoords.longitude]
    : defaultCenter;

  return (
    <div className="rounded-3xl overflow-hidden shadow-soft-xl border-4 border-white">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <RecenterMap center={center} />

        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div className="text-center">
                <div className="text-2xl mb-1">📍</div>
                <strong>Vous etes ici</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {nannies
          .filter((n) => n.latitude && n.longitude)
          .map((nanny) => (
            <Marker key={nanny.id} position={[nanny.latitude, nanny.longitude]}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-xl">
                      👩‍🍼
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {nanny.user.firstName} {nanny.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{nanny.city}</div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 mb-2">
                    <div>💰 <strong>{nanny.hourlyRate} EUR/h</strong></div>
                    <div>⭐ {nanny.ratingAvg.toFixed(1)} ({nanny.ratingCount} avis)</div>
                    {nanny.distance !== undefined && nanny.distance !== null && (
                      <div className="text-coral-600 font-semibold">
                        📏 A {nanny.distance} km
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/nannies/${nanny.id}`}
                    className="block text-center text-xs bg-coral-500 text-white py-1.5 rounded-full hover:bg-coral-600"
                  >
                    Voir le profil
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}