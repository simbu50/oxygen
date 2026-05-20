import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { useAuthStore } from '../hooks/useAuth';

interface FormData { email: string; password: string; }

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: 'admin@oxygen.local', password: 'Admin@123' },
  });
  const setSession = useAuthStore((s) => s.setSession);
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', data);
      setSession(res.data);
      nav('/');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-navy-700 text-white p-12 relative overflow-hidden">
        <div>
          <div className="font-serif text-4xl font-bold tracking-wider">OXYGEN</div>
          <div className="text-xs uppercase tracking-widest text-gold-500 mt-1">Admin Console</div>
        </div>
        <div className="relative z-10">
          <div className="font-serif text-3xl italic">Lower-EMI lending, instantly.</div>
          <p className="text-slate-300 mt-2 text-sm">
            Review applications, verify KYC, approve disbursements — all in one place.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-teal-600/30" />
        <div className="absolute right-10 top-20 w-48 h-48 rounded-full bg-teal-500/20" />
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-navy-700">Sign in</h1>
          <p className="text-slate-500 text-sm mt-1">Use your admin email and password.</p>

          <label className="block mt-6 text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="input mt-1"
            {...register('email', { required: 'Email required' })}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}

          <label className="block mt-4 text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="input mt-1"
            {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}

          {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-slate-400 mt-6">
            Dev credentials: admin@oxygen.local / Admin@123
          </p>
        </form>
      </div>
    </div>
  );
}
