import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { useOnboarded } from '../hooks/useOnboarded'
import OnboardingFlow from '../components/Onboarding/OnboardingFlow'
import Calculator from '../components/Calculator/Calculator'
import InstallPrompt from '../components/shared/InstallPrompt'

function CalculatorPageInner() {
  const { user } = useAuth()
  const [onboarded, completeOnboarding] = useOnboarded()

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      {onboarded ? (
        <Calculator userId={user?.uid} />
      ) : (
        <OnboardingFlow userId={user?.uid} onComplete={completeOnboarding} />
      )}
      <InstallPrompt />
    </div>
  )
}

export default function CalculatorPage() {
  return (
    <AuthProvider anonymous>
      <CalculatorPageInner />
    </AuthProvider>
  )
}
