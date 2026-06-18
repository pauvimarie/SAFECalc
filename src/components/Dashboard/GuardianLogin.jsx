import { useState } from 'react'
import { guardianSignIn, guardianSignUp } from '../../firebase/auth'

export default function GuardianLogin() {
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await guardianSignIn(email, password)
      } else {
        await guardianSignUp(email, password, name)
      }
    } catch (err) {
      setError(humanizeAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Guardian Dashboard</h1>
        <p className="text-neutral-400 text-[14px] mb-6">Sign in to watch over the people you protect.</p>

        <div className="flex bg-neutral-900 rounded-xl p-1 mb-5">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium ${mode === m ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-emerald-500"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-emerald-500"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-emerald-500"
          />
          {error && <p className="text-red-400 text-[13px]">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="key h-12 rounded-xl bg-emerald-500 text-black font-semibold text-[15px] active:bg-emerald-400 disabled:opacity-50 mt-1"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function humanizeAuthError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.'
  if (code.includes('email-already-in-use')) return 'An account already exists for that email.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  if (code.includes('user-not-found')) return 'No account found for that email.'
  return 'Something went wrong. Please try again.'
}
