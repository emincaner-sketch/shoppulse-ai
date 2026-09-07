'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Şifre hatalı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError('Bağlantı hatası oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Özel Yönetim Aracı</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          ShopPulse AI
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Kişisel mağaza yönetim paneli erişim doğrulaması
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-4 text-zinc-300">
          <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Yönetici Şifresi</h2>
            <p className="text-[11px] text-zinc-500 font-mono">Master Access Key</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Yönetici şifrenizi girin..."
              disabled={loading}
              autoFocus
              className="w-full bg-zinc-900 border border-white/[0.08] hover:border-white/[0.14] focus:border-white/30 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40 text-xs font-medium transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <>
                <span>Paneli Aç</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-900" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tek Kullanıcı Koruması</span>
          </div>
          <span>.env / APP_PASSWORD</span>
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-600 font-mono mt-5">
        Self-Hosted Private Commerce Intelligence
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
