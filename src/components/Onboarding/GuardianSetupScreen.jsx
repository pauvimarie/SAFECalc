import { useState } from 'react'
import { createGuardianInvite } from '../../firebase/firestore'

const RELATIONS = ['Parent', 'Friend', 'Partner', 'Guardian']

export default function GuardianSetupScreen({ userId, onFinish }) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('Parent')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState([])

  async function handleAdd() {
    if (!name.trim()) {
      setError('Enter a name first.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const code = userId
        ? await createGuardianInvite(userId, name.trim(), relation, null)
        : 'OFFLINE'
      setAdded((a) => [...a, { name: name.trim(), relation, code }])
      setName('')
    } catch {
      setError('Could not add guardian. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full flex flex-col px-7 py-12 bg-black text-white animate-fadeIn overflow-y-auto">
      <h1 className="text-3xl font-semibold tracking-tight">Guardian Setup</h1>
      <p className="text-neutral-400 text-[15px] mt-2 mb-6">
        Add the people who should be alerted if something happens to you.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {RELATIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRelation(r)}
            className={[
              'key px-4 py-2 rounded-full text-[14px] font-medium border',
              relation === r ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-neutral-900 text-neutral-300 border-neutral-700',
            ].join(' ')}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guardian's name"
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleAdd}
          disabled={busy}
          className="key px-5 rounded-xl bg-neutral-800 font-medium text-[15px] active:bg-neutral-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-400 text-[13px] mb-2">{error}</p>}

      <div className="flex-1 flex flex-col gap-3 mt-4 mb-6">
        {added.map((g, i) => (
          <div key={i} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 animate-slideUp">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-[15px]">{g.name}</p>
                <p className="text-neutral-500 text-[13px]">{g.relation}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 text-[11px] uppercase tracking-wide">Invite code</p>
                <p className="text-emerald-400 font-mono text-[17px] tracking-wider">{g.code}</p>
              </div>
            </div>
          </div>
        ))}
        {added.length === 0 && (
          <p className="text-neutral-500 text-[14px] text-center mt-6">
            No guardians added yet. You can add them later from settings too.
          </p>
        )}
      </div>

      <button
        onClick={() => onFinish(added)}
        className="key w-full h-14 rounded-2xl bg-emerald-500 text-black font-semibold text-[17px] active:bg-emerald-400"
      >
        Finish Setup
      </button>
    </div>
  )
}
