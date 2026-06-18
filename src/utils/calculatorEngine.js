// A small, dependency-free calculator engine.
// Uses "chain" evaluation (left to right, no operator precedence) which is
// how most phone and pocket calculators actually behave — this is what
// makes the calculator feel authentic rather than scientific.

export const MAGIC_CODES = ['111', '222', '333', '911', '000']

export const initialCalcState = {
  display: '0',
  firstOperand: null,
  operator: null,
  overwrite: true,
  entryBuffer: '', // raw digits typed since the last operator/clear/equals — used for secret-code matching
}

function formatNumber(value) {
  if (value === Infinity || value === -Infinity) return 'Error'
  if (Number.isNaN(value)) return 'Error'
  const rounded = Math.round(value * 1e10) / 1e10
  let str = rounded.toString()
  if (str.length > 12) {
    str = rounded.toPrecision(10).replace(/\.?0+$/, '').replace(/\.?0+e/, 'e')
    if (str.length > 14) str = rounded.toExponential(5)
  }
  return str
}

function applyOperator(a, op, b) {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
    default:
      return b
  }
}

export function inputDigit(state, digit) {
  const fresh = state.overwrite ? digit : (state.display === '0' ? digit : state.display + digit)
  const display = fresh.length > 12 ? state.display : fresh
  return {
    ...state,
    display,
    overwrite: false,
    entryBuffer: state.entryBuffer + digit,
  }
}

export function inputDecimal(state) {
  if (state.overwrite) {
    return { ...state, display: '0.', overwrite: false, entryBuffer: state.entryBuffer + '.' }
  }
  if (state.display.includes('.')) return state
  return { ...state, display: state.display + '.', entryBuffer: state.entryBuffer + '.' }
}

export function chooseOperator(state, op) {
  const current = parseFloat(state.display)
  if (state.firstOperand === null) {
    return {
      ...state,
      firstOperand: current,
      operator: op,
      overwrite: true,
      entryBuffer: '', // an operator was used — no longer eligible for a secret code
    }
  }
  const result = applyOperator(state.firstOperand, state.operator, current)
  return {
    ...state,
    display: formatNumber(result),
    firstOperand: result,
    operator: op,
    overwrite: true,
    entryBuffer: '',
  }
}

export function toggleSign(state) {
  if (state.display === '0') return state
  const display = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display
  return { ...state, display }
}

export function percent(state) {
  const current = parseFloat(state.display) / 100
  return { ...state, display: formatNumber(current), entryBuffer: '' }
}

export function clearAll() {
  return { ...initialCalcState }
}

export function backspace(state) {
  if (state.overwrite) return state
  const display = state.display.length > 1 ? state.display.slice(0, -1) : '0'
  return {
    ...state,
    display,
    overwrite: display === '0',
    entryBuffer: state.entryBuffer.slice(0, -1),
  }
}

/**
 * Returns { code } if the current entry is a pure secret-code entry
 * (no operator pending, raw digits match a magic code exactly).
 * Otherwise returns null and the caller should do a normal equals.
 */
export function detectSecretCode(state) {
  if (state.operator !== null) return null
  if (MAGIC_CODES.includes(state.entryBuffer)) return { code: state.entryBuffer }
  return null
}

export function equals(state) {
  if (state.operator === null || state.firstOperand === null) {
    return { ...state, overwrite: true, entryBuffer: '' }
  }
  const current = parseFloat(state.display)
  const result = applyOperator(state.firstOperand, state.operator, current)
  return {
    ...state,
    display: formatNumber(result),
    firstOperand: null,
    operator: null,
    overwrite: true,
    entryBuffer: '',
  }
}
