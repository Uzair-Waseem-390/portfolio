// ─────────────────────────────────────────────────────────────
// ENDPOINT DEFINITIONS
// Each endpoint has framework-specific response schemas, DB impact,
// performance profiles, and security notes.
// ─────────────────────────────────────────────────────────────

export const endpoints = [
  // ─── AUTHENTICATION ────────────────────────────────────────
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Authentication',
    requiresAuth: false,
    isLoginEndpoint: true,
    rateLimit: '10/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Authenticate user and receive JWT access + refresh tokens.',
    requestSchema: {
      email: 'user@example.com',
      password: 'SecurePass123',
    },
    validationRules: {
      email: { required: true, format: 'email' },
      password: { required: true, minLength: 6 },
    },
    responseSchemas: {
      django: {
        200: {
          access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0MiwiZXhwIjoxNzA5MDAwMDAwfQ.abc123',
          refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0MiwidHlwZSI6InJlZnJlc2gifQ.xyz789',
          user: { id: 42, email: 'user@example.com', role: 'user' },
        },
        400: { email: ['This field is required.'] },
        401: { detail: 'No active account found with the given credentials.' },
      },
      fastapi: {
        200: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsImV4cCI6MTcwOTAwMDAwMH0.abc123',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInR5cGUiOiJyZWZyZXNoIn0.xyz789',
          token_type: 'bearer',
          user: { id: 42, email: 'user@example.com', role: 'user' },
        },
        400: {
          detail: [{ loc: ['body', 'email'], msg: 'field required', type: 'value_error.missing' }],
        },
        401: { detail: 'Incorrect email or password.' },
      },
    },
    databaseImpact: {
      tables: ['users', 'refresh_tokens'],
      operations: [
        { op: 'SELECT', detail: 'SELECT * FROM users WHERE email = ? (email is indexed)' },
        { op: 'INSERT', detail: 'INSERT INTO refresh_tokens (user_id, token, expires_at)' },
      ],
      indexes: ['users.email (B-tree)', 'refresh_tokens.user_id (FK index)'],
      relationships: 'refresh_tokens.user_id → users.id (FK, CASCADE DELETE)',
    },
    performanceProfile: { queries: 2, cacheUsed: false, avgResponse: 38, coldStart: 72 },
    securityNotes: {
      jwt: 'JWT signed with HS256. Access token expires in 15 minutes.',
      rateLimit: 'Rate limited to 10/min per IP to prevent brute force.',
      hashing: 'Passwords hashed with bcrypt (cost factor 12). Never stored in plain text.',
      roleCheck: 'No role check on this endpoint — public access to obtain tokens.',
      refresh: 'Refresh token rotation: old token invalidated on use.',
    },
    flowDiagram: ['Request', 'Rate Limiter', 'Input Validation', 'DB Lookup', 'Bcrypt Verify', 'JWT Sign', 'Response'],
  },

  {
    id: 'auth-refresh',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    category: 'Authentication',
    requiresAuth: false,
    rateLimit: '20/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Exchange a valid refresh token for a new access token.',
    requestSchema: { refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    validationRules: { refresh: { required: true } },
    responseSchemas: {
      django: {
        200: { access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newtoken.sig' },
        400: { refresh: ['This field is required.'] },
        401: { detail: 'Token is invalid or expired.' },
      },
      fastapi: {
        200: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newtoken.sig', token_type: 'bearer' },
        400: { detail: [{ loc: ['body', 'refresh'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Could not validate credentials.' },
      },
    },
    databaseImpact: {
      tables: ['refresh_tokens'],
      operations: [
        { op: 'SELECT', detail: 'SELECT * FROM refresh_tokens WHERE token = ?' },
        { op: 'UPDATE', detail: 'UPDATE refresh_tokens SET token = ?, expires_at = ? (token rotation)' },
      ],
      indexes: ['refresh_tokens.token (B-tree unique)'],
      relationships: 'refresh_tokens.user_id → users.id',
    },
    performanceProfile: { queries: 2, cacheUsed: false, avgResponse: 22, coldStart: 45 },
    securityNotes: {
      jwt: 'Issues new access token (15 min expiry). Refresh token rotated on each use.',
      rateLimit: 'Moderate rate limit since refresh is expected periodically.',
      hashing: 'Refresh tokens stored as SHA-256 hash in DB — not raw value.',
      roleCheck: 'No role required — any authenticated user can refresh.',
      refresh: 'One-time use: old refresh token invalidated upon successful exchange.',
    },
    flowDiagram: ['Request', 'Token Validation', 'DB Lookup', 'Token Rotation', 'JWT Sign', 'Response'],
  },

  {
    id: 'auth-logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    category: 'Authentication',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'Invalidate the current refresh token and log user out.',
    requestSchema: { refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    validationRules: { refresh: { required: true } },
    responseSchemas: {
      django: {
        200: { detail: 'Successfully logged out.' },
        400: { refresh: ['This field is required.'] },
        401: { detail: 'Authentication credentials were not provided.' },
      },
      fastapi: {
        200: { message: 'Logged out successfully.' },
        400: { detail: [{ loc: ['body', 'refresh'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Not authenticated.' },
      },
    },
    databaseImpact: {
      tables: ['refresh_tokens'],
      operations: [{ op: 'DELETE', detail: 'DELETE FROM refresh_tokens WHERE token = ?' }],
      indexes: ['refresh_tokens.token (B-tree unique)'],
      relationships: 'Cascades handled by FK constraints on users table.',
    },
    performanceProfile: { queries: 1, cacheUsed: false, avgResponse: 18, coldStart: 35 },
    securityNotes: {
      jwt: 'Blacklists the provided refresh token. Access token remains valid until TTL.',
      rateLimit: 'Higher rate limit as logout should always succeed.',
      hashing: 'Token matched against stored hash before deletion.',
      roleCheck: 'Requires valid access token in Authorization header.',
      refresh: 'Logout does not immediately invalidate access token — short TTL mitigates risk.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Token Lookup', 'DB Delete', 'Response'],
  },

  // ─── USERS ─────────────────────────────────────────────────
  {
    id: 'users-list',
    method: 'GET',
    path: '/api/v1/users/',
    category: 'Users',
    requiresAuth: true,
    rateLimit: '60/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'Retrieve paginated list of users. Admin role required.',
    requestSchema: { page: 1, page_size: 10 },
    validationRules: {},
    responseSchemas: {
      django: {
        200: {
          count: 142,
          next: '/api/v1/users/?page=2',
          previous: null,
          results: [
            { id: 1, email: 'alice@example.com', role: 'user', created_at: '2024-01-15T10:30:00Z' },
            { id: 2, email: 'bob@example.com', role: 'admin', created_at: '2024-01-16T08:00:00Z' },
          ],
        },
        401: { detail: 'Authentication credentials were not provided.' },
        403: { detail: 'You do not have permission to perform this action.' },
      },
      fastapi: {
        200: {
          total: 142,
          page: 1,
          page_size: 10,
          items: [
            { id: 1, email: 'alice@example.com', role: 'user', created_at: '2024-01-15T10:30:00Z' },
            { id: 2, email: 'bob@example.com', role: 'admin', created_at: '2024-01-16T08:00:00Z' },
          ],
        },
        401: { detail: 'Not authenticated.' },
        403: { detail: 'Insufficient permissions.' },
      },
    },
    databaseImpact: {
      tables: ['users'],
      operations: [
        { op: 'SELECT COUNT', detail: 'SELECT COUNT(*) FROM users (for pagination total)' },
        { op: 'SELECT', detail: 'SELECT id, email, role, created_at FROM users LIMIT ? OFFSET ?' },
      ],
      indexes: ['users.id (PK)', 'users.created_at (for sorting)'],
      relationships: 'No joins on list endpoint — lean projection only.',
    },
    performanceProfile: { queries: 2, cacheUsed: true, avgResponse: 28, coldStart: 55 },
    securityNotes: {
      jwt: 'Requires valid Bearer token. Role checked before query executes.',
      rateLimit: 'Rate limited at 60/min. Admin endpoints monitored separately.',
      hashing: 'Password fields excluded from serializer output.',
      roleCheck: 'Admin role required. Regular users receive 403.',
      refresh: 'Response cached for 60s. Cache busted on any user write.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Role Check (Admin)', 'Cache Lookup', 'DB Query', 'Serialize', 'Response'],
  },

  {
    id: 'users-me',
    method: 'GET',
    path: '/api/v1/users/me/',
    category: 'Users',
    requiresAuth: true,
    rateLimit: '60/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'Get the profile of the currently authenticated user.',
    requestSchema: {},
    validationRules: {},
    responseSchemas: {
      django: {
        200: { id: 42, email: 'user@example.com', role: 'user', first_name: 'Uzair', last_name: 'Waseem', created_at: '2024-01-15T10:30:00Z', is_active: true },
        401: { detail: 'Authentication credentials were not provided.' },
      },
      fastapi: {
        200: { id: 42, email: 'user@example.com', role: 'user', first_name: 'Uzair', last_name: 'Waseem', created_at: '2024-01-15T10:30:00Z', is_active: true },
        401: { detail: 'Not authenticated.' },
      },
    },
    databaseImpact: {
      tables: ['users'],
      operations: [{ op: 'SELECT', detail: 'SELECT * FROM users WHERE id = ? (user_id from JWT)' }],
      indexes: ['users.id (PK)'],
      relationships: 'Single table, PK lookup — O(1) with index.',
    },
    performanceProfile: { queries: 1, cacheUsed: true, avgResponse: 14, coldStart: 28 },
    securityNotes: {
      jwt: 'user_id extracted from JWT payload — no request body needed.',
      rateLimit: 'Moderate limit. Repeated calls suggest client caching issue.',
      hashing: 'Password field always excluded from output.',
      roleCheck: 'Any authenticated user can access their own profile.',
      refresh: 'Result cached per user_id with 120s TTL.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Extract user_id', 'Cache Check', 'DB Lookup (PK)', 'Response'],
  },

  {
    id: 'users-update',
    method: 'PATCH',
    path: '/api/v1/users/me/',
    category: 'Users',
    requiresAuth: true,
    rateLimit: '20/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Partially update the authenticated user profile.',
    requestSchema: { first_name: 'Uzair', last_name: 'Waseem' },
    validationRules: { first_name: { maxLength: 50 }, last_name: { maxLength: 50 } },
    responseSchemas: {
      django: {
        200: { id: 42, email: 'user@example.com', first_name: 'Uzair', last_name: 'Waseem', updated_at: '2024-02-01T12:00:00Z' },
        400: { first_name: ['Ensure this field has no more than 50 characters.'] },
        401: { detail: 'Authentication credentials were not provided.' },
      },
      fastapi: {
        200: { id: 42, email: 'user@example.com', first_name: 'Uzair', last_name: 'Waseem', updated_at: '2024-02-01T12:00:00Z' },
        400: { detail: [{ loc: ['body', 'first_name'], msg: 'ensure this value has at most 50 characters', type: 'value_error.any_str.max_length' }] },
        401: { detail: 'Not authenticated.' },
      },
    },
    databaseImpact: {
      tables: ['users'],
      operations: [{ op: 'UPDATE', detail: 'UPDATE users SET first_name = ?, last_name = ?, updated_at = NOW() WHERE id = ?' }],
      indexes: ['users.id (PK)'],
      relationships: 'Single table update. Cache invalidated after write.',
    },
    performanceProfile: { queries: 1, cacheUsed: false, avgResponse: 24, coldStart: 48 },
    securityNotes: {
      jwt: 'Can only update own profile. Admin can update any via separate endpoint.',
      rateLimit: 'Low rate limit to prevent rapid field enumeration.',
      hashing: 'Password changes handled by dedicated /change-password endpoint.',
      roleCheck: 'Object-level permission: user_id from JWT must match resource.',
      refresh: 'Cache for /users/me invalidated on successful PATCH.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Deserialize + Validate', 'Object Permission', 'DB Update', 'Cache Bust', 'Response'],
  },

  // ─── ORDERS ────────────────────────────────────────────────
  {
    id: 'orders-list',
    method: 'GET',
    path: '/api/v1/orders/',
    category: 'Orders',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'List all orders belonging to the authenticated user.',
    requestSchema: { status: 'pending', page: 1 },
    validationRules: {},
    responseSchemas: {
      django: {
        200: {
          count: 8,
          next: null,
          previous: null,
          results: [
            { id: 101, status: 'completed', total: '120.00', created_at: '2024-01-20T14:00:00Z' },
            { id: 102, status: 'pending', total: '55.00', created_at: '2024-02-01T09:30:00Z' },
          ],
        },
        401: { detail: 'Authentication credentials were not provided.' },
      },
      fastapi: {
        200: {
          total: 8,
          page: 1,
          items: [
            { id: 101, status: 'completed', total: 120.0, created_at: '2024-01-20T14:00:00Z' },
            { id: 102, status: 'pending', total: 55.0, created_at: '2024-02-01T09:30:00Z' },
          ],
        },
        401: { detail: 'Not authenticated.' },
      },
    },
    databaseImpact: {
      tables: ['orders', 'order_items'],
      operations: [
        { op: 'SELECT', detail: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC' },
        { op: 'SELECT', detail: 'SELECT * FROM order_items WHERE order_id IN (...)' },
      ],
      indexes: ['orders.user_id (FK index)', 'orders.created_at', 'orders.status'],
      relationships: 'orders.user_id → users.id | order_items.order_id → orders.id',
    },
    performanceProfile: { queries: 2, cacheUsed: true, avgResponse: 45, coldStart: 90 },
    securityNotes: {
      jwt: 'Filters by user_id from JWT — users can only see own orders.',
      rateLimit: 'Moderate. Pagination required — max 20 items per page.',
      hashing: 'No sensitive hashing needed on read.',
      roleCheck: 'Admin bypass available to see all orders via ?all=true.',
      refresh: 'Cached with short TTL (30s) — orders change frequently.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Filter by user_id', 'DB Query + Join', 'Serialize', 'Response'],
  },

  {
    id: 'orders-create',
    method: 'POST',
    path: '/api/v1/orders/',
    category: 'Orders',
    requiresAuth: true,
    rateLimit: '10/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Create a new order with one or more items.',
    requestSchema: { items: [{ product_id: 7, quantity: 2 }, { product_id: 14, quantity: 1 }] },
    validationRules: { items: { required: true, minLength: 1 } },
    responseSchemas: {
      django: {
        201: { id: 103, status: 'pending', total: '89.97', items: [{ product_id: 7, quantity: 2, unit_price: '29.99' }], created_at: '2024-02-10T15:00:00Z' },
        400: { items: ['This field is required.'] },
        401: { detail: 'Authentication credentials were not provided.' },
      },
      fastapi: {
        201: { id: 103, status: 'pending', total: 89.97, items: [{ product_id: 7, quantity: 2, unit_price: 29.99 }], created_at: '2024-02-10T15:00:00Z' },
        400: { detail: [{ loc: ['body', 'items'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Not authenticated.' },
      },
    },
    databaseImpact: {
      tables: ['orders', 'order_items', 'products'],
      operations: [
        { op: 'SELECT', detail: 'SELECT price FROM products WHERE id IN (?) — validate & price lookup' },
        { op: 'INSERT', detail: 'INSERT INTO orders (user_id, status, total) VALUES (...)' },
        { op: 'INSERT', detail: 'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (...)' },
      ],
      indexes: ['products.id (PK)', 'orders.user_id', 'order_items.order_id'],
      relationships: 'order_items.order_id → orders.id | order_items.product_id → products.id',
    },
    performanceProfile: { queries: 3, cacheUsed: false, avgResponse: 68, coldStart: 130 },
    securityNotes: {
      jwt: 'user_id from JWT assigned as order owner — client cannot spoof.',
      rateLimit: 'Strict limit to prevent order spam and inventory abuse.',
      hashing: 'Prices fetched from DB — client-submitted prices ignored.',
      roleCheck: 'Any authenticated user can create orders.',
      refresh: 'DB transaction used — all inserts atomic. Rollback on failure.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Validate Items', 'DB Transaction', 'Price Lookup', 'Create Order', 'Create Items', 'Commit', 'Response'],
  },

  // ─── PAYMENTS ──────────────────────────────────────────────
  {
    id: 'payments-initiate',
    method: 'POST',
    path: '/api/v1/payments/initiate/',
    category: 'Payments',
    requiresAuth: true,
    rateLimit: '5/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Initiate payment for a pending order. Returns payment intent.',
    requestSchema: { order_id: 103, payment_method: 'card' },
    validationRules: { order_id: { required: true }, payment_method: { required: true } },
    responseSchemas: {
      django: {
        200: { payment_id: 'pay_abc123xyz', status: 'pending', amount: '89.97', currency: 'USD', client_secret: 'pi_secret_xyz' },
        400: { order_id: ['This field is required.'] },
        401: { detail: 'Authentication credentials were not provided.' },
        404: { detail: 'Order not found.' },
      },
      fastapi: {
        200: { payment_id: 'pay_abc123xyz', status: 'pending', amount: 89.97, currency: 'USD', client_secret: 'pi_secret_xyz' },
        400: { detail: [{ loc: ['body', 'order_id'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Not authenticated.' },
        404: { detail: 'Order with given id not found.' },
      },
    },
    databaseImpact: {
      tables: ['orders', 'payments'],
      operations: [
        { op: 'SELECT', detail: 'SELECT * FROM orders WHERE id = ? AND user_id = ?' },
        { op: 'INSERT', detail: 'INSERT INTO payments (order_id, amount, status, provider_ref)' },
        { op: 'UPDATE', detail: "UPDATE orders SET status = 'payment_pending' WHERE id = ?" },
      ],
      indexes: ['orders.id (PK)', 'payments.order_id (FK index)'],
      relationships: 'payments.order_id → orders.id (one-to-one for active payment)',
    },
    performanceProfile: { queries: 3, cacheUsed: false, avgResponse: 95, coldStart: 180 },
    securityNotes: {
      jwt: 'Order ownership validated: order.user_id must match JWT user_id.',
      rateLimit: 'Strict 5/min to prevent payment abuse and gateway hammering.',
      hashing: 'No sensitive data stored — client_secret from payment provider only.',
      roleCheck: 'User can only pay for their own orders.',
      refresh: 'Idempotency key concept: duplicate requests return same payment intent.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Order Lookup', 'Ownership Check', 'Payment Gateway', 'DB Insert', 'Response'],
  },

  {
    id: 'payments-status',
    method: 'GET',
    path: '/api/v1/payments/{payment_id}/',
    category: 'Payments',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'Check the status of a specific payment.',
    requestSchema: {},
    validationRules: {},
    responseSchemas: {
      django: {
        200: { payment_id: 'pay_abc123xyz', status: 'completed', amount: '89.97', paid_at: '2024-02-10T15:05:00Z' },
        401: { detail: 'Authentication credentials were not provided.' },
        404: { detail: 'Payment not found.' },
      },
      fastapi: {
        200: { payment_id: 'pay_abc123xyz', status: 'completed', amount: 89.97, paid_at: '2024-02-10T15:05:00Z' },
        401: { detail: 'Not authenticated.' },
        404: { detail: 'Payment not found.' },
      },
    },
    databaseImpact: {
      tables: ['payments'],
      operations: [{ op: 'SELECT', detail: 'SELECT * FROM payments WHERE id = ? AND order_id IN (user orders)' }],
      indexes: ['payments.id (PK)', 'payments.order_id'],
      relationships: 'payments.order_id → orders.id → users.id (ownership chain)',
    },
    performanceProfile: { queries: 1, cacheUsed: true, avgResponse: 20, coldStart: 40 },
    securityNotes: {
      jwt: 'Ownership chain: payment → order → user validated before returning data.',
      rateLimit: 'Moderate — polling is common, but excessive polling penalized.',
      hashing: 'Payment provider reference IDs are opaque tokens.',
      roleCheck: 'Users can only query own payment records.',
      refresh: 'Cached for 30s. Cache busted on webhook-received status update.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Payment Lookup', 'Ownership Chain Check', 'Cache', 'Response'],
  },

  // ─── AI SERVICES ────────────────────────────────────────────
  {
    id: 'ai-generate',
    method: 'POST',
    path: '/api/v1/ai/generate/',
    category: 'AI Services',
    requiresAuth: true,
    rateLimit: '5/min',
    contentType: 'application/json',
    idempotent: false,
    description: 'Submit a prompt to the AI agent. Response streamed asynchronously.',
    requestSchema: { prompt: 'Generate a database schema for a school management system', context: 'multi-branch SaaS' },
    validationRules: { prompt: { required: true, maxLength: 2000 } },
    responseSchemas: {
      django: {
        202: { task_id: 'task_ai_7f3b9c', status: 'queued', estimated_wait: '3-5s', result_url: '/api/v1/ai/results/task_ai_7f3b9c/' },
        400: { prompt: ['This field is required.'] },
        401: { detail: 'Authentication credentials were not provided.' },
        429: { detail: 'Request was throttled. Expected available in 12s.' },
      },
      fastapi: {
        202: { task_id: 'task_ai_7f3b9c', status: 'queued', estimated_wait_seconds: 4, result_endpoint: '/api/v1/ai/results/task_ai_7f3b9c/' },
        400: { detail: [{ loc: ['body', 'prompt'], msg: 'field required', type: 'value_error.missing' }] },
        401: { detail: 'Not authenticated.' },
        429: { detail: 'Too many requests. Retry after 12 seconds.', retry_after: 12 },
      },
    },
    databaseImpact: {
      tables: ['ai_jobs', 'users'],
      operations: [
        { op: 'SELECT', detail: 'SELECT usage_count FROM users WHERE id = ? (quota check)' },
        { op: 'INSERT', detail: 'INSERT INTO ai_jobs (user_id, prompt, status, created_at)' },
      ],
      indexes: ['ai_jobs.user_id (FK index)', 'ai_jobs.status', 'ai_jobs.created_at'],
      relationships: 'ai_jobs.user_id → users.id | Background worker picks up queued jobs',
    },
    performanceProfile: { queries: 2, cacheUsed: false, avgResponse: 120, coldStart: 250 },
    securityNotes: {
      jwt: 'User quota enforced per JWT user_id before dispatching to AI worker.',
      rateLimit: 'Strict 5/min — AI calls are expensive. Quota tracked in DB.',
      hashing: 'API keys for OpenAI stored in env vars, never in DB or logs.',
      roleCheck: 'Premium users get higher quotas. Checked against user.plan field.',
      refresh: 'Async pattern: returns 202 + task_id immediately. Result polled separately.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Quota Check', 'DB Insert Job', 'Queue Worker', 'OpenAI SDK', 'DB Update Result', 'Client Polls'],
  },

  {
    id: 'ai-results',
    method: 'GET',
    path: '/api/v1/ai/results/{task_id}/',
    category: 'AI Services',
    requiresAuth: true,
    rateLimit: '30/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'Poll for AI job result. Returns result when job completes.',
    requestSchema: {},
    validationRules: {},
    responseSchemas: {
      django: {
        200: { task_id: 'task_ai_7f3b9c', status: 'completed', result: 'Generated schema:\n\nCREATE TABLE branches (id SERIAL PRIMARY KEY, name VARCHAR(100)...)', completed_at: '2024-02-10T15:01:04Z' },
        202: { task_id: 'task_ai_7f3b9c', status: 'processing', progress: '60%' },
        401: { detail: 'Authentication credentials were not provided.' },
        404: { detail: 'Task not found.' },
      },
      fastapi: {
        200: { task_id: 'task_ai_7f3b9c', status: 'completed', result: 'Generated schema:\n\nCREATE TABLE branches (id SERIAL PRIMARY KEY, name VARCHAR(100)...)', completed_at: '2024-02-10T15:01:04Z' },
        202: { task_id: 'task_ai_7f3b9c', status: 'processing', progress_pct: 60 },
        401: { detail: 'Not authenticated.' },
        404: { detail: 'AI task not found or unauthorized.' },
      },
    },
    databaseImpact: {
      tables: ['ai_jobs'],
      operations: [{ op: 'SELECT', detail: 'SELECT status, result FROM ai_jobs WHERE id = ? AND user_id = ?' }],
      indexes: ['ai_jobs.id (PK)', 'ai_jobs.user_id'],
      relationships: 'Ownership check: ai_jobs.user_id must match JWT user_id',
    },
    performanceProfile: { queries: 1, cacheUsed: true, avgResponse: 15, coldStart: 30 },
    securityNotes: {
      jwt: 'Task ownership enforced — users cannot poll other users tasks.',
      rateLimit: 'Moderate rate limit on polling endpoint.',
      hashing: 'AI results sanitized before returning — prompt injection outputs stripped.',
      roleCheck: 'Standard user access. Admin can query all tasks via separate endpoint.',
      refresh: 'Completed results cached indefinitely. Pending results not cached.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Task Lookup', 'Ownership Check', 'Cache (if done)', 'Response'],
  },

  // ─── ADMIN ─────────────────────────────────────────────────
  {
    id: 'admin-stats',
    method: 'GET',
    path: '/api/v1/admin/stats/',
    category: 'Admin',
    requiresAuth: true,
    rateLimit: '10/min',
    contentType: 'application/json',
    idempotent: true,
    description: 'System-wide statistics. Admin role required.',
    requestSchema: {},
    validationRules: {},
    responseSchemas: {
      django: {
        200: { total_users: 142, active_users: 128, total_orders: 870, revenue_today: '4521.00', ai_jobs_today: 312, cache_hit_rate: '87%' },
        401: { detail: 'Authentication credentials were not provided.' },
        403: { detail: 'You do not have permission to perform this action.' },
      },
      fastapi: {
        200: { total_users: 142, active_users: 128, total_orders: 870, revenue_today: 4521.0, ai_jobs_today: 312, cache_hit_rate: 0.87 },
        401: { detail: 'Not authenticated.' },
        403: { detail: 'Admin role required.' },
      },
    },
    databaseImpact: {
      tables: ['users', 'orders', 'payments', 'ai_jobs'],
      operations: [
        { op: 'SELECT COUNT', detail: 'SELECT COUNT(*) FROM users WHERE is_active = true' },
        { op: 'SELECT SUM', detail: 'SELECT SUM(amount) FROM payments WHERE DATE(paid_at) = TODAY' },
        { op: 'SELECT COUNT', detail: 'SELECT COUNT(*) FROM ai_jobs WHERE DATE(created_at) = TODAY' },
      ],
      indexes: ['users.is_active', 'payments.paid_at', 'ai_jobs.created_at'],
      relationships: 'Aggregate query across 4 tables — cached aggressively.',
    },
    performanceProfile: { queries: 4, cacheUsed: true, avgResponse: 55, coldStart: 110 },
    securityNotes: {
      jwt: 'Admin-only endpoint. Role extracted from JWT claims.',
      rateLimit: 'Strict — dashboards should cache client-side, not hammer this.',
      hashing: 'No sensitive data returned. Aggregates only.',
      roleCheck: 'role === "admin" check applied at middleware level.',
      refresh: 'Response cached for 5 minutes. Stale data acceptable for dashboard.',
    },
    flowDiagram: ['Request', 'JWT Middleware', 'Admin Role Check', 'Cache Lookup (5min TTL)', 'Multi-table Aggregates', 'Response'],
  },
]

// Group by category
export const categories = [...new Set(endpoints.map((e) => e.category))]

export const endpointsByCategory = categories.reduce((acc, cat) => {
  acc[cat] = endpoints.filter((e) => e.category === cat)
  return acc
}, {})