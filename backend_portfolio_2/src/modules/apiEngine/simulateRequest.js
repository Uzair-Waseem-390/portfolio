import { endpoints } from '../mockData/endpoints.js'

// ─────────────────────────────────────────────────────────────
// Validate request body against endpoint rules
// ─────────────────────────────────────────────────────────────
function validateRequest(endpoint, body, frameworkMode) {
  const rules = endpoint.validationRules || {}
  const errors = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field]
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = true
    }
    if (value && rule.format === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors[field] = 'invalid_email'
      }
    }
    if (value && rule.minLength && String(value).length < rule.minLength) {
      errors[field] = 'too_short'
    }
  }

  return errors
}

// ─────────────────────────────────────────────────────────────
// Format error response per framework
// ─────────────────────────────────────────────────────────────
function buildValidationError(errors, frameworkMode, endpoint) {
  const schemas = endpoint.responseSchemas[frameworkMode]
  if (schemas[400]) return schemas[400]

  if (frameworkMode === 'django') {
    const result = {}
    for (const field of Object.keys(errors)) {
      result[field] = ['This field is required.']
    }
    return result
  } else {
    return {
      detail: Object.keys(errors).map((field) => ({
        loc: ['body', field],
        msg: 'field required',
        type: 'value_error.missing',
      })),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Random realistic response time within endpoint profile
// ─────────────────────────────────────────────────────────────
function simulateResponseTime(profile, highLoad = false) {
  const base = profile.avgResponse
  const variance = Math.floor(Math.random() * 20) - 10
  const loadMultiplier = highLoad ? 2.5 + Math.random() : 1
  return Math.round((base + variance) * loadMultiplier)
}

// ─────────────────────────────────────────────────────────────
// MAIN: simulateRequest
// Returns structured { status, headers, body, responseTime, dbQueries, cacheUsed }
// ─────────────────────────────────────────────────────────────
export function simulateRequest(endpointId, requestBody, frameworkMode, isLoggedIn, highLoad = false) {
  const endpoint = endpoints.find((e) => e.id === endpointId)
  if (!endpoint) return { status: 404, body: { error: 'Endpoint not found' }, responseTime: 0, dbQueries: 0, cacheUsed: false }

  const profile = endpoint.performanceProfile
  const schemas = endpoint.responseSchemas[frameworkMode]
  const responseTime = simulateResponseTime(profile, highLoad)

  // ── Auth check ───────────────────────────────────────────
  if (endpoint.requiresAuth && !isLoggedIn) {
    const body = frameworkMode === 'django'
      ? { detail: 'Authentication credentials were not provided.' }
      : { detail: 'Not authenticated.' }
    return {
      status: 401,
      headers: buildHeaders(frameworkMode, 401),
      body,
      responseTime,
      dbQueries: 0,
      cacheUsed: false,
      note: 'auth_required',
    }
  }

  // ── Validation ───────────────────────────────────────────
  if (Object.keys(endpoint.validationRules || {}).length > 0) {
    const errors = validateRequest(endpoint, requestBody, frameworkMode)

    if (Object.keys(errors).length > 0) {
      return {
        status: 400,
        headers: buildHeaders(frameworkMode, 400),
        body: buildValidationError(errors, frameworkMode, endpoint),
        responseTime,
        dbQueries: 0,
        cacheUsed: false,
      }
    }

    // Wrong password simulation for login
    if (endpointId === 'auth-login') {
      const { email, password } = requestBody
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')
      const passOk = password && password.length >= 6 && password !== 'wrongpassword'

      if (!emailOk) {
        const body = frameworkMode === 'django'
          ? { email: ['Enter a valid email address.'] }
          : { detail: [{ loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error.email' }] }
        return { status: 400, headers: buildHeaders(frameworkMode, 400), body, responseTime, dbQueries: 1, cacheUsed: false }
      }

      if (!passOk) {
        return {
          status: 401,
          headers: buildHeaders(frameworkMode, 401),
          body: schemas[401],
          responseTime,
          dbQueries: 2,
          cacheUsed: false,
        }
      }
    }
  }

  // ── Success ──────────────────────────────────────────────
  const successCode = endpoint.method === 'POST' && endpointId.includes('create') ? 201 : 200
  const successSchema = schemas[successCode] || schemas[200] || schemas[201]

  return {
    status: successCode,
    headers: buildHeaders(frameworkMode, successCode),
    body: successSchema,
    responseTime,
    dbQueries: highLoad ? profile.queries + 1 : profile.queries,
    cacheUsed: highLoad ? false : profile.cacheUsed,
  }
}

// ─────────────────────────────────────────────────────────────
// Build realistic response headers per framework
// ─────────────────────────────────────────────────────────────
function buildHeaders(mode, status) {
  const base = {
    'Content-Type': 'application/json',
    'X-Request-ID': `req_${Math.random().toString(36).substr(2, 9)}`,
    'X-RateLimit-Remaining': String(Math.floor(Math.random() * 8) + 1),
  }
  if (mode === 'django') {
    return {
      ...base,
      Server: 'gunicorn/21.2.0',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      Allow: status === 405 ? 'GET, POST, HEAD, OPTIONS' : undefined,
    }
  } else {
    return {
      ...base,
      Server: 'uvicorn',
      'X-Process-Time': `${(Math.random() * 0.05).toFixed(4)}s`,
      'Access-Control-Allow-Origin': '*',
    }
  }
}