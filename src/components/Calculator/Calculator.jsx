import { useRef, useState, useCallback } from 'react'
import CalcButton from './CalcButton'
import Display from './Display'
import Toast from '../shared/Toast'
import HamburgerMenu from '../shared/HamburgerMenu'
import {
  initialCalcState,
  inputDigit,
  inputDecimal,
  chooseOperator,
  toggleSign,
  percent,
  clearAll,
  equals,
  detectSecretCode,
} from '../../utils/calculatorEngine'
import { triggerEmergencyMode } from '../../utils/emergencyActions'

const CRITICAL_COUNTDOWN_MS = 15000
const TOAST_DISPLAY_MS = 2500

const EMERGENCY_LABELS = {
  '111': 'Concern sent',
  '222': 'Assistance activated',
  '333': 'Danger alert sent',
  '911': 'Critical mode activated',
  '000': 'Cancelled',
}

export default function Calculator({ userId }) {
  const [calc, setCalc] = useState(initialCalcState)
  const countdownTimer = useRef(null)
  const countdownActive = useRef(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToast(null)
    }, TOAST_DISPLAY_MS)
  }, [])

  const runSecretCode = useCallback(
    (code) => {
      if (!userId) return // no Firebase project configured / not signed in — calculator still works normally
      if (code === '911') {
        if (countdownActive.current) return
        countdownActive.current = true
        showToast(EMERGENCY_LABELS['911'])
        countdownTimer.current = setTimeout(async () => {
          countdownActive.current = false
          await triggerEmergencyMode(userId, 'critical')
        }, CRITICAL_COUNTDOWN_MS)
        return
      }
      if (code === '000') {
        if (countdownActive.current) {
          clearTimeout(countdownTimer.current)
          countdownActive.current = false
          showToast(EMERGENCY_LABELS['000'])
        }
        return
      }
      const levelByCode = { '111': 'concern', '222': 'assistance', '333': 'danger' }
      const level = levelByCode[code]
      if (level) {
        showToast(EMERGENCY_LABELS[code])
        triggerEmergencyMode(userId, level)
      }
    },
    [userId, showToast]
  )

  const onDigit = (d) => setCalc((s) => inputDigit(s, d))
  const onDecimal = () => setCalc((s) => inputDecimal(s))
  const onOperator = (op) => setCalc((s) => chooseOperator(s, op))
  const onSign = () => setCalc((s) => toggleSign(s))
  const onPercent = () => setCalc((s) => percent(s))
  const onClear = () => setCalc(() => clearAll())

  const onEquals = () => {
    setCalc((s) => {
      const secret = detectSecretCode(s)
      const next = equals(s)
      if (secret) {
        runSecretCode(secret.code)
        // Clear display after emergency code is triggered
        return initialCalcState
      }
      return next
    })
  }

  const clearLabel = calc.display === '0' && calc.firstOperand === null ? 'AC' : 'C'

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      <HamburgerMenu />
      <Display value={calc.display} />

      <div className="grid grid-cols-4 gap-3 px-4 pb-[calc(20px+var(--safe-bottom))]">
        <CalcButton label={clearLabel} variant="function" onPress={onClear} />
        <CalcButton label="±" ariaLabel="toggle sign" variant="function" onPress={onSign} />
        <CalcButton label="%" variant="function" onPress={onPercent} />
        <CalcButton label="÷" variant="operator" onPress={() => onOperator('÷')} />

        <CalcButton label="7" onPress={() => onDigit('7')} />
        <CalcButton label="8" onPress={() => onDigit('8')} />
        <CalcButton label="9" onPress={() => onDigit('9')} />
        <CalcButton label="×" variant="operator" onPress={() => onOperator('×')} />

        <CalcButton label="4" onPress={() => onDigit('4')} />
        <CalcButton label="5" onPress={() => onDigit('5')} />
        <CalcButton label="6" onPress={() => onDigit('6')} />
        <CalcButton label="−" variant="operator" onPress={() => onOperator('-')} />

        <CalcButton label="1" onPress={() => onDigit('1')} />
        <CalcButton label="2" onPress={() => onDigit('2')} />
        <CalcButton label="3" onPress={() => onDigit('3')} />
        <CalcButton label="+" variant="operator" onPress={() => onOperator('+')} />

        <CalcButton label="0" wide onPress={() => onDigit('0')} />
        <CalcButton label="." onPress={onDecimal} />
        <CalcButton label="=" variant="operator" onPress={onEquals} />
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}
