import { useState } from 'react';
import { useAuth } from './auth-context';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Email ou mot de passe incorrect');
    } else {
      toast.success('Connexion réussie');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#547235]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C3A]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/6obf1wetk0iahgcfkuyaa.png"
            alt="ECO-LOCAUX"
            className="h-12 w-auto opacity-90"
          />
        </div>

        <div className="bg-[#1a1a25]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center mb-1">
            Connexion
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Plateforme de prospection
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF8C3A]/50 focus:ring-1 focus:ring-[#FF8C3A]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF8C3A]/50 focus:ring-1 focus:ring-[#FF8C3A]/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-[#547235] to-[#6a8f44] text-white text-sm font-semibold rounded-lg hover:from-[#5f7f3d] hover:to-[#75994d] focus:outline-none focus:ring-2 focus:ring-[#547235]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#547235]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          © 2025 ECO-LOCAUX
        </p>
      </div>
    </div>
  );
}
