'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import Navbar from '../../components/Navbar';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    setUser(JSON.parse(stored));

    api.get('/messages').then(({ data }) => setConversations(data)).catch(() => {});
  }, [router]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onNew = (msg) => {
      if (activeChat && (msg.senderId === activeChat.user.id || msg.receiverId === activeChat.user.id)) {
        setMessages((m) => [...m, msg]);
      }
      // Refresh conversations
      api.get('/messages').then(({ data }) => setConversations(data)).catch(() => {});
    };

    const onTyping = ({ from }) => {
      if (activeChat?.user.id === from) setTyping(true);
    };
    const onStopTyping = ({ from }) => {
      if (activeChat?.user.id === from) setTyping(false);
    };

    socket.on('message:new', onNew);
    socket.on('typing:start', onTyping);
    socket.on('typing:stop', onStopTyping);

    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start', onTyping);
      socket.off('typing:stop', onStopTyping);
    };
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    api.get(`/messages/${activeChat.user.id}`).then(({ data }) => setMessages(data));
    socketRef.current?.emit('message:read', { senderId: activeChat.user.id });
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    socketRef.current?.emit('message:send', {
      receiverId: activeChat.user.id,
      content: input.trim(),
    });
    setInput('');
  };

  const handleTyping = (value) => {
    setInput(value);
    if (!activeChat) return;
    if (value) {
      socketRef.current?.emit('typing:start', { receiverId: activeChat.user.id });
    } else {
      socketRef.current?.emit('typing:stop', { receiverId: activeChat.user.id });
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-8 min-h-screen bg-gradient-to-br from-cream to-coral-50">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold mb-6">💬 Messagerie</h1>

          <div className="bg-white rounded-3xl shadow-soft-lg overflow-hidden grid md:grid-cols-[320px_1fr] h-[70vh]">
            {/* Conversations */}
            <aside className="border-r border-gray-100 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="p-6 text-gray-500 text-sm">Aucune conversation</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.user.id}
                    onClick={() => setActiveChat(c)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-coral-50 transition-colors text-left ${
                      activeChat?.user.id === c.user.id ? 'bg-coral-50 border-l-4 border-coral-500' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center text-xl shrink-0">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate">
                          {c.user.firstName} {c.user.lastName}
                        </span>
                        {c.unread > 0 && (
                          <span className="badge-coral !text-[10px]">{c.unread}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{c.lastMessage.content}</p>
                    </div>
                  </button>
                ))
              )}
            </aside>

            {/* Chat */}
            {activeChat ? (
              <section className="flex flex-col">
                <header className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-sky-300 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-semibold">
                      {activeChat.user.firstName} {activeChat.user.lastName}
                    </div>
                    {typing && <div className="text-xs text-mint-600">✏️ en train d'écrire…</div>}
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-100">
                  {messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-soft ${
                            isMe
                              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={send} className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="input-modern flex-1"
                  />
                  <button type="submit" className="btn-primary !py-3 !px-6">
                    Envoyer →
                  </button>
                </form>
              </section>
            ) : (
              <div className="flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}