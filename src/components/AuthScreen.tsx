import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'

type AuthScreenProps = {
  onSubmit: (mode: 'signin' | 'signup', email: string, password: string) => Promise<void>
  loading: boolean
  error: string
}

export function AuthScreen({ onSubmit, loading, error }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(mode, email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <section className="rounded-[32px] border border-white/10 bg-ink-900/85 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-8 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${
                mode === 'signin' ? 'bg-white text-ink-950' : 'text-slate-300'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${
                mode === 'signup' ? 'bg-white text-ink-950' : 'text-slate-300'
              }`}
            >
              Create account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                placeholder="email@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                placeholder="min. 6 characters"
                minLength={6}
                required
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-ink-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-slate-400">
            email confirmation required.
          </p>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-[0.16em] text-white">work0ut</h1>
          </div>
        </section>
      </div>
    </div>
  )
}
