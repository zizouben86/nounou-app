'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NotificationCenter from './NotificationCenter';
import Icon from './Icon';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    const stored = localStorage.getItem('user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch (e) {} }
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = user?.role === 'NANNY'
    ? [
        { href: '/', label: 'Accueil', icon: 'home' },
        { href: '/nanny/dashboard', label: 'Mes demandes', icon: 'calendar' },
        { href: '/nanny/profile', label: 'Mon profil', icon: 'user' },
        { href: '/messages', label: 'Messages', icon: 'message' },
      ]
    : [
        { href: '/', label: 'Accueil', icon: 'home' },
        { href: '/nannies', label: 'Trouver une nounou', icon: 'search' },
        { href: '/dashboard', label: 'Mes reservations', icon: 'calendar' },
        { href: '/messages', label: 'Messages', icon: 'message' },
      ];

  const dashboardUrl = user?.role === 'NANNY' ? '/nanny/dashboard' : '/dashboard';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'pt-3' : 'pt-5'}`}>
      <div className="container-custom">
        <nav className={`flex items-center justify-between rounded-full transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-xl shadow-soft-lg border border-white/60 py-2.5 pl-5 pr-2.5' : 'bg-white/60 backdrop-blur-md border border-white/40 py-3 pl-6 pr-3'}`}>
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-sun-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
              <Icon name="baby" size={22} strokeWidth={2.2} />
            </div>
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-coral-500 via-sun-500 to-coral-600 bg-clip-text text-transparent">
              NounouHome
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? 'text-coral-600 bg-coral-50'
                      : 'text-gray-700 hover:text-coral-500 hover:bg-coral-50/50'
                  }`}
                >
                  <Icon name={link.icon} size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user && <NotificationCenter />}

            {user ? (
              <Link href={dashboardUrl} className="btn-primary !py-2.5 !px-5 !text-sm flex items-center gap-2">
                Mon espace
                <Icon name="arrowRight" size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden md:inline-flex px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-coral-500 transition-colors rounded-full hover:bg-coral-50">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary !py-2.5 !px-5 !text-sm">
                  Commencer
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="lg:hidden w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-coral-50 transition-colors"
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-soft-xl p-4 border border-white/60">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-coral-50 text-coral-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon name={link.icon} size={18} />
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 mt-1"
              >
                <Icon name="lock" size={18} />
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}