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
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Recherche', href: '/', icon: Search },
    { name: 'Commerces', href: '/commerces', icon: Store },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    ...(isAdmin ? [{ name: 'Équipe', href: '/equipe', icon: Users }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#12121a] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <Link to="/" className="flex items-center">
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
                    ? 'bg-[#FF8C3A]/10 text-[#FF8C3A] border border-[#FF8C3A]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white font-semibold">
              {profile?.prenom?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.prenom} {profile?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="w-10" />
        </header>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
