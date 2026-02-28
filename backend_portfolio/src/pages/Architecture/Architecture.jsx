import { useState, useEffect } from 'react'
import { useFramework } from '../../context/FrameworkContext'

const sections = [
  {
    id: 'api-design',
    tag: 'SECTION 01',
    title: 'API Design Philosophy',
    icon: '⬡',
    color: '#60a5fa',
    content: {
      intro: 'Every API decision in this system follows REST conventions with a bias toward clarity, predictability, and client-developer experience. No clever shortcuts that create long-term confusion.',
      decisions: [
        {
          title: 'RESTful Resource Naming',
          body: 'Resources are plural nouns, never verbs. /api/v1/users/ not /api/v1/getUsers/. Actions map to HTTP methods — GET to read, POST to create, PUT/PATCH to update, DELETE to remove. This makes the API predictable without reading docs.',
          code: `# ✅ Correct\nGET    /api/v1/orders/\nPOST   /api/v1/orders/\nGET    /api/v1/orders/{id}/\nPATCH  /api/v1/orders/{id}/\nDELETE /api/v1/orders/{id}/\n\n# ❌ Wrong\nGET /api/v1/getOrders\nPOST /api/v1/createOrder`
        },
        {
          title: 'Consistent Status Codes',
          body: '200 for success, 201 for creation, 400 for validation errors, 401 for auth failure, 403 for permission denial, 404 for missing resource, 429 for rate limit, 500 for server error. Never return 200 with an error body.',
        },
        {
          title: 'Structured Error Envelope',
          body: 'All errors follow a consistent structure so clients can programmatically handle failures without parsing free-form strings.',
          code: `// Standard error envelope\n{\n  "error": {\n    "code": "RESOURCE_NOT_FOUND",\n    "message": "User with id 99 not found",\n    "field": null\n  }\n}`
        },
        {
          title: 'Idempotency Design',
          body: 'GET, PUT, DELETE are idempotent by design. POST operations that risk duplication (like payment initiation) use server-side idempotency keys to prevent double-processing on network retries.',
        }
      ]
    }
  },
  {
    id: 'auth-strategy',
    tag: 'SECTION 02',
    title: 'Authentication Strategy',
    icon: '⬡',
    color: '#4ade80',
    content: {
      intro: 'Stateless JWT authentication with refresh token rotation. The design prioritizes security and scalability over session simplicity.',
      decisions: [
        {
          title: 'Why JWT Over Server Sessions',
          body: 'Server sessions require shared storage (Redis or DB) across all instances — a horizontal scaling problem. JWTs are self-contained and verified locally via signature. Any server can verify any token without a DB round-trip.',
        },
        {
          title: 'Access + Refresh Token Split',
          body: 'Short-lived access tokens (15 min) minimize exposure window if intercepted. Long-lived refresh tokens (7 days) enable seamless UX without re-login. This separation is the industry standard for stateless auth.',
          code: `// Token strategy\naccess_token:  expires 15 minutes → sent on every request\nrefresh_token: expires 7 days    → used only to get new access token\n\n// Refresh rotation\nEach refresh call invalidates the old refresh token\nand issues a new one. Prevents replay attacks.`
        },
        {
          title: 'Token Invalidation Challenge',
          body: 'JWTs cannot be invalidated before expiry by design. Mitigation: short expiry windows, refresh token blacklisting in DB on logout, and token family tracking to detect theft. Trade-off acknowledged.',
        },
        {
          title: 'Stateless vs Server Session Trade-off',
          body: 'Stateless = easier horizontal scaling but harder immediate revocation. Server session = instant revocation but requires centralized session store. For this system, stateless wins due to scalability requirements.',
        }
      ]
    }
  },
  {
    id: 'database',
    tag: 'SECTION 03',
    title: 'Database Design Strategy',
    icon: '⬡',
    color: '#a78bfa',
    content: {
      intro: 'PostgreSQL with normalized schema, strategic indexing, and explicit foreign key constraints. Every design decision is justified — nothing is accidental.',
      decisions: [
        {
          title: '3rd Normal Form Normalization',
          body: 'Schema is normalized to 3NF to eliminate data redundancy and update anomalies. User profile data lives in one place. Product data in one place. No denormalized copies that drift out of sync.',
          code: `-- Normalized: user data in one place\nCREATE TABLE users (\n  id         SERIAL PRIMARY KEY,\n  email      VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Orders reference users by FK, not by copying user data\nCREATE TABLE orders (\n  id      SERIAL PRIMARY KEY,\n  user_id INT NOT NULL REFERENCES users(id),\n  status  VARCHAR(50) NOT NULL\n);`
        },
        {
          title: 'Foreign Key Enforcement at DB Level',
          body: 'FKs are enforced at the database level, not just the application level. Application bugs cannot create orphaned records. The DB is the last line of defense for data integrity.',
        },
        {
          title: 'Indexing Strategy',
          body: 'Indexes are added on columns used in WHERE clauses, JOIN conditions, and ORDER BY. Not on every column — each index adds write overhead. email (users), user_id (orders), status (orders), created_at are indexed.',
          code: `-- High-query columns get indexes\nCREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_orders_user_id ON orders(user_id);\nCREATE INDEX idx_orders_status ON orders(status);\nCREATE INDEX idx_orders_created ON orders(created_at DESC);`
        },
        {
          title: 'N+1 Query Prevention',
          body: 'N+1 queries are the most common Django performance bug. Always use select_related() for FK relationships and prefetch_related() for M2M. Monitored via Django Debug Toolbar in development.',
          code: `# ❌ N+1 — 1 query for orders + N queries for users\norders = Order.objects.all()\nfor order in orders:\n    print(order.user.email)  # DB hit each loop\n\n# ✅ 2 queries total\norders = Order.objects.select_related('user').all()`
        },
        {
          title: 'When to Denormalize',
          body: 'Denormalization is acceptable for read-heavy aggregation that would otherwise require expensive JOINs at scale — e.g., caching order_total directly on the orders table rather than summing order_items on every read.',
        }
      ]
    }
  },
  {
    id: 'performance',
    tag: 'SECTION 04',
    title: 'Performance Strategy',
    icon: '⬡',
    color: '#f59e0b',
    content: {
      intro: 'Performance is designed in from the start, not bolted on after slowness is noticed. Caching, async, pagination, and connection pooling are core to the architecture.',
      decisions: [
        {
          title: 'Redis Caching Plan',
          body: 'Redis used for read-heavy endpoints: user profiles, product catalogs, endpoint metadata. Cache invalidated on write. TTL set per resource type — short for volatile data, long for stable. Never cache user-specific financial data.',
          code: `# Cache pattern: cache-aside\nvalue = cache.get(f'user:{user_id}')\nif not value:\n    value = User.objects.get(id=user_id)\n    cache.set(f'user:{user_id}', value, timeout=300)\nreturn value`
        },
        {
          title: 'Async Background Workers',
          body: 'Email sending, AI job processing, report generation — all moved to Celery workers. HTTP response returns immediately with a job_id. Clients poll or receive webhooks when work completes. No blocking the request cycle.',
        },
        {
          title: 'Cursor-Based Pagination',
          body: 'Large collections are always paginated. OFFSET-based pagination degrades at large page numbers (full table scan). Cursor-based pagination using indexed fields (id or created_at) maintains constant-time performance.',
          code: `# Cursor pagination — constant time regardless of page number\nGET /api/v1/orders/?cursor=eyJpZCI6IDEwMH0&limit=20\n\n# Response includes next cursor\n{\n  "next_cursor": "eyJpZCI6IDEyMH0",\n  "results": [...]\n}`
        },
        {
          title: 'DB Connection Pooling',
          body: 'PgBouncer used between application and PostgreSQL. Opening a new DB connection is expensive (25–100ms). Connection pooling maintains a warm pool. At scale, this alone can cut DB overhead by 40-60%.',
        }
      ]
    }
  },
  {
    id: 'scalability',
    tag: 'SECTION 05',
    title: 'Scalability Plan',
    icon: '⬡',
    color: '#f87171',
    content: {
      intro: 'A clear progression from monolith to microservices, triggered by specific load signals — not by hype. Premature microservices are a cost, not a benefit.',
      decisions: [
        {
          title: 'Phase 1: Horizontal Scaling + Load Balancing',
          body: 'Before splitting services: run multiple instances of the monolith behind a load balancer. Stateless design (JWT, no server sessions) makes this trivial. This handles 10x traffic before architectural changes are needed.',
        },
        {
          title: 'Phase 2: Introduce Caching Layer',
          body: 'Add Redis for read-heavy endpoints. Add read replicas for the database. Offload AI jobs to async workers. Most applications never need to go beyond this point.',
        },
        {
          title: 'Phase 3: Message Queue for Decoupling',
          body: 'When services need to communicate without tight coupling — e.g., order creation triggering notifications, invoicing, and inventory update — introduce a message queue (RabbitMQ or SQS). Services subscribe to events instead of calling each other directly.',
          code: `# Event-driven decoupling\norder_created → queue\n  ├── notification_service (subscribe)\n  ├── invoice_service     (subscribe)\n  └── inventory_service   (subscribe)\n\n# Order service has zero knowledge of downstream consumers`
        },
        {
          title: 'When to Move to Microservices',
          body: 'Only split when a specific service has independently different scaling needs, different deployment frequency, or different team ownership. Splitting for its own sake creates distributed system complexity without benefit. AI services are the first natural split candidate.',
        }
      ]
    }
  },
  {
    id: 'framework-comparison',
    tag: 'SECTION 06',
    title: 'Framework Comparison',
    icon: '⬡',
    color: '#fb923c',
    isDynamic: true,
    content: null // built dynamically
  }
]

