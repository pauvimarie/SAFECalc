import { useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import GuardianSetupScreen from '../components/Onboarding/GuardianSetupScreen'
import { firebaseReady } from '../firebase/config'

function SetupPageInner() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleFinish = () => {
    navigate('/')
  }

  if (!firebaseReady) {
    return (
      <div className="min-h-[100svh] bg-black text-white flex items-center justify-center px-6 text-center flex-col gap-4">
        <p className="text-neutral-400 text-[14px] max-w-sm">
          Firebase isn't configured yet. Add your project keys to a .env file (see .env.example).
        </p>
        <button
          onClick={() => navigate('/')}
          className="key px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-[13px]"
        >
          Back to Calculator
        </button>
      </div>
    )
  }

  return <GuardianSetupScreen userId={user?.uid} onFinish={handleFinish} />
}

export default function SetupPage() {
  return (
    <AuthProvider anonymous>
      <SetupPageInner />
    </AuthProvider>
  )
}
