import { AuthProvider, useAuth } from '../contexts/AuthContext'
import GuardianLogin from '../components/Dashboard/GuardianLogin'
import GuardianDashboard from '../components/Dashboard/GuardianDashboard'
import { firebaseReady } from '../firebase/config'

function DashboardInner() {
  const { user, loading } = useAuth()

  if (!firebaseReady) {
    return (
      <div className="min-h-[100svh] bg-black text-white flex items-center justify-center px-6 text-center">
        <p className="text-neutral-400 text-[14px] max-w-sm">
          Firebase isn't configured yet. Add your project keys to a .env file (see .env.example) to enable the
          Guardian Dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-[100svh] bg-black" />
  }

  // Anonymous users (e.g. someone who opened the calculator on this browser
  // first) shouldn't see the dashboard as "signed in" — guardians need a real account.
  if (!user || user.isAnonymous) {
    return <GuardianLogin />
  }

  return <GuardianDashboard />
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardInner />
    </AuthProvider>
  )
}
