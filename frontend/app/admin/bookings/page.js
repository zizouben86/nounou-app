'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    api.get('/admin/bookings', { params })
      .then(({ data }) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const statusColors = {
    PENDING: 'bg-sun-100 text-sun-700',
    CONFIRMED: 'bg-mint-100 text-mint-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
    COMPLETED: 'bg-sky-100 text-sky-700',
  };

  const statusLabels = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmee',
    CANCELLED: 'Annulee',
    COMPLETED: 'Terminee',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h1 className="text-3xl font-extrabold mb-2">Reservations</h1>
        <p className="text-gray-600">Toutes les transactions de la plateforme</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'PENDING', label: 'En attente' },
          { value: 'CONFIRMED', label: 'Confirmees' },
          { value: 'COMPLETED', label: 'Terminees' },
          { value: 'CANCELLED', label: 'Annulees' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={'px-4 py-2.5 rounded-full font-semibold text-sm transition-all ' + (filter === f.value ? 'bg-coral-500 text-white' : 'bg-white text-gray-700 hover:bg-coral-50')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center text-gray-500">Chargement...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-3">ðŸ“­</div>
          <p className="text-gray-600">Aucune reservation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-100 to-sun-100 flex items-center justify-center text-xl shrink-0">
                    ðŸ“…
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={'badge ' + (statusColors[b.status] || 'bg-gray-100')}>
                        {statusLabels[b.status] || b.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {b.id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <div>
                        ðŸ‘¤ <strong>{b.parent?.user?.firstName} {b.parent?.user?.lastName}</strong>
                        {' â†’ '}
                        ðŸ‘©âFCFAðŸ¼ <strong>{b.nanny?.user?.firstName} {b.nanny?.user?.lastName}</strong>
                      </div>
                      <div>
                        ðŸ“… Du {new Date(b.startDate).toLocaleDateString('fr-FR')} au {new Date(b.endDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-extrabold text-coral-600">
                    {b.totalPrice.toFixed(0)} F
                  </div>
                  <div className="text-xs text-gray-500">
                    Commission : {b.commission?.toFixed(0) || 0} F
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}