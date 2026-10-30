'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import Navbar from '../../components/Navbar';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toId = searchParams.get('to');
  const toName = searchParams.get('name');

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // 1. Vérifier l'utilisateur connecté
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    setUser(JSON.parse(stored));
  }, [router]);

  // 2. Charger les conversations existantes
  useEffect(() => {
    if (!user) return;
    api.get('/messages')
      .then(({ data }) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  // 3. OUVERTURE AUTOMATIQUE DE LA CONVERSATION
  useEffect(() => {
    if (!toId || !user) return;

    const existing = conversations.find((c) => c.user.id === toId);
    
    if (existing) {
      setActiveChat(existing);
    } else if (toName) {
      const newChat = {
        user: {
          id: toId,
          firstName: toName.split(' ')[0],
          lastName: toName.split(' ').slice(1).join(' ') || '',
        },
        lastMessage: { content: 'Nouvelle conversation' },
        unread: 0,
      };
      setActiveChat(newChat);
    }
  }, [toId, toName, conversations, user]);

  // 4. Gérer Socket.io
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onSent = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onNewMessage = (msg) => {
      if (activeChat && (msg.senderId === activeChat.user.id || msg.receiverId === activeChat.user.id)) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      api.get('/messages').then(({ data }) => setConversations(data)).catch(() => {});
    };

    const onTypingStart = ({ from }) => {
      if (activeChat?.user.id === from) setTyping(true);
    };
    const onTypingStop = ({ from }) => {
      if (activeChat?.user.id === from) setTyping(false);
    };

    socket.on('message:sent', onSent);
    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:sent', onSent);
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [activeChat, user]);

  // 5. Charger l'historique des messages
  useEffect(() => {
    if (!activeChat) return;
    api.get('/messages/' + activeChat.user.id)
      .then(({ data }) => setMessages(data))
      .catch(console.error);
    
    socketRef.current?.emit('message:read', { senderId: activeChat.user.id });
  }, [activeChat]);

  // 6. Scroll automatique
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 7. Envoyer un message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    
    socketRef.current?.emit('message:send', {
      receiverId: activeChat.user.id,
      content: input.trim(),
    });
    setInput('');
    socketRef.current?.emit('typing:stop', { receiverId: activeChat.user.id });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!activeChat) return;
    
    if (e.target.value) {
      socketRef.current?.emit('typing:start', { receiverId: activeChat.user.id });
    } else {
      socketRef.current?.emit('typing:stop', { receiverId: activeChat.user.id });
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-8 min-h-screen bg-gradient-to-br from-cream to-coral-50">
          <div className="container-custom">
            <h1 className="text-3xl font-extrabold mb-6">💬 Messagerie</h1>
            <div className="bg-white rounded-3xl shadow-soft-lg p-12 text-center">
              Chargement...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-8 min-h-screen bg-gradient-to-br from-cream to-coral-50">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold mb-6">💬 Messagerie</h1>

          <div className="bg-white rounded-3xl shadow-soft-lg overflow-hidden grid md:grid-cols-[320px_1fr] h-[75vh]">
            
            {/* Liste des conversations */}
            <aside className="border-r border-gray-100 overflow-y-auto">
              {conversations.length === 0 && !activeChat ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm">Aucune conversation pour le moment.</p>
                </div>
              ) : (
                <>
                  {/* Afficher la nouvelle conversation en haut si elle n'est pas encore dans la liste */}
                  {activeChat && !conversations.find(c => c.user.id === activeChat.user.id) && (
                    <div className="w-full p-4 flex items-center gap-3 bg-coral-50 border-l-4 border-coral-500 border-b border-gray-50">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold truncate text-gray-900 block">
                          {activeChat.user.firstName} {activeChat.user.lastName}
                        </span>
                        <p className="text-sm text-gray-500 truncate">Nouvelle conversation</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Afficher les conversations existantes */}
                  {conversations.map((c) => (
                    <button
                      key={c.user.id}
                      onClick={() => setActiveChat(c)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-coral-50 transition-colors text-left border-b border-gray-50 ${
                        activeChat?.user.id === c.user.id ? 'bg-coral-50 border-l-4 border-coral-500' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold truncate text-gray-900">
                            {c.user.firstName} {c.user.lastName}
                          </span>
                          {c.unread > 0 && (
                            <span className="badge bg-coral-500 text-white !text-[10px] !px-2 !py-0.5">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {c.lastMessage.content}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </aside>

            {/* Zone de chat */}
            {activeChat ? (
              <section className="flex flex-col bg-gray-50/50">
                <header className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {activeChat.user.firstName} {activeChat.user.lastName}
                    </div>
                    {typing && (
                      <div className="text-xs text-mint-600 font-medium animate-pulse">
                        ✏️ en train d'écrire…
                      </div>
                    )}
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
                  <input
                    value={input}
                    onChange={handleTyping}
                    placeholder="Écrivez votre message..."
                    className="input-modern flex-1 !py-3"
                  />
                  <button type="submit" className="btn-primary !py-3 !px-6">
                    Envoyer →
                  </button>
                </form>
              </section>
            ) : (
              <div className="flex items-center justify-center text-gray-400 bg-gray-50/50">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">💬</div>
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  );
}