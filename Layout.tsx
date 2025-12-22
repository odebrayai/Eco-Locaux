import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';
import {
  Search,
  Store,
  Calendar,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronDown,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Recherche', href: '/', icon: Search },
    { name: 'Commerces', href: '/commerces', icon: Store },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    ...(isAdmin ? [{ name: 'Équipe', href: '/equipe', icon: Users }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#12121a] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/6obf1wetk0iahgcfkuyaa.png"
              alt="ECO-LOCAUX"
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#FF8C3A]/10 text-[#FF8C3A] border border-[#FF8C3A]/30 shadow-[0_0_20px_rgba(255,140,58,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white font-semibold">
                {profile?.prenom?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.prenom} {profile?.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  profileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a25] rounded-xl border border-white/10 shadow-xl overflow-hidden">
                <Link
                  to="/profil"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/6obf1wetk0iahgcfkuyaa.png"
              alt="ECO-LOCAUX"
              className="h-8 w-auto"
            />
          </Link>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
