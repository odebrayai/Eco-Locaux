import { useState } from 'react';
import { useAuth } from './auth-context';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';
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
      toast.success('Connexion réussie !');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#547235]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C3A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="/6obf1wetk0iahgcfkuyaa.png"
            alt="ECO-LOCAUX"
            className="h-16 w-auto"
          />
        </div>

        {/* Card */}
        <div className="bg-[#1a1a25] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Connexion
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Accédez à votre espace de prospection
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] focus:ring-1 focus:ring-[#FF8C3A]/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] focus:ring-1 focus:ring-[#FF8C3A]/50 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FF8C3A]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,140,58,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Forgot password */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Mot de passe oublié ?{' '}
            <button className="text-[#FF8C3A] hover:underline">
              Réinitialiser
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          © 2025 ECO-LOCAUX • Solution de prospection énergétique
        </p>
      </div>
    </div>
  );
}