const frameworkComparison = {
  django: {
    label: 'Django',
    color: '#4ade80',
    strengths: [
      { title: 'Batteries Included', body: 'Admin panel, ORM, auth, forms, migrations — all built in. Massive productivity gain for standard CRUD applications.' },
      { title: 'Mature ORM', body: 'Django ORM handles complex queries well. select_related, prefetch_related, annotate, aggregate — powerful tools with minimal SQL writing.' },
      { title: 'DRF for APIs', body: 'Django REST Framework adds serializers, viewsets, routers, throttling, and browsable API. Production-ready API layer in days.' },
      { title: 'Strong Admin', body: 'Auto-generated admin interface is genuinely useful for internal tooling and quick data management during development.' },
    ],
    tradeoffs: [
      { title: 'Sync by Default', body: 'Django views are synchronous unless explicitly using async def. Async support was added later and is not as seamless as FastAPI.' },
      { title: 'Heavier for Simple APIs', body: 'For a simple JSON API, Django carries more overhead (middleware, template engine, ORM setup) than is strictly necessary.' },
    ]
  },
  fastapi: {
    label: 'FastAPI',
    color: '#60a5fa',
    strengths: [
      { title: 'Async First', body: 'Built on Starlette and Uvicorn. async def is natural. Handles thousands of concurrent connections efficiently without blocking.' },
      { title: 'Pydantic Validation', body: 'Request body validation via Python type hints. Define a model, FastAPI validates and documents it automatically. Errors are structured by default.' },
      { title: 'Auto Swagger UI', body: 'OpenAPI docs generated automatically from code. /docs and /redoc available immediately. No manual documentation maintenance.' },
      { title: 'Lightweight and Explicit', body: 'No magic. Dependencies injected explicitly with Depends(). Easier to reason about request flow and test individual components.' },
    ],
    tradeoffs: [
      { title: 'No Built-in Admin', body: 'No equivalent of Django admin out of the box. Need to build or integrate a third-party solution for internal tooling.' },
      { title: 'More Setup Required', body: 'Authentication, migrations (Alembic), and admin require separate configuration. More explicit, but more initial setup time.' },
    ]
  }
}

export default function Architecture() {
  const { mode } = useFramework()
  const [activeSection, setActiveSection] = useState('api-design')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  const current = sections.find(s => s.id === activeSection)
  const fw = frameworkComparison[mode]

  return (
    <div className={`arch-page ${loaded ? 'page-loaded' : ''}`}>

      {/* Header */}
      <div className="arch-page-header anim-item" style={{ '--delay': '0.05s' }}>
        <div className="section-tag">ARCHITECTURE DECISIONS</div>
        <h1 className="pg-title">Engineering Documentation</h1>
        <p className="pg-subtitle">
          Structured rationale for every major backend design choice.
          <span className="mode-pill">{mode === 'django' ? '⚙ Django Mode' : '⚡ FastAPI Mode'}</span>
        </p>
      </div>

      <div className="arch-layout anim-item" style={{ '--delay': '0.12s' }}>

        {/* Left nav */}
        <nav className="arch-nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`arch-nav-item ${activeSection === s.id ? 'active' : ''}`}
              style={{ '--nav-color': s.color }}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="arch-nav-tag">{s.tag}</span>
              <span className="arch-nav-title">{s.title}</span>
              {s.isDynamic && (
                <span className="arch-nav-dynamic">{mode === 'django' ? 'Django' : 'FastAPI'}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="arch-content">
          {current && !current.isDynamic && (
            <div key={current.id} className="arch-section-content">
              <div className="arch-section-header">
                <span className="arch-section-tag" style={{ color: current.color }}>{current.tag}</span>
                <h2 className="arch-section-title">{current.title}</h2>
                <p className="arch-section-intro">{current.content.intro}</p>
              </div>

              <div className="arch-decisions">
                {current.content.decisions.map((d, i) => (
                  <div key={i} className="arch-decision-card" style={{ '--card-color': current.color }}>
                    <div className="arch-decision-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="arch-decision-body">
                      <h3 className="arch-decision-title">{d.title}</h3>
                      <p className="arch-decision-text">{d.body}</p>
                      {d.code && (
                        <div className="arch-code-block">
                          <div className="code-block-header">
                            <span className="code-dot red"></span>
                            <span className="code-dot yellow"></span>
                            <span className="code-dot green"></span>
                          </div>
                          <pre className="code-content">{d.code}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {current?.isDynamic && (
            <div key={`fw-${mode}`} className="arch-section-content">
              <div className="arch-section-header">
                <span className="arch-section-tag" style={{ color: current.color }}>{current.tag}</span>
                <h2 className="arch-section-title">Framework Comparison</h2>
                <p className="arch-section-intro">
                  Currently viewing <strong style={{ color: fw.color }}>{fw.label}</strong> perspective.
                  Switch the framework toggle in the header to compare.
                </p>
              </div>

              <div className="fw-comparison-grid">
                <div className="fw-comparison-section">
                  <div className="fw-comparison-header" style={{ borderColor: fw.color, color: fw.color }}>
                    ✦ Strengths of {fw.label}
                  </div>
                  {fw.strengths.map((s, i) => (
                    <div key={i} className="fw-card strength">
                      <div className="fw-card-title">{s.title}</div>
                      <p className="fw-card-body">{s.body}</p>
                    </div>
                  ))}
                </div>

                <div className="fw-comparison-section">
                  <div className="fw-comparison-header" style={{ borderColor: '#f87171', color: '#f87171' }}>
                    ↯ Trade-offs
                  </div>
                  {fw.tradeoffs.map((t, i) => (
                    <div key={i} className="fw-card tradeoff">
                      <div className="fw-card-title">{t.title}</div>
                      <p className="fw-card-body">{t.body}</p>
                    </div>
                  ))}

                  <div className="fw-summary-box" style={{ borderColor: fw.color }}>
                    <div className="fw-summary-title">Best Suited For</div>
                    {mode === 'django' ? (
                      <p className="fw-summary-text">Full-featured web applications, admin-heavy tools, rapid CRUD API development, and teams that prefer convention over configuration.</p>
                    ) : (
                      <p className="fw-summary-text">High-concurrency APIs, microservices, AI/ML serving endpoints, and teams that prefer explicit, type-safe code with auto-documentation.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}