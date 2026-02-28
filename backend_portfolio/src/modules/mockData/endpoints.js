// Central endpoint definitions — single source of truth for all simulation data

export const endpoints = [
  // ── AUTHENTICATION ──────────────────────────────────────────────
  {
    id: 'auth-login',
    category: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'Authenticate user and issue tokens',
    requiresAuth: false,
    rateLimit: '10/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "email": "user@example.com",\n  "password": "secret123"\n}`,
    validationRules: {
      requiredFields: ['email', 'password'],
      emailField: 'email',
      passwordField: 'password',
      correctEmail: 'user@example.com',
      correctPassword: 'secret123'
    },
    responses: {
      django: {
        200: { access: 'eyJhbGci...', refresh: 'dGoken...', user: { id: 1, email: 'user@example.com', role: 'member' } },
        400: { email: ['This field is required.'] },
        401: { detail: 'No active account found with the given credentials.' }
      },
      fastapi: {
        200: { access_token: 'eyJhbGci...', token_type: 'bearer', refresh_token: 'dGoken...', user: { id: 1, email: 'user@example.com', role: 'member' } },
        400: { detail: [{ loc: ['body', 'email'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Incorrect email or password' }
      }
    },
    database: {
      tables: [
        { name: 'users', ops: ['SELECT by email (indexed)'], reason: 'Lookup user by email for credential check' },
        { name: 'auth_tokens', ops: ['INSERT refresh token'], reason: 'Persist refresh token for rotation' }
      ],
      indexes: ['users.email', 'auth_tokens.user_id'],
      relationships: 'auth_tokens.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 2, cache: false, avgMs: 38, coldMs: 72 },
      fastapi: { queries: 2, cache: false, avgMs: 28, coldMs: 55 }
    },
    security: [
      { title: 'Password Hashing', body: 'Passwords stored with bcrypt (cost factor 12). Never compared in plaintext.' },
      { title: 'JWT Expiration', body: 'Access token expires in 15 min. Refresh token expires in 7 days.' },
      { title: 'Refresh Rotation', body: 'Each use of a refresh token invalidates the previous one to prevent replay attacks.' },
      { title: 'Brute Force', body: 'Rate limited to 10 requests/min per IP. After 5 failures, account lockout for 15 min.' }
    ],
    flow: ['Request', 'Rate Limiter', 'Input Validation', 'User Lookup (DB)', 'Password Verify', 'Token Generation', 'Response']
  },
  {
    id: 'auth-refresh',
    category: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    summary: 'Refresh access token using refresh token',
    requiresAuth: false,
    rateLimit: '20/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "refresh": "dGoken..."\n}`,
    validationRules: { requiredFields: ['refresh'] },
    responses: {
      django:  { 200: { access: 'eyJhbGci_new...' }, 400: { refresh: ['This field is required.'] }, 401: { detail: 'Token is invalid or expired' } },
      fastapi: { 200: { access_token: 'eyJhbGci_new...', token_type: 'bearer' }, 400: { detail: [{ loc: ['body', 'refresh'], msg: 'field required', type: 'value_error.missing' }] }, 401: { detail: 'Token invalid or expired' } }
    },
    database: {
      tables: [{ name: 'auth_tokens', ops: ['SELECT by token', 'UPDATE (rotate)'], reason: 'Validate and rotate refresh token' }],
      indexes: ['auth_tokens.token (unique)'],
      relationships: 'auth_tokens.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 2, cache: false, avgMs: 22, coldMs: 45 },
      fastapi: { queries: 2, cache: false, avgMs: 16, coldMs: 32 }
    },
    security: [
      { title: 'Token Rotation', body: 'Refresh tokens are single-use. Each refresh invalidates the previous token.' },
      { title: 'Stateless Design', body: 'Access tokens are verified via signature only — no DB hit required for access token validation.' }
    ],
    flow: ['Request', 'Token Signature Check', 'DB Lookup', 'Token Rotation', 'New Access Token', 'Response']
  },
  {
    id: 'auth-logout',
    category: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/logout',
    summary: 'Invalidate refresh token and end session',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: true,
    defaultBody: `{\n  "refresh": "dGoken..."\n}`,
    validationRules: { requiredFields: ['refresh'] },
    responses: {
      django:  { 200: { detail: 'Successfully logged out.' }, 400: { refresh: ['This field is required.'] }, 401: { detail: 'Authentication credentials were not provided.' } },
      fastapi: { 200: { message: 'Successfully logged out' }, 400: { detail: [{ loc: ['body', 'refresh'], msg: 'field required', type: 'value_error.missing' }] }, 401: { detail: 'Not authenticated' } }
    },
    database: {
      tables: [{ name: 'auth_tokens', ops: ['DELETE by token'], reason: 'Invalidate refresh token on logout' }],
      indexes: ['auth_tokens.token (unique)'],
      relationships: 'auth_tokens.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 1, cache: false, avgMs: 18, coldMs: 38 },
      fastapi: { queries: 1, cache: false, avgMs: 12, coldMs: 25 }
    },
    security: [
      { title: 'Token Blacklisting', body: 'Refresh token is deleted from DB on logout. Even if intercepted, it cannot be reused.' },
      { title: 'Auth Required', body: 'Must send valid access token in Authorization header to call this endpoint.' }
    ],
    flow: ['Request', 'JWT Middleware', 'Token Lookup', 'Token Delete', '200 OK']
  },

  // ── USERS ────────────────────────────────────────────────────────
  {
    id: 'users-list',
    category: 'Users',
    method: 'GET',
    path: '/api/v1/users/',
    summary: 'List all users (admin only)',
    requiresAuth: true,
    rateLimit: '60/min',
    contentType: 'application/json',
    idempotent: true,
    defaultBody: `// No body required for GET`,
    validationRules: {},
    responses: {
      django:  { 200: { count: 42, next: '/api/v1/users/?page=2', results: [{ id: 1, email: 'user@example.com', role: 'member', created_at: '2024-01-15' }] }, 401: { detail: 'Authentication credentials were not provided.' }, 403: { detail: 'You do not have permission to perform this action.' } },
      fastapi: { 200: { total: 42, page: 1, size: 20, items: [{ id: 1, email: 'user@example.com', role: 'member', created_at: '2024-01-15' }] }, 401: { detail: 'Not authenticated' }, 403: { detail: 'Insufficient permissions' } }
    },
    database: {
      tables: [{ name: 'users', ops: ['SELECT * with pagination'], reason: 'Paginated user list for admin panel' }],
      indexes: ['users.created_at', 'users.role'],
      relationships: 'Standalone — no joins required for basic list'
    },
    performance: {
      django:  { queries: 2, cache: true, avgMs: 24, coldMs: 58 },
      fastapi: { queries: 2, cache: true, avgMs: 18, coldMs: 40 }
    },
    security: [
      { title: 'Role-Based Access', body: 'Only users with role=admin can access this endpoint. Checked at middleware level.' },
      { title: 'Pagination', body: 'Always paginated (page_size=20 default) to prevent full-table exposure.' }
    ],
    flow: ['Request', 'JWT Middleware', 'RBAC Check (admin)', 'DB Query (paginated)', 'Serialize', 'Response']
  },
  {
    id: 'users-me',
    category: 'Users',
    method: 'GET',
    path: '/api/v1/users/me/',
    summary: 'Get current authenticated user profile',
    requiresAuth: true,
    rateLimit: '120/min',
    contentType: 'application/json',
    idempotent: true,
    defaultBody: `// No body required for GET`,
    validationRules: {},
    responses: {
      django:  { 200: { id: 1, email: 'user@example.com', first_name: 'Uzair', last_name: 'Waseem', role: 'member', created_at: '2024-01-15', last_login: '2024-03-20' }, 401: { detail: 'Authentication credentials were not provided.' } },
      fastapi: { 200: { id: 1, email: 'user@example.com', first_name: 'Uzair', last_name: 'Waseem', role: 'member', created_at: '2024-01-15', last_login: '2024-03-20' }, 401: { detail: 'Not authenticated' } }
    },
    database: {
      tables: [{ name: 'users', ops: ['SELECT by id (from JWT)'], reason: 'Fetch profile using user_id decoded from token' }],
      indexes: ['users.id (PK)'],
      relationships: 'Standalone — single user row'
    },
    performance: {
      django:  { queries: 1, cache: true, avgMs: 12, coldMs: 28 },
      fastapi: { queries: 1, cache: true, avgMs: 8,  coldMs: 18 }
    },
    security: [
      { title: 'Self-Only Access', body: 'User ID is extracted from JWT — users cannot query other profiles via this endpoint.' },
      { title: 'Caching', body: 'Profile cached in Redis for 5 min with user_id as cache key. Invalidated on profile update.' }
    ],
    flow: ['Request', 'JWT Decode (user_id)', 'Cache Check', 'DB Query (on miss)', 'Response']
  },

  // ── ORDERS ───────────────────────────────────────────────────────
  {
    id: 'orders-create',
    category: 'Orders',
    method: 'POST',
    path: '/api/v1/orders/',
    summary: 'Create a new order',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "items": [\n    { "product_id": 5, "quantity": 2 },\n    { "product_id": 12, "quantity": 1 }\n  ],\n  "shipping_address": "123 Main St, Karachi"\n}`,
    validationRules: { requiredFields: ['items', 'shipping_address'] },
    responses: {
      django:  { 200: { id: 1042, status: 'pending', total_amount: '4500.00', items: [{ product_id: 5, quantity: 2, price: '1500.00' }], created_at: '2024-03-21T10:00:00Z' }, 400: { items: ['This field is required.'], shipping_address: ['This field is required.'] }, 401: { detail: 'Authentication credentials were not provided.' } },
      fastapi: { 200: { id: 1042, status: 'pending', total_amount: 4500.0, items: [{ product_id: 5, quantity: 2, price: 1500.0 }], created_at: '2024-03-21T10:00:00Z' }, 400: { detail: [{ loc: ['body', 'items'], msg: 'field required', type: 'value_error.missing' }] }, 401: { detail: 'Not authenticated' } }
    },
    database: {
      tables: [
        { name: 'orders', ops: ['INSERT new order'], reason: 'Create order record with user_id FK' },
        { name: 'order_items', ops: ['INSERT multiple rows'], reason: 'Bulk insert line items' },
        { name: 'products', ops: ['SELECT for price lookup'], reason: 'Fetch current prices for items' }
      ],
      indexes: ['orders.user_id', 'order_items.order_id', 'products.id (PK)'],
      relationships: 'order_items.order_id → orders.id (FK), order_items.product_id → products.id (FK)'
    },
    performance: {
      django:  { queries: 4, cache: false, avgMs: 65, coldMs: 120 },
      fastapi: { queries: 4, cache: false, avgMs: 48, coldMs: 90 }
    },
    security: [
      { title: 'Auth Required', body: 'Order is linked to authenticated user. user_id injected server-side from JWT — never from request body.' },
      { title: 'Atomic Transaction', body: 'All DB inserts wrapped in a transaction. If any item fails, entire order is rolled back.' }
    ],
    flow: ['Request', 'JWT Auth', 'Validate Items', 'Price Lookup (DB)', 'Atomic Transaction', 'Order + Items Insert', 'Response']
  },
  {
    id: 'orders-list',
    category: 'Orders',
    method: 'GET',
    path: '/api/v1/orders/',
    summary: 'List orders for current user',
    requiresAuth: true,
    rateLimit: '60/min',
    contentType: 'application/json',
    idempotent: true,
    defaultBody: `// No body required for GET`,
    validationRules: {},
    responses: {
      django:  { 200: { count: 8, results: [{ id: 1042, status: 'delivered', total_amount: '4500.00', created_at: '2024-03-21' }] }, 401: { detail: 'Authentication credentials were not provided.' } },
      fastapi: { 200: { total: 8, items: [{ id: 1042, status: 'delivered', total_amount: 4500.0, created_at: '2024-03-21' }] }, 401: { detail: 'Not authenticated' } }
    },
    database: {
      tables: [{ name: 'orders', ops: ['SELECT WHERE user_id (indexed)'], reason: 'Fetch orders scoped to authenticated user' }],
      indexes: ['orders.user_id', 'orders.created_at'],
      relationships: 'orders.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 1, cache: true, avgMs: 20, coldMs: 45 },
      fastapi: { queries: 1, cache: true, avgMs: 15, coldMs: 32 }
    },
    security: [
      { title: 'Scoped Query', body: 'WHERE clause always includes user_id from JWT. Users cannot see other users\' orders.' }
    ],
    flow: ['Request', 'JWT Decode', 'Scoped DB Query', 'Cache Store', 'Response']
  },

  // ── PAYMENTS ─────────────────────────────────────────────────────
  {
    id: 'payments-initiate',
    category: 'Payments',
    method: 'POST',
    path: '/api/v1/payments/initiate/',
    summary: 'Initiate payment for an order',
    requiresAuth: true,
    rateLimit: '15/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "order_id": 1042,\n  "method": "card",\n  "return_url": "https://myapp.com/payment/success"\n}`,
    validationRules: { requiredFields: ['order_id', 'method'] },
    responses: {
      django:  { 200: { payment_id: 'pay_3x9aJ', status: 'pending', checkout_url: 'https://stripe.com/checkout/xxx', expires_at: '2024-03-21T10:15:00Z' }, 400: { order_id: ['This field is required.'] }, 404: { detail: 'Order not found or does not belong to user.' } },
      fastapi: { 200: { payment_id: 'pay_3x9aJ', status: 'pending', checkout_url: 'https://stripe.com/checkout/xxx', expires_at: '2024-03-21T10:15:00Z' }, 400: { detail: [{ loc: ['body', 'order_id'], msg: 'field required', type: 'value_error.missing' }] }, 404: { detail: 'Order not found' } }
    },
    database: {
      tables: [
        { name: 'orders', ops: ['SELECT by id + user_id'], reason: 'Verify order belongs to user' },
        { name: 'payments', ops: ['INSERT payment record'], reason: 'Create pending payment record' }
      ],
      indexes: ['orders.id (PK)', 'payments.order_id'],
      relationships: 'payments.order_id → orders.id (FK)'
    },
    performance: {
      django:  { queries: 2, cache: false, avgMs: 90, coldMs: 180 },
      fastapi: { queries: 2, cache: false, avgMs: 70, coldMs: 140 }
    },
    security: [
      { title: 'Order Ownership Check', body: 'Before initiating payment, system verifies order.user_id matches JWT user_id.' },
      { title: 'Idempotency Key', body: 'Duplicate payment attempts for same order return existing pending payment rather than creating new one.' }
    ],
    flow: ['Request', 'Auth', 'Order Ownership Verify', 'Payment Gateway Call', 'DB Insert', 'Response']
  },

  // ── AI SERVICES ──────────────────────────────────────────────────
  {
    id: 'ai-schema-gen',
    category: 'AI Services',
    method: 'POST',
    path: '/api/v1/ai/schema-generate/',
    summary: 'Generate database schema from requirements',
    requiresAuth: true,
    rateLimit: '5/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "description": "E-commerce platform with products, users, orders and reviews",\n  "db_type": "postgresql"\n}`,
    validationRules: { requiredFields: ['description', 'db_type'] },
    responses: {
      django:  { 200: { job_id: 'job_ai_99x', status: 'queued', estimated_ms: 3200, message: 'Schema generation queued. Poll /ai/jobs/{job_id} for result.' }, 400: { description: ['This field is required.'] }, 429: { detail: 'Rate limit exceeded. AI endpoints are throttled to 5/min.' } },
      fastapi: { 200: { job_id: 'job_ai_99x', status: 'queued', estimated_ms: 2800, message: 'Schema generation queued.' }, 400: { detail: [{ loc: ['body', 'description'], msg: 'field required', type: 'value_error.missing' }] }, 429: { detail: 'Rate limit exceeded' } }
    },
    database: {
      tables: [
        { name: 'ai_jobs', ops: ['INSERT job record'], reason: 'Track async AI generation job' },
        { name: 'users', ops: ['SELECT for quota check'], reason: 'Check user AI usage quota' }
      ],
      indexes: ['ai_jobs.user_id', 'ai_jobs.status'],
      relationships: 'ai_jobs.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 2, cache: false, avgMs: 120, coldMs: 350 },
      fastapi: { queries: 2, cache: false, avgMs: 85, coldMs: 220 }
    },
    security: [
      { title: 'Strict Rate Limiting', body: 'AI endpoints limited to 5/min due to LLM compute cost. Per-user quota tracked in Redis.' },
      { title: 'Async Processing', body: 'AI jobs processed asynchronously by Celery worker. Response returns job_id immediately.' }
    ],
    flow: ['Request', 'Auth + Quota Check', 'Job Queue (Celery)', 'OpenAI API Call (Worker)', 'Result Store (DB)', 'Webhook/Poll']
  },
  {
    id: 'ai-chat',
    category: 'AI Services',
    method: 'POST',
    path: '/api/v1/ai/chat/',
    summary: 'Chat with AI assistant for backend guidance',
    requiresAuth: true,
    rateLimit: '20/min',
    contentType: 'application/json',
    idempotent: false,
    defaultBody: `{\n  "message": "How do I optimize N+1 queries in Django?",\n  "session_id": "sess_abc123"\n}`,
    validationRules: { requiredFields: ['message'] },
    responses: {
      django:  { 200: { reply: 'Use select_related() for FK joins and prefetch_related() for M2M. Example: User.objects.select_related("profile").all()', session_id: 'sess_abc123', tokens_used: 148 }, 400: { message: ['This field is required.'] } },
      fastapi: { 200: { reply: 'Use select_related() for FK joins and prefetch_related() for M2M.', session_id: 'sess_abc123', tokens_used: 148, model: 'gpt-4' }, 400: { detail: [{ loc: ['body', 'message'], msg: 'field required', type: 'value_error.missing' }] } }
    },
    database: {
      tables: [
        { name: 'chat_sessions', ops: ['SELECT session history', 'INSERT new message'], reason: 'Load conversation context for AI' }
      ],
      indexes: ['chat_sessions.session_id (unique)', 'chat_sessions.user_id'],
      relationships: 'chat_sessions.user_id → users.id (FK)'
    },
    performance: {
      django:  { queries: 2, cache: false, avgMs: 1800, coldMs: 3500 },
      fastapi: { queries: 2, cache: false, avgMs: 1400, coldMs: 2800 }
    },
    security: [
      { title: 'Session Isolation', body: 'session_id validated against JWT user_id. Users cannot access other sessions.' },
      { title: 'Token Budget', body: 'Max 2000 tokens per request. History truncated using sliding window to control costs.' }
    ],
    flow: ['Request', 'Auth', 'Load Session History', 'OpenAI API Call', 'Save Response', 'Stream/Return']
  }
]

export const categories = [...new Set(endpoints.map(e => e.category))]

export function getEndpointsByCategory() {
  return categories.reduce((acc, cat) => {
    acc[cat] = endpoints.filter(e => e.category === cat)
    return acc
  }, {})
}