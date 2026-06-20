import { useState } from 'react'
import WelcomeScreen from './WelcomeScreen'
import FeaturesScreen from './FeaturesScreen'
import PermissionScreen from './PermissionScreen'
import GuardianSetupScreen from './GuardianSetupScreen'

export default function OnboardingFlow({ userId, onComplete }) {
  const [step, setStep] = useState(0)

  if (step === 0) {
    return <WelcomeScreen onGetStarted={() => setStep(1)} onLearnMore={() => setStep(1)} />
  }
  if (step === 1) {
    return <FeaturesScreen onContinue={() => setStep(2)} />
  }
  if (step === 2) {
    return <PermissionScreen userId={userId} onContinue={() => setStep(3)} />
  }
  return <GuardianSetupScreen userId={userId} onFinish={() => onComplete()} />
}
