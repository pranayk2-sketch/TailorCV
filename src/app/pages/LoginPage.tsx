import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl">
          <h1 className="text-4xl uppercase mb-2" style={{ fontWeight: 900 }}>
            Sign In
          </h1>
          <p className="text-sm opacity-75 mb-6" style={{ fontWeight: 600 }}>
            Welcome back to ResumeForge
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-3 text-sm text-red-800" style={{ fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase mb-1 opacity-75" style={{ fontWeight: 800 }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={3} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black bg-white text-black"
                  style={{ fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase mb-1 opacity-75" style={{ fontWeight: 800 }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={3} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black bg-white text-black"
                  style={{ fontWeight: 600 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ fontWeight: 900 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ fontWeight: 600 }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#ff6b6b] hover:underline" style={{ fontWeight: 800 }}>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
