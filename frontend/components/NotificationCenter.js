'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '../lib/socket';
import api from '../lib/api';
import Icon from './Icon';

const TYPE_ICONS = {
  NEW_BOOKING: 'calendar',
  BOOKING_ACCEPTED: 'checkCircle',
  BOOKING_REFUSED: 'xCircle',
  PAYMENT_CONFIRMED: 'wallet',
  PAYMENT_SUCCESS: 'creditCard',
  BOOKING_COMPLETED: 'award',
  MESSAGE: 'message',
  DEFAULT: 'bell',
};

const TYPE_COLORS = {
  NEW_BOOKING: 'from-coral-500 to-coral-600',
  BOOKING_ACCEPTED: 'from-mint-500 to-mint-600',
  BOOKING_REFUSED: 'from-red-500 to-red-600',
  PAYMENT_CONFIRMED: 'from-mint-500 to-mint-600',
  PAYMENT_SUCCESS: 'from-sky-500 to-sky-600',
  BOOKING_COMPLETED: 'from-sun-500 to-sun-600',
  MESSAGE: 'from-sky-500 to-sky-600',
  DEFAULT: 'from-gray-500 to-gray-600',
};

export default function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!panelOpen) return;

    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  // Socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Load notifications error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead && notif.id) {
      try {
        await api.patch('/notifications/' + notif.id + '/read');
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }

    if (notif.link) {
      setPanelOpen(false);
      router.push(notif.link);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const clearRead = async () => {
    try {
      await api.delete('/notifications/read');
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) { console.error(err); }
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete('/notifications/' + id);
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) { console.error(err); }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "A l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Bouton cloche */}
      <button
        ref={buttonRef}
        onClick={() => setPanelOpen(!panelOpen)}
        style={{ position: 'relative' }}
        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-coral-50 transition-colors"
        aria-label="Notifications"
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {panelOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          {/* En-tete */}
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: unreadCount > 0 || notifications.length > 0 ? '12px' : '0' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
                <Icon name="bell" size={20} />
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    backgroundColor: '#ffede9',
                    color: '#f05a48',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontWeight: '700',
                  }}>
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setPanelOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {notifications.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      backgroundColor: '#fff5f3',
                      color: '#f05a48',
                      fontWeight: '600',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <Icon name="check" size={12} />
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={clearRead}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontWeight: '600',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <Icon name="trash" size={12} />
                  Effacer les lues
                </button>
              </div>
            )}
          </div>

          {/* Liste scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, maxHeight: '500px' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Icon name="loader" size={40} className="animate-spin text-coral-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Icon name="bell" size={56} className="text-gray-300" />
                <p style={{ color: '#6b7280', fontWeight: '600', marginTop: '16px', fontSize: '14px' }}>
                  Aucune notification
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                  Vous recevrez des alertes quand quelque chose se passe
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notif) => {
                  const iconName = TYPE_ICONS[notif.type] || TYPE_ICONS.DEFAULT;
                  const color = TYPE_COLORS[notif.type] || TYPE_COLORS.DEFAULT;
                  const hasLink = !!notif.link;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid #f9fafb',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: hasLink ? 'pointer' : 'default',
                        backgroundColor: !notif.isRead ? '#fff8f6' : 'transparent',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => { if (hasLink) e.currentTarget.style.backgroundColor = '#fff5f3'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !notif.isRead ? '#fff8f6' : 'transparent'; }}
                    >
                      <div
                        className={`bg-gradient-to-br ${color}`}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={iconName} size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                          <h3 style={{
                            fontSize: '13px',
                            fontWeight: !notif.isRead ? '700' : '600',
                            color: !notif.isRead ? '#111827' : '#374151',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {notif.title}
                          </h3>
                          {!notif.isRead && (
                            <span style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#ff7a6b',
                              flexShrink: 0,
                              marginTop: '6px',
                            }} />
                          )}
                        </div>

                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '6px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {notif.message}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Icon name="clock" size={10} />
                            {formatTime(notif.createdAt)}
                          </span>

                          {hasLink && (
                            <span style={{
                              fontSize: '10px',
                              color: '#ff7a6b',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}>
                              Voir
                              <Icon name="arrowRight" size={10} />
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => deleteOne(e, notif.id)}
                        style={{
                          color: '#d1d5db',
                          flexShrink: 0,
                          padding: '2px',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                        aria-label="Supprimer"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pied */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #f3f4f6',
              backgroundColor: '#fafafa',
              flexShrink: 0,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}