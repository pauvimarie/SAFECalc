import { useState } from 'react'
import { acceptGuardianInvite } from '../../firebase/firestore'

export default function LinkPersonForm({ guardianUid, guardianEmail, onLinked }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await acceptGuardianInvite(code, guardianUid, guardianEmail)
      setSuccess('Linked. You will see their alerts here.')
      setCode('')
      onLinked()
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Could not link with that code.')
      // Keep error visible longer
      setTimeout(() => setError(''), 5000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="Enter invite code"
          maxLength={6}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-[14px] font-mono tracking-wider outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || code.length < 6}
          className="key px-4 rounded-xl bg-emerald-500 text-black text-[13px] font-semibold active:bg-emerald-400 disabled:opacity-40"
        >
          Link
        </button>
      </form>
      {error && <p className="text-red-400 text-[12px] mt-2">{error}</p>}
      {success && <p className="text-emerald-400 text-[12px] mt-2">{success}</p>}
    </div>
  )
}
