import { endpoints } from '../mockData/endpoints.js'

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function validateBody(body, rules, mode) {
  // GET endpoints — no body needed
  if (!rules.requiredFields || rules.requiredFields.length === 0) return null

  let parsed
  try {
    parsed = typeof body === 'string' ? JSON.parse(body) : body
  } catch {
    return { status: 400, reason: 'invalid_json' }
  }

  // Check required fields
  const missing = rules.requiredFields.find(f => {
    const val = parsed[f]
    return val === undefined || val === null || val === ''
  })
  if (missing) return { status: 400, reason: 'missing_field', field: missing }

  // Email check
  if (rules.emailField) {
    const email = parsed[rules.emailField] || ''
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) return { status: 400, reason: 'invalid_email' }

    // Credential check
    if (rules.correctEmail && rules.correctPassword) {
      if (email !== rules.correctEmail || parsed[rules.passwordField] !== rules.correctPassword) {
        return { status: 401, reason: 'wrong_credentials' }
      }
    }
  }

  return null // valid
}

export function simulateRequest(endpointId, bodyText, frameworkMode) {
  const endpoint = endpoints.find(e => e.id === endpointId)
  if (!endpoint) return { status: 500, body: { error: 'Endpoint not found' }, responseTime: 0 }

  const mode = frameworkMode || 'django'
  const perf = endpoint.performance[mode]

  // Simulate network + processing delay context
  const base = randomInRange(perf.avgMs - 8, perf.avgMs + 15)

  // Validate input
  const validationError = validateBody(bodyText, endpoint.validationRules || {}, mode)

  if (validationError) {
    const { status } = validationError
    const responses = endpoint.responses[mode]
    const errorBody = responses[status] || { error: 'Validation failed' }

    return {
      status,
      body: errorBody,
      responseTime: randomInRange(8, 22),
      dbQueries: 0,
      cacheUsed: false,
      headers: buildHeaders(mode, status)
    }
  }

  // Success
  const successBody = endpoint.responses[mode][200]
  return {
    status: 200,
    body: successBody,
    responseTime: base,
    dbQueries: perf.queries,
    cacheUsed: perf.cache,
    headers: buildHeaders(mode, 200)
  }
}

export function simulateHighLoad(endpointId, frameworkMode) {
  const endpoint = endpoints.find(e => e.id === endpointId)
  if (!endpoint) return null
  const mode = frameworkMode || 'django'
  const perf = endpoint.performance[mode]

  return {
    queries: perf.queries + randomInRange(3, 8),
    cache: false,
    avgMs: randomInRange(perf.avgMs * 4, perf.avgMs * 9),
    coldMs: randomInRange(perf.coldMs * 3, perf.coldMs * 6),
    highLoad: true
  }
}

function buildHeaders(mode, status) {
  const base = {
    'Content-Type': 'application/json',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000',
  }
  if (mode === 'django') {
    base['X-Django-Version'] = '4.2'
    base['Allow'] = 'POST, OPTIONS'
  } else {
    base['X-FastAPI-Version'] = '0.110'
    base['X-Process-Time'] = '0.028'
  }
  if (status === 200) base['X-RateLimit-Remaining'] = '9'
  return base
}