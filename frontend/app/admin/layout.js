'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Icon from '../../components/Icon';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push('/login');
    const u = JSON.parse(stored);
    if (u.role !== 'ADMIN') return router.push('/dashboard');
    setUser(u);
  }, [router]);

  if (!user) return null;

  const menuItems = [
    { href: '/admin', label: 'Vue d ensemble', icon: 'chart' },
    { href: '/admin/nannies', label: 'Nounous', icon: 'user' },
    { href: '/admin/users', label: 'Utilisateurs', icon: 'users' },
    { href: '/admin/bookings', label: 'Reservations', icon: 'calendar' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-cream to-sky-50 pt-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-[250px_1fr] gap-6 py-6">

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white rounded-3xl shadow-soft p-4 sticky top-24">
                <div className="flex items-center gap-3 px-3 py-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral-300 to-sun-300 flex items-center justify-center text-xl">
                    🛠️
                  </div>
                  <div>
                    <div className="font-bold text-sm">Admin Panel</div>
                    <div className="text-xs text-gray-500">NounouHome</div>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-coral-500 text-white shadow-soft'
                            : 'text-gray-700 hover:bg-coral-50'
                        }`}
                      >
                        <Icon name={item.icon} size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <Icon name="arrowRight" size={18} />
                    Retour au site
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mb-4 btn-outline !py-2 !px-4 !text-sm"
              >
                {sidebarOpen ? '✕ Fermer' : '☰ Menu admin'}
              </button>
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}