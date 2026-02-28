import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'

// ─────────────────────────────────────────────────────────────
// DATA — all content keyed by framework mode
// ─────────────────────────────────────────────────────────────

const sections = [
  'API Design',
  'Authentication',
  'Database',
  'Performance',
  'Scalability',
  'Framework Comparison',
]

const content = {
  'API Design': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    shared: {
      title: 'API Design Philosophy',
      subtitle: 'RESTful, consistent, and contract-driven',
      principles: [
        { label: 'Resource Naming',    text: 'Plural nouns for collections — /users/, /orders/, /payments/. Never verbs in URLs. Actions are expressed via HTTP methods.' },
        { label: 'Idempotency',        text: 'GET, PUT, DELETE are idempotent by design. POST creates new resources. PATCH updates partial fields without full replacement.' },
        { label: 'Status Codes',       text: '200 success, 201 created, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 429 rate limited, 500 server error. Never return 200 with error bodies.' },
        { label: 'Structured Errors',  text: 'Every error has a consistent envelope so clients can parse reliably regardless of which endpoint failed.' },
        { label: 'Versioning',         text: 'API versioned at the URL level — /api/v1/. No breaking changes within a version. v2 for breaking changes.' },
        { label: 'Pagination',         text: 'All list endpoints paginated. Default page_size: 10, max: 100. Clients must never receive unbounded lists.' },
      ],
    },
    django: {
      tag: 'Django REST Framework',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `{
  "email": [
    "This field is required."
  ],
  "password": [
    "This field may not be blank."
  ]
}`,
      errorNote: 'DRF returns field-keyed objects. Each key maps to a list of error strings. Great for form rendering — map directly to field-level UI errors.',
      paginationFormat: `{
  "count": 142,
  "next": "/api/v1/users/?page=2",
  "previous": null,
  "results": [...]
}`,
      paginationNote: 'DRF PageNumberPagination. count is the total across all pages. next/previous are full URLs ready to use.',
      router: 'Django Router auto-generates URL patterns from ViewSets. Reduces boilerplate, enforces RESTful conventions.',
      docStyle: 'DRF Browsable API — browse and test endpoints in browser. swagger-ui via drf-spectacular for full OpenAPI spec.',
      highlights: [
        { k: 'Serializer',   v: 'DRF Serializer handles input validation, output formatting, and nested relationships.' },
        { k: 'ViewSet',      v: 'Single class handles list, create, retrieve, update, destroy — wired automatically via Router.' },
        { k: 'Renderer',     v: 'JSONRenderer for production. BrowsableAPIRenderer in development for quick manual testing.' },
      ],
    },
    fastapi: {
      tag: 'FastAPI + Pydantic',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "password"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}`,
      errorNote: 'FastAPI returns a detail array with loc path, human-readable msg, and machine-readable type. More structured — easier to target specific nested fields.',
      paginationFormat: `{
  "total": 142,
  "page": 1,
  "page_size": 10,
  "items": [...]
}`,
      paginationNote: 'Custom Pydantic response model. total replaces count. items replaces results. Flat structure, no next/previous URLs — client computes offset.',
      router: 'FastAPI APIRouter groups endpoints by domain. Mounted into main app with prefix and tags. Automatic OpenAPI tag grouping.',
      docStyle: 'Auto-generated Swagger UI at /docs and ReDoc at /redoc. No additional packages needed — powered by Pydantic schema introspection.',
      highlights: [
        { k: 'Pydantic Model', v: 'Request/response schemas defined as Pydantic BaseModel. Automatic validation, serialization, and OpenAPI schema generation.' },
        { k: 'Dependency Injection', v: 'FastAPI\'s Depends() system — inject DB sessions, current user, auth checks cleanly without decorators.' },
        { k: 'Response Model',  v: 'response_model param on route decorator auto-filters output fields — prevents accidental sensitive field leakage.' },
      ],
    },
  },

  Authentication: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    shared: {
      title: 'Authentication Strategy',
      subtitle: 'Stateless JWT with refresh token rotation',
      principles: [
        { label: 'Why JWT',            text: 'Stateless — server holds no session. Scales horizontally without shared session store. Token contains user_id, role, expiry embedded and signed.' },
        { label: 'Access Token TTL',   text: '15-minute expiry. Short TTL limits blast radius if token is stolen. Inconvenient but secure. Client refreshes silently before expiry.' },
        { label: 'Refresh Token',      text: 'Long-lived (7 days), stored in DB as a hash. One-time use — rotated on every refresh call. Invalidated immediately on logout.' },
        { label: 'Token Invalidation', text: 'Stateless JWT cannot be revoked mid-flight. Mitigated by short TTL + refresh token blacklisting in DB.' },
        { label: 'Password Hashing',   text: 'bcrypt with cost factor 12. Never stored in plaintext. Never logged. Compare-only via bcrypt.checkpw().' },
        { label: 'Brute Force',        text: 'Login endpoint rate limited to 10/min per IP. Exponential backoff on repeated 401s. Account lockout after 10 consecutive failures.' },
      ],
    },
    django: {
      tag: 'Simple JWT / DRF Auth',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# settings.py
SIMPLE_JWT = {
  "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
  "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
  "ROTATE_REFRESH_TOKENS": True,
  "BLACKLIST_AFTER_ROTATION": True,
  "ALGORITHM": "HS256",
  "SIGNING_KEY": SECRET_KEY,
}`,
      errorNote: 'djangorestframework-simplejwt handles token generation, rotation, and blacklisting. Blacklisted tokens stored in DB and checked on each request.',
      paginationFormat: `# views.py — protected endpoint
class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user  # user injected by JWT middleware`,
      paginationNote: 'IsAuthenticated permission class validates the Bearer token on every request. request.user is populated from JWT claims automatically.',
      router: 'JWTAuthentication middleware validates tokens globally. Per-view permission_classes override defaults.',
      docStyle: 'Token stored in Authorization header: Bearer <token>. DRF browsable API supports manual token entry for testing.',
      highlights: [
        { k: 'TokenBlackList',     v: 'djangorestframework-simplejwt blacklist app tracks revoked refresh tokens. Queried on every refresh call.' },
        { k: 'permission_classes', v: 'Fine-grained: IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, or custom object-level permissions.' },
        { k: 'Custom Claims',      v: 'Extend TokenObtainPairSerializer to embed role, plan, org_id into token payload at generation time.' },
      ],
    },
    fastapi: {
      tag: 'python-jose / PyJWT',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# auth/dependencies.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(401, "Could not validate credentials")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(401, "User not found")
    return user`,
      errorNote: 'Auth implemented as a FastAPI dependency. Injected via Depends(get_current_user) on any route that needs it. Clean, testable, composable.',
      paginationFormat: `# router — protected endpoint
@router.get("/users/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user  # type-safe, validated via Pydantic`,
      paginationNote: 'get_current_user dependency is composable — build get_admin_user on top by adding role check. No class hierarchy needed.',
      router: 'OAuth2PasswordBearer defines token URL for Swagger UI auto-auth. /docs shows a working Authorize button out of the box.',
      docStyle: 'Swagger UI at /docs shows lock icons on protected endpoints. Authorize button accepts Bearer token for all subsequent requests in the UI.',
      highlights: [
        { k: 'Depends()',         v: 'Dependency injection is first-class. Auth, DB session, rate limiting — all injectable, all independently testable.' },
        { k: 'HTTPException',     v: 'Raise HTTPException(status_code, detail) anywhere — FastAPI catches and serializes to correct error format automatically.' },
        { k: 'Security Scopes',   v: 'OAuth2 scopes supported natively. Define scopes per endpoint, validate in dependency — fine-grained role control.' },
      ],
    },
  },

  Database: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 4 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    shared: {
      title: 'Database Design Strategy',
      subtitle: 'Normalized, indexed, relationship-aware',
      principles: [
        { label: 'Normalization',    text: 'Schema normalized to 3NF. No redundant data. Every field depends on the key, the whole key, and nothing but the key.' },
        { label: 'Foreign Keys',     text: 'Enforced at DB level — not just application level. Prevents orphaned records even if application code has bugs.' },
        { label: 'Indexing Strategy', text: 'Primary keys auto-indexed. All FK columns indexed. High-cardinality filter fields (email, status, created_at) explicitly indexed.' },
        { label: 'N+1 Prevention',  text: 'ORM queries audited for N+1. select_related / joinedload used for known joins. Django Debug Toolbar / SQLAlchemy logging in dev.' },
        { label: 'Transactions',     text: 'Multi-table writes wrapped in atomic transactions. Rollback on any failure — DB never left in partial state.' },
        { label: 'Denormalization',  text: 'Avoided by default. Considered only when measured query latency exceeds SLA and join is truly the bottleneck.' },
      ],
    },
    django: {
      tag: 'Django ORM + PostgreSQL',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# models.py
class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,   # prevent accidental user delete
        related_name='orders',
        db_index=True               # explicit — FK always indexed
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        db_index=True               # filter-heavy field — indexed
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']`,
      errorNote: 'Django ORM models declare relationships, indexes, and constraints in Python. db_index=True creates B-tree index. on_delete=PROTECT prevents orphan users.',
      paginationFormat: `# Avoiding N+1 — views.py
def get_queryset(self):
    return (
        Order.objects
        .select_related('user')        # JOIN users in same query
        .prefetch_related('items__product')  # batch-fetch related
        .filter(user=self.request.user)
        .only('id', 'status', 'total', 'created_at')  # lean projection
    )`,
      paginationNote: 'select_related generates a SQL JOIN. prefetch_related does a second query and Python-side joins — used for M2M and reverse FK. .only() prevents SELECT *.',
      router: 'Django migrations track schema changes in version control. migrate applies them. makemigrations detects model changes. Rollback via migrate app 000X.',
      docStyle: 'Django Admin provides a visual interface for inspecting DB state during development. Not used in production.',
      highlights: [
        { k: 'atomic()',           v: '@transaction.atomic decorator or context manager wraps multi-step writes. Exception triggers full rollback.' },
        { k: 'F() expressions',   v: 'Update fields relative to their current DB value without a round-trip — atomic counter increments, no race conditions.' },
        { k: 'Annotations',       v: 'QuerySet.annotate() adds computed fields in SQL — counts, sums, existence flags — without Python-side loops.' },
      ],
    },
    fastapi: {
      tag: 'SQLAlchemy 2.0 + Alembic',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# models.py — SQLAlchemy 2.0 style
class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(), index=True
    )
    user: Mapped["User"] = relationship(back_populates="orders")`,
      errorNote: 'SQLAlchemy 2.0 mapped_column syntax is fully type-annotated. Relationships declared bidirectionally. Alembic generates migration scripts from model diffs.',
      paginationFormat: `# Async DB query — avoiding N+1
async def get_user_orders(
    user_id: int,
    db: AsyncSession
) -> list[Order]:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items)        # async-safe eager load
            .selectinload(OrderItem.product)
        )
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()`,
      paginationNote: 'selectinload is the async-safe equivalent of prefetch_related. joinedload for single-row relationships, selectinload for collections. No N+1 in async context.',
      router: 'Alembic manages migrations. alembic revision --autogenerate detects model changes. alembic upgrade head applies. Full migration history tracked in version control.',
      docStyle: 'AsyncSession from sqlalchemy.ext.asyncio — all DB calls awaited. Connection pooling via asyncpg. No blocking I/O on the event loop.',
      highlights: [
        { k: 'AsyncSession',       v: 'All DB operations are async — no thread blocking. Injected via Depends(get_db) — session scoped to request lifecycle.' },
        { k: 'begin() context',    v: 'async with db.begin(): auto-commits on exit, rolls back on exception. Explicit transaction control per operation.' },
        { k: 'selectinload',       v: 'Async-safe eager loading. Issues a second SELECT IN query — safe for event-loop, prevents N+1 without blocking.' },
      ],
    },
  },

  Performance: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    shared: {
      title: 'Performance Strategy',
      subtitle: 'Caching, async, pagination, and connection efficiency',
      principles: [
        { label: 'Redis Caching',       text: 'Read-heavy endpoints cached with Redis. Cache-aside pattern: read from cache, fallback to DB on miss, write result to cache. TTL enforced per resource type.' },
        { label: 'Pagination',          text: 'Unbounded queries are a P0 performance risk. All list endpoints paginated. Cursor-based pagination considered for real-time feeds.' },
        { label: 'DB Connection Pool',  text: 'Connection pooling prevents per-request DB handshakes. Pool size tuned to worker count. Idle connections recycled.' },
        { label: 'Query Optimization',  text: 'EXPLAIN ANALYZE run on slow queries. Composite indexes for multi-field filters. Partial indexes for status-filtered queries.' },
        { label: 'Background Workers',  text: 'Expensive operations (email, AI, report generation) offloaded to async workers. Response returns immediately with task_id.' },
        { label: 'Response Profiling',  text: 'Response time tracked per endpoint. p95 and p99 latencies monitored. Alerts on sustained >200ms average.' },
      ],
    },
    django: {
      tag: 'Gunicorn + Celery + Redis',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# cache.py — cache-aside pattern
from django.core.cache import cache

def get_user_profile(user_id: int) -> dict:
    cache_key = f"user:{user_id}:profile"
    cached = cache.get(cache_key)
    if cached:
        return cached                      # cache HIT

    user = User.objects.get(pk=user_id)
    data = UserSerializer(user).data
    cache.set(cache_key, data, timeout=120) # 120s TTL
    return data                            # cache MISS → DB`,
      errorNote: 'Django cache framework abstracts the backend. swap Redis for Memcached without changing application code. Cache key namespacing prevents collisions across services.',
      paginationFormat: `# celery tasks — background worker
@shared_task(bind=True, max_retries=3)
def send_order_confirmation(self, order_id: int):
    try:
        order = Order.objects.select_related('user').get(pk=order_id)
        send_email(order.user.email, order)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)  # retry in 30s`,
      paginationNote: 'Celery task with automatic retry. bind=True exposes self for retry logic. countdown=30 waits before next retry. max_retries=3 prevents infinite loops.',
      router: 'Gunicorn with multiple sync workers handles concurrency. Each worker is a full Python process. Worker count = 2×CPU+1 is the standard formula.',
      docStyle: 'Django Debug Toolbar shows query count, query time, and cache hits per request. Silk middleware for production-safe request profiling.',
      highlights: [
        { k: 'cache.get_or_set()', v: 'Atomic cache-or-compute in one call. Thread-safe — prevents cache stampede in high-concurrency scenarios.' },
        { k: 'Celery Beat',        v: 'Periodic tasks (daily reports, cache warmup, cleanup jobs) scheduled via Celery Beat — cron without cron.' },
        { k: 'DB conn pooling',    v: 'CONN_MAX_AGE in settings reuses DB connections per worker. Reduces handshake overhead on every request.' },
      ],
    },
    fastapi: {
      tag: 'Uvicorn + asyncio + Redis',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# cache.py — async cache-aside
import aioredis

async def get_user_profile(
    user_id: int,
    redis: Redis,
    db: AsyncSession
) -> dict:
    cache_key = f"user:{user_id}:profile"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)            # cache HIT

    user = await db.get(User, user_id)
    data = UserResponse.from_orm(user).dict()
    await redis.setex(cache_key, 120, json.dumps(data))
    return data                              # cache MISS → DB`,
      errorNote: 'aioredis provides non-blocking Redis access. All cache reads/writes are awaited — never block the event loop. Redis injected as FastAPI dependency.',
      paginationFormat: `# background task — FastAPI BackgroundTasks
@router.post("/orders/", status_code=201)
async def create_order(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = await create_order_db(data, user, db)
    background_tasks.add_task(send_order_email, order)  # non-blocking
    return order  # response returned immediately`,
      paginationNote: 'BackgroundTasks runs after response is sent. For heavy jobs, use Celery or ARQ (async Redis queue). FastAPI itself is not a task queue.',
      router: 'Uvicorn with Gunicorn as process manager. Single-process Uvicorn for dev. Uvicorn workers behind Gunicorn for production — async-first throughout.',
      docStyle: 'asyncpg is the async PostgreSQL driver. Dramatically faster than psycopg2 for concurrent workloads — no thread-per-connection model.',
      highlights: [
        { k: 'Event Loop',        v: 'Single event loop handles all requests concurrently. I/O operations yield to other requests while waiting. No threads needed for I/O concurrency.' },
        { k: 'Connection Pool',   v: 'asyncpg maintains async connection pool. create_pool() at startup, shared across all requests via app.state. No blocking handshakes.' },
        { k: 'ARQ / Celery',      v: 'Heavy tasks (AI, reports) use ARQ (async Redis queue) or standard Celery. BackgroundTasks is for lightweight post-response work only.' },
      ],
    },
  },

  Scalability: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    shared: {
      title: 'Scalability Plan',
      subtitle: 'Horizontal scaling, queues, and service boundaries',
      principles: [
        { label: 'Horizontal Scaling',  text: 'Stateless design enables horizontal scaling. Add more instances behind a load balancer. No shared memory — state lives in DB and Redis.' },
        { label: 'Load Balancing',      text: 'Nginx or cloud ALB routes traffic across instances. Sticky sessions not needed — JWT is stateless. Health checks on /api/health.' },
        { label: 'Message Queues',      text: 'When to introduce: if a task can fail independently, retry independently, or run on a different machine — it belongs in a queue.' },
        { label: 'DB Read Replicas',    text: 'Read-heavy endpoints routed to read replicas. Writes still go to primary. Replication lag acceptable for non-critical reads.' },
        { label: 'Service Splitting',   text: 'Monolith first. Split when: a domain scales differently, a team owns it independently, or a failure in it should not cascade.' },
        { label: 'Microservices Gate',  text: 'Split to microservices only when team size, deployment frequency, or scaling requirements genuinely demand it. Not premature.' },
      ],
    },
    django: {
      tag: 'Gunicorn Workers + Celery',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# Gunicorn config — gunicorn.conf.py
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"           # sync for CPU-bound
# worker_class = "gevent"       # async I/O if needed
bind = "0.0.0.0:8000"
timeout = 30
keepalive = 5
max_requests = 1000             # recycle workers — prevent memory bloat
max_requests_jitter = 100`,
      errorNote: 'Each Gunicorn worker is a full process. workers = 2×CPU+1 is the rule. max_requests recycles workers after N requests to prevent slow memory leaks.',
      paginationFormat: `# Database routing — multiple DBs
# settings.py
DATABASES = {
    "default": { ... },          # primary — writes
    "replica": { ... },          # read replica
}
DATABASE_ROUTERS = ['myapp.routers.ReadReplicaRouter']

# routers.py
class ReadReplicaRouter:
    def db_for_read(self, model, **hints):
        return "replica"         # all reads → replica
    def db_for_write(self, model, **hints):
        return "default"         # all writes → primary`,
      paginationNote: 'Django multi-DB routing is transparent to application code. Views and serializers do not change. Router decides backend based on operation type.',
      router: 'Celery workers run as separate processes, separate machines. Scale workers independently from web workers. Auto-scaling workers based on queue depth.',
      docStyle: 'Django monolith scales well to medium traffic. Split to microservices when a domain needs independent deployment or separate team ownership.',
      highlights: [
        { k: 'Worker Autoscale',  v: 'Celery autoscale feature dynamically adjusts worker concurrency based on queue depth. No manual intervention needed.' },
        { k: 'Cache Warming',     v: 'Celery Beat pre-populates cache for high-traffic endpoints before traffic hits. Prevents cold-cache latency spikes.' },
        { k: 'Django Channels',   v: 'When WebSocket support needed — Django Channels adds async layer without full framework rewrite.' },
      ],
    },
    fastapi: {
      tag: 'Uvicorn Workers + ARQ',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# Gunicorn with Uvicorn workers
# Dockerfile CMD
CMD ["gunicorn", "app.main:app",
     "--workers", "4",
     "--worker-class", "uvicorn.workers.UvicornWorker",
     "--bind", "0.0.0.0:8000",
     "--timeout", "30",
     "--keepalive", "5"
]
# Each Uvicorn worker = 1 event loop
# 4 workers × async concurrency = high throughput`,
      errorNote: 'Uvicorn workers replace Gunicorn sync workers. Each worker runs its own event loop. 4 workers handle far more concurrent requests than 4 sync workers.',
      paginationFormat: `# ARQ async task queue
# tasks.py
async def send_email_task(ctx, order_id: int):
    db = ctx["db"]
    order = await db.get(Order, order_id)
    await send_email_async(order.user.email, order)

# Enqueue from endpoint
await arq_pool.enqueue_job("send_email_task", order_id)

# worker.py
class WorkerSettings:
    functions = [send_email_task]
    redis_settings = RedisSettings(host="localhost")`,
      paginationNote: 'ARQ is the async-native alternative to Celery. All task functions are async. No thread overhead. Redis-backed queue. Ideal for FastAPI async architecture.',
      router: 'FastAPI\'s async-first design makes it naturally suited for microservices. Each service can be a focused FastAPI app with its own DB, deployed independently.',
      docStyle: 'WebSocket support is first-class in FastAPI — @app.websocket() decorator. No additional library needed. Event loop handles WS connections alongside HTTP.',
      highlights: [
        { k: 'Service Mesh Ready',  v: 'Stateless FastAPI services integrate naturally with Kubernetes, Istio, or AWS ECS. Health endpoints, graceful shutdown built in.' },
        { k: 'Event-Driven',        v: 'Async architecture makes event-driven patterns natural. Publish to Redis Streams or Kafka from async endpoints without blocking.' },
        { k: 'OpenTelemetry',       v: 'FastAPI middleware for distributed tracing. Propagate trace IDs across service calls — essential for microservice debugging.' },
      ],
    },
  },

  'Framework Comparison': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    shared: {
      title: 'Framework Comparison',
      subtitle: 'Django vs FastAPI — when to choose which',
      principles: [
        { label: 'Both are production-ready', text: 'Django and FastAPI are both battle-tested. The choice is driven by team, use-case, and scaling requirements — not maturity.' },
        { label: 'Django sweet spot',         text: 'Rapid development, admin-heavy apps, teams that want convention over configuration. Batteries included means less glue code.' },
        { label: 'FastAPI sweet spot',         text: 'High-concurrency APIs, microservices, teams comfortable with async Python. Best-in-class performance for I/O-bound workloads.' },
        { label: 'Async matters for I/O',     text: 'If your endpoints mostly wait for DB/Redis/HTTP — async wins. If CPU-bound — async gives no benefit over sync Django workers.' },
        { label: 'Team velocity',             text: 'Django\'s admin, ORM, and auth out-of-box can be 2–3× faster to ship initially. FastAPI requires more explicit wiring.' },
        { label: 'Both can scale',            text: 'Neither forces microservices. Both can scale horizontally. Performance difference matters only at high concurrency (100+ rps).' },
      ],
    },
    django: {
      tag: 'Django — Active Mode',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# Django advantages summary
✅ Built-in Admin (zero-cost back-office)
✅ ORM migrations — makemigrations / migrate
✅ DRF — serializers, viewsets, permissions
✅ Auth — users, groups, permissions built-in
✅ Session, CSRF, security headers by default
✅ Large ecosystem — packages for everything
✅ Strong conventions — less architectural debate
✅ Signals, middleware, management commands`,
      errorNote: 'Django\'s "batteries included" philosophy reduces decision fatigue. The right tool when you need to ship fast and maintain long-term.',
      paginationFormat: `# Django limitations
⚠  Sync-first — async requires explicit opt-in
⚠  Heavier memory footprint per worker
⚠  DRF boilerplate grows with complex APIs
⚠  Less performant at high concurrency vs async
⚠  OpenAPI spec requires drf-spectacular add-on
⚠  Pydantic-style validation needs extra setup`,
      paginationNote: 'Not weaknesses — tradeoffs. Django\'s sync model is perfectly adequate for most use cases under 10k rpm with proper caching.',
      router: 'Choose Django when: building admin-heavy SaaS, working with legacy DB, needing built-in auth/permissions, or shipping fast with a small team.',
      docStyle: 'This portfolio was built assuming Django as the primary backend — the School Management System demonstrates Django\'s real-world application at SaaS scale.',
      highlights: [
        { k: 'Signals',         v: 'post_save, pre_delete signals for decoupled side effects. Dangerous if overused, but powerful for audit logs, cache invalidation.' },
        { k: 'Admin',           v: 'Django Admin generates CRUD UI from models automatically. Saved hundreds of hours in internal tooling across real projects.' },
        { k: 'Management Cmds', v: 'python manage.py custom_command for one-off scripts, data migrations, seed scripts. Built-in scheduling via Celery Beat.' },
      ],
    },
    fastapi: {
      tag: 'FastAPI — Active Mode',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# FastAPI advantages summary
✅ Async-first — native event loop concurrency
✅ Automatic OpenAPI / Swagger UI at /docs
✅ Pydantic validation — type-safe, explicit
✅ Dependency injection — clean, testable
✅ 3–5× faster than Django under high I/O load
✅ First-class WebSocket support
✅ Lightweight — only what you need
✅ Python type hints enforced throughout`,
      errorNote: 'FastAPI\'s explicit architecture means every piece is intentional. Ideal for teams that value clarity and type safety over convention.',
      paginationFormat: `# FastAPI limitations
⚠  No built-in Admin — must build or use SQLAdmin
⚠  No built-in auth — must implement or use fastapi-users
⚠  Async bugs harder to debug than sync
⚠  Smaller ecosystem than Django for add-ons
⚠  Alembic migrations less ergonomic than Django
⚠  Requires more upfront architectural decisions`,
      paginationNote: 'FastAPI requires you to assemble your own stack. More flexible, but more decisions. Right for experienced teams, trickier for greenfield solo projects.',
      router: 'Choose FastAPI when: building high-throughput APIs, microservices, ML model serving, real-time features (WS), or when team values explicit type safety.',
      docStyle: 'Datavo (AI schema architect) was built with FastAPI — the async AI job pattern, streaming responses, and schema validation all leverage FastAPI\'s strengths.',
      highlights: [
        { k: 'Type Safety',       v: 'End-to-end type safety from request schema to DB model to response model. Runtime validation via Pydantic catches mismatches early.' },
        { k: '/docs auto-gen',    v: 'Zero-config Swagger UI. Pydantic models auto-generate JSON Schema. API documentation is always in sync with code.' },
        { k: 'Testability',       v: 'Dependencies are injectable — override get_db or get_current_user in tests with mocks. No monkey-patching required.' },
      ],
    },
  },
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function SectionNav({ active, onChange, mode }) {
  return (
    <nav className="hidden lg:flex flex-col gap-0.5 w-52 xl:w-60 shrink-0">
      {sections.map((s, i) => {
        const sec = content[s]
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{ animationDelay: `${i * 50}ms` }}
            className={`animate-slide-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
              active === s
                ? 'bg-gray-800 border border-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
            }`}
          >
            <span className={`transition-colors duration-200 ${active === s ? (mode === 'django' ? 'text-emerald-400' : 'text-blue-400') : 'text-gray-600 group-hover:text-gray-400'}`}>
              {sec.icon}
            </span>
            <span className="text-xs font-mono">{s}</span>
            {active === s && (
              <div className={`ml-auto w-1 h-4 rounded-full ${mode === 'django' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            )}
          </button>
        )
      })}

      {/* Framework reminder */}
      <div className="mt-4 px-3 py-3 border border-gray-800 rounded-lg bg-gray-900/50">
        <p className="text-xs font-mono text-gray-600 mb-2">Active mode</p>
        <div className={`flex items-center gap-2 text-xs font-mono font-semibold ${mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          {mode === 'django' ? 'Django' : 'FastAPI'}
        </div>
        <p className="text-xs font-mono text-gray-700 mt-1.5 leading-relaxed">
          Toggle in header to see how this section changes.
        </p>
      </div>
    </nav>
  )
}

function CodeBlock({ code, label, note, mode }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          {label && <span className="text-xs font-mono text-gray-500 ml-1">{label}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <><svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span className="text-emerald-400">Copied</span></>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3"/></svg><span>Copy</span></>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-5 bg-gray-950/60 whitespace-pre">{code}</pre>
      {note && <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/40"><p className="text-xs font-mono text-gray-500 leading-relaxed">{note}</p></div>}
    </div>
  )
}

// Animated section reveal
function useInView(ref) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return visible
}

function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef(null)
  const visible = useInView(ref)
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={visible ? 'animate-fade-up' : 'opacity-0'}
    >
      {children}
    </div>
  )
}

function SectionContent({ sectionKey, mode }) {
  const sec = content[sectionKey]
  const fm = sec[mode]
  const shared = sec.shared

  return (
    <div className="space-y-8">
      {/* Section header */}
      <AnimatedSection>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
            mode === 'django' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'
          }`}>
            {sec.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-mono font-bold text-white">{shared.title}</h2>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${fm.tagColor}`}>{fm.tag}</span>
            </div>
            <p className="text-sm font-mono text-gray-500">{shared.subtitle}</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Principles grid */}
      <AnimatedSection delay={60}>
        <div>
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Core Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shared.principles.map((p, i) => (
              <div
                key={p.label}
                className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`text-xs font-mono font-semibold mb-1.5 ${mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {p.label}
                </div>
                <p className="text-xs font-mono text-gray-400 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Framework-specific code blocks */}
      <AnimatedSection delay={120}>
        <div>
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
            {mode === 'django' ? 'Django Implementation' : 'FastAPI Implementation'}
          </h3>
          <div className="space-y-4">
            <CodeBlock code={fm.errorFormat} note={fm.errorNote} mode={mode} />
            <CodeBlock code={fm.paginationFormat} note={fm.paginationNote} mode={mode} />
          </div>
        </div>
      </AnimatedSection>

      {/* Framework notes */}
      <AnimatedSection delay={160}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs font-mono text-gray-500 mb-1.5">Routing / Structure</p>
            <p className="text-xs font-mono text-gray-400 leading-relaxed">{fm.router}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs font-mono text-gray-500 mb-1.5">Documentation / Tooling</p>
            <p className="text-xs font-mono text-gray-400 leading-relaxed">{fm.docStyle}</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Highlights */}
      <AnimatedSection delay={200}>
        <div>
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Key Concepts</h3>
          <div className="space-y-2">
            {fm.highlights.map((h, i) => (
              <div key={h.k} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
                <code className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded border ${
                  mode === 'django' ? 'text-emerald-400 border-emerald-900 bg-emerald-950/40' : 'text-blue-400 border-blue-900 bg-blue-950/40'
                }`}>
                  {h.k}
                </code>
                <p className="text-xs font-mono text-gray-400 leading-relaxed">{h.v}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Framework comparison strip — shown only on Framework Comparison section */}
      {sectionKey === 'Framework Comparison' && (
        <AnimatedSection delay={240}>
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-800">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-emerald-400">Choose Django when...</span>
                </div>
                {['Admin panel needed', 'Fast initial shipping', 'Built-in auth/perms', 'Convention over config', 'Sync is fine for load', 'SaaS / CRUD heavy'].map(t => (
                  <div key={t} className="flex items-center gap-2 py-1 text-xs font-mono text-gray-400">
                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {t}
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-mono font-semibold text-blue-400">Choose FastAPI when...</span>
                </div>
                {['High concurrency I/O', 'Microservices', 'ML model serving', 'WebSocket / streaming', 'Type safety critical', 'Async-first team'].map(t => (
                  <div key={t} className="flex items-center gap-2 py-1 text-xs font-mono text-gray-400">
                    <svg className="w-3 h-3 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function Architecture({ onNavigate }) {
  const { mode } = useFramework()
  const [activeSection, setActiveSection] = useState('API Design')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Reset to top section on mode change
  useEffect(() => {
    setActiveSection('API Design')
  }, [mode])

  return (
    <div className="page-enter min-h-screen">

      {/* ── Page Header (static, not sticky) ───────────────── */}
      <div className="border-b border-gray-800 bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => onNavigate('home')}
                  className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors"
                >
                  ← Home
                </button>
                <span className="text-gray-700">/</span>
                <span className="text-xs font-mono text-gray-400">Architecture Decisions</span>
              </div>
              <h1 className="text-xl font-mono font-bold text-white">Architecture Decisions</h1>
              <p className="text-xs font-mono text-gray-500 mt-1">
                Engineering documentation — content adapts to{' '}
                <span className={mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}>
                  {mode === 'django' ? 'Django' : 'FastAPI'}
                </span>{' '}
                mode
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Active section badge */}
              <span className={`hidden sm:block text-xs font-mono px-2.5 py-1 rounded-lg border ${
                mode === 'django' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'
              }`}>
                {activeSection}
              </span>

              {/* Mobile section picker */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-xs font-mono text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 flex items-center gap-2"
                >
                  Sections
                  <svg className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl min-w-[180px]">
                    {sections.map(s => (
                      <button
                        key={s}
                        onClick={() => { setActiveSection(s); setMobileMenuOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors ${activeSection === s ? (mode === 'django' ? 'text-emerald-400 bg-emerald-950/30' : 'text-blue-400 bg-blue-950/30') : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile section tabs */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 lg:hidden">
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  activeSection === s
                    ? mode === 'django'
                      ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30'
                      : 'text-blue-400 border-blue-800 bg-blue-950/30'
                    : 'text-gray-500 border-gray-800 hover:border-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-10">

          {/* Left sidebar nav */}
          <SectionNav active={activeSection} onChange={setActiveSection} mode={mode} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <SectionContent key={`${activeSection}-${mode}`} sectionKey={activeSection} mode={mode} />
          </div>
        </div>
      </div>

      {/* ── Bottom nav ────────────────────────────────────── */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-gray-500">
                Architecture decisions reflect real-world backend engineering patterns.
              </p>
              <p className="text-xs font-mono text-gray-700 mt-0.5">
                All code examples are illustrative — adapted from actual project implementations.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('playground')}
                className="btn-primary text-xs font-mono px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
              >
                Try API Playground
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="btn-outline text-xs font-mono px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg"
              >
                View Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}














// import { useState, useEffect, useRef } from 'react'
// import { useFramework } from '../../context/FrameworkContext'

// // ─────────────────────────────────────────────────────────────
// // DATA — all content keyed by framework mode
// // ─────────────────────────────────────────────────────────────

// const sections = [
//   'API Design',
//   'Authentication',
//   'Database',
//   'Performance',
//   'Scalability',
//   'Framework Comparison',
// ]

// const content = {
//   'API Design': {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//       </svg>
//     ),
//     shared: {
//       title: 'API Design Philosophy',
//       subtitle: 'RESTful, consistent, and contract-driven',
//       principles: [
//         { label: 'Resource Naming',    text: 'Plural nouns for collections — /users/, /orders/, /payments/. Never verbs in URLs. Actions are expressed via HTTP methods.' },
//         { label: 'Idempotency',        text: 'GET, PUT, DELETE are idempotent by design. POST creates new resources. PATCH updates partial fields without full replacement.' },
//         { label: 'Status Codes',       text: '200 success, 201 created, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 429 rate limited, 500 server error. Never return 200 with error bodies.' },
//         { label: 'Structured Errors',  text: 'Every error has a consistent envelope so clients can parse reliably regardless of which endpoint failed.' },
//         { label: 'Versioning',         text: 'API versioned at the URL level — /api/v1/. No breaking changes within a version. v2 for breaking changes.' },
//         { label: 'Pagination',         text: 'All list endpoints paginated. Default page_size: 10, max: 100. Clients must never receive unbounded lists.' },
//       ],
//     },
//     django: {
//       tag: 'Django REST Framework',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `{
//   "email": [
//     "This field is required."
//   ],
//   "password": [
//     "This field may not be blank."
//   ]
// }`,
//       errorNote: 'DRF returns field-keyed objects. Each key maps to a list of error strings. Great for form rendering — map directly to field-level UI errors.',
//       paginationFormat: `{
//   "count": 142,
//   "next": "/api/v1/users/?page=2",
//   "previous": null,
//   "results": [...]
// }`,
//       paginationNote: 'DRF PageNumberPagination. count is the total across all pages. next/previous are full URLs ready to use.',
//       router: 'Django Router auto-generates URL patterns from ViewSets. Reduces boilerplate, enforces RESTful conventions.',
//       docStyle: 'DRF Browsable API — browse and test endpoints in browser. swagger-ui via drf-spectacular for full OpenAPI spec.',
//       highlights: [
//         { k: 'Serializer',   v: 'DRF Serializer handles input validation, output formatting, and nested relationships.' },
//         { k: 'ViewSet',      v: 'Single class handles list, create, retrieve, update, destroy — wired automatically via Router.' },
//         { k: 'Renderer',     v: 'JSONRenderer for production. BrowsableAPIRenderer in development for quick manual testing.' },
//       ],
//     },
//     fastapi: {
//       tag: 'FastAPI + Pydantic',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `{
//   "detail": [
//     {
//       "loc": ["body", "email"],
//       "msg": "field required",
//       "type": "value_error.missing"
//     },
//     {
//       "loc": ["body", "password"],
//       "msg": "field required",
//       "type": "value_error.missing"
//     }
//   ]
// }`,
//       errorNote: 'FastAPI returns a detail array with loc path, human-readable msg, and machine-readable type. More structured — easier to target specific nested fields.',
//       paginationFormat: `{
//   "total": 142,
//   "page": 1,
//   "page_size": 10,
//   "items": [...]
// }`,
//       paginationNote: 'Custom Pydantic response model. total replaces count. items replaces results. Flat structure, no next/previous URLs — client computes offset.',
//       router: 'FastAPI APIRouter groups endpoints by domain. Mounted into main app with prefix and tags. Automatic OpenAPI tag grouping.',
//       docStyle: 'Auto-generated Swagger UI at /docs and ReDoc at /redoc. No additional packages needed — powered by Pydantic schema introspection.',
//       highlights: [
//         { k: 'Pydantic Model', v: 'Request/response schemas defined as Pydantic BaseModel. Automatic validation, serialization, and OpenAPI schema generation.' },
//         { k: 'Dependency Injection', v: 'FastAPI\'s Depends() system — inject DB sessions, current user, auth checks cleanly without decorators.' },
//         { k: 'Response Model',  v: 'response_model param on route decorator auto-filters output fields — prevents accidental sensitive field leakage.' },
//       ],
//     },
//   },

//   Authentication: {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//       </svg>
//     ),
//     shared: {
//       title: 'Authentication Strategy',
//       subtitle: 'Stateless JWT with refresh token rotation',
//       principles: [
//         { label: 'Why JWT',            text: 'Stateless — server holds no session. Scales horizontally without shared session store. Token contains user_id, role, expiry embedded and signed.' },
//         { label: 'Access Token TTL',   text: '15-minute expiry. Short TTL limits blast radius if token is stolen. Inconvenient but secure. Client refreshes silently before expiry.' },
//         { label: 'Refresh Token',      text: 'Long-lived (7 days), stored in DB as a hash. One-time use — rotated on every refresh call. Invalidated immediately on logout.' },
//         { label: 'Token Invalidation', text: 'Stateless JWT cannot be revoked mid-flight. Mitigated by short TTL + refresh token blacklisting in DB.' },
//         { label: 'Password Hashing',   text: 'bcrypt with cost factor 12. Never stored in plaintext. Never logged. Compare-only via bcrypt.checkpw().' },
//         { label: 'Brute Force',        text: 'Login endpoint rate limited to 10/min per IP. Exponential backoff on repeated 401s. Account lockout after 10 consecutive failures.' },
//       ],
//     },
//     django: {
//       tag: 'Simple JWT / DRF Auth',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `# settings.py
// SIMPLE_JWT = {
//   "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
//   "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
//   "ROTATE_REFRESH_TOKENS": True,
//   "BLACKLIST_AFTER_ROTATION": True,
//   "ALGORITHM": "HS256",
//   "SIGNING_KEY": SECRET_KEY,
// }`,
//       errorNote: 'djangorestframework-simplejwt handles token generation, rotation, and blacklisting. Blacklisted tokens stored in DB and checked on each request.',
//       paginationFormat: `# views.py — protected endpoint
// class UserProfileView(RetrieveUpdateAPIView):
//     permission_classes = [IsAuthenticated]
//     serializer_class = UserSerializer

//     def get_object(self):
//         return self.request.user  # user injected by JWT middleware`,
//       paginationNote: 'IsAuthenticated permission class validates the Bearer token on every request. request.user is populated from JWT claims automatically.',
//       router: 'JWTAuthentication middleware validates tokens globally. Per-view permission_classes override defaults.',
//       docStyle: 'Token stored in Authorization header: Bearer <token>. DRF browsable API supports manual token entry for testing.',
//       highlights: [
//         { k: 'TokenBlackList',     v: 'djangorestframework-simplejwt blacklist app tracks revoked refresh tokens. Queried on every refresh call.' },
//         { k: 'permission_classes', v: 'Fine-grained: IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, or custom object-level permissions.' },
//         { k: 'Custom Claims',      v: 'Extend TokenObtainPairSerializer to embed role, plan, org_id into token payload at generation time.' },
//       ],
//     },
//     fastapi: {
//       tag: 'python-jose / PyJWT',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `# auth/dependencies.py
// async def get_current_user(
//     token: str = Depends(oauth2_scheme),
//     db: AsyncSession = Depends(get_db)
// ) -> User:
//     try:
//         payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
//         user_id = int(payload.get("sub"))
//     except JWTError:
//         raise HTTPException(401, "Could not validate credentials")
//     user = await db.get(User, user_id)
//     if not user:
//         raise HTTPException(401, "User not found")
//     return user`,
//       errorNote: 'Auth implemented as a FastAPI dependency. Injected via Depends(get_current_user) on any route that needs it. Clean, testable, composable.',
//       paginationFormat: `# router — protected endpoint
// @router.get("/users/me", response_model=UserResponse)
// async def get_me(
//     current_user: User = Depends(get_current_user)
// ):
//     return current_user  # type-safe, validated via Pydantic`,
//       paginationNote: 'get_current_user dependency is composable — build get_admin_user on top by adding role check. No class hierarchy needed.',
//       router: 'OAuth2PasswordBearer defines token URL for Swagger UI auto-auth. /docs shows a working Authorize button out of the box.',
//       docStyle: 'Swagger UI at /docs shows lock icons on protected endpoints. Authorize button accepts Bearer token for all subsequent requests in the UI.',
//       highlights: [
//         { k: 'Depends()',         v: 'Dependency injection is first-class. Auth, DB session, rate limiting — all injectable, all independently testable.' },
//         { k: 'HTTPException',     v: 'Raise HTTPException(status_code, detail) anywhere — FastAPI catches and serializes to correct error format automatically.' },
//         { k: 'Security Scopes',   v: 'OAuth2 scopes supported natively. Define scopes per endpoint, validate in dependency — fine-grained role control.' },
//       ],
//     },
//   },

//   Database: {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 4 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
//       </svg>
//     ),
//     shared: {
//       title: 'Database Design Strategy',
//       subtitle: 'Normalized, indexed, relationship-aware',
//       principles: [
//         { label: 'Normalization',    text: 'Schema normalized to 3NF. No redundant data. Every field depends on the key, the whole key, and nothing but the key.' },
//         { label: 'Foreign Keys',     text: 'Enforced at DB level — not just application level. Prevents orphaned records even if application code has bugs.' },
//         { label: 'Indexing Strategy', text: 'Primary keys auto-indexed. All FK columns indexed. High-cardinality filter fields (email, status, created_at) explicitly indexed.' },
//         { label: 'N+1 Prevention',  text: 'ORM queries audited for N+1. select_related / joinedload used for known joins. Django Debug Toolbar / SQLAlchemy logging in dev.' },
//         { label: 'Transactions',     text: 'Multi-table writes wrapped in atomic transactions. Rollback on any failure — DB never left in partial state.' },
//         { label: 'Denormalization',  text: 'Avoided by default. Considered only when measured query latency exceeds SLA and join is truly the bottleneck.' },
//       ],
//     },
//     django: {
//       tag: 'Django ORM + PostgreSQL',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `# models.py
// class Order(models.Model):
//     user = models.ForeignKey(
//         User,
//         on_delete=models.PROTECT,   # prevent accidental user delete
//         related_name='orders',
//         db_index=True               # explicit — FK always indexed
//     )
//     status = models.CharField(
//         max_length=20,
//         choices=OrderStatus.choices,
//         db_index=True               # filter-heavy field — indexed
//     )
//     created_at = models.DateTimeField(auto_now_add=True, db_index=True)

//     class Meta:
//         ordering = ['-created_at']`,
//       errorNote: 'Django ORM models declare relationships, indexes, and constraints in Python. db_index=True creates B-tree index. on_delete=PROTECT prevents orphan users.',
//       paginationFormat: `# Avoiding N+1 — views.py
// def get_queryset(self):
//     return (
//         Order.objects
//         .select_related('user')        # JOIN users in same query
//         .prefetch_related('items__product')  # batch-fetch related
//         .filter(user=self.request.user)
//         .only('id', 'status', 'total', 'created_at')  # lean projection
//     )`,
//       paginationNote: 'select_related generates a SQL JOIN. prefetch_related does a second query and Python-side joins — used for M2M and reverse FK. .only() prevents SELECT *.',
//       router: 'Django migrations track schema changes in version control. migrate applies them. makemigrations detects model changes. Rollback via migrate app 000X.',
//       docStyle: 'Django Admin provides a visual interface for inspecting DB state during development. Not used in production.',
//       highlights: [
//         { k: 'atomic()',           v: '@transaction.atomic decorator or context manager wraps multi-step writes. Exception triggers full rollback.' },
//         { k: 'F() expressions',   v: 'Update fields relative to their current DB value without a round-trip — atomic counter increments, no race conditions.' },
//         { k: 'Annotations',       v: 'QuerySet.annotate() adds computed fields in SQL — counts, sums, existence flags — without Python-side loops.' },
//       ],
//     },
//     fastapi: {
//       tag: 'SQLAlchemy 2.0 + Alembic',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `# models.py — SQLAlchemy 2.0 style
// class Order(Base):
//     __tablename__ = "orders"

//     id: Mapped[int] = mapped_column(primary_key=True)
//     user_id: Mapped[int] = mapped_column(
//         ForeignKey("users.id", ondelete="RESTRICT"),
//         index=True
//     )
//     status: Mapped[str] = mapped_column(
//         String(20), index=True
//     )
//     created_at: Mapped[datetime] = mapped_column(
//         default=func.now(), index=True
//     )
//     user: Mapped["User"] = relationship(back_populates="orders")`,
//       errorNote: 'SQLAlchemy 2.0 mapped_column syntax is fully type-annotated. Relationships declared bidirectionally. Alembic generates migration scripts from model diffs.',
//       paginationFormat: `# Async DB query — avoiding N+1
// async def get_user_orders(
//     user_id: int,
//     db: AsyncSession
// ) -> list[Order]:
//     result = await db.execute(
//         select(Order)
//         .options(
//             selectinload(Order.items)        # async-safe eager load
//             .selectinload(OrderItem.product)
//         )
//         .where(Order.user_id == user_id)
//         .order_by(Order.created_at.desc())
//     )
//     return result.scalars().all()`,
//       paginationNote: 'selectinload is the async-safe equivalent of prefetch_related. joinedload for single-row relationships, selectinload for collections. No N+1 in async context.',
//       router: 'Alembic manages migrations. alembic revision --autogenerate detects model changes. alembic upgrade head applies. Full migration history tracked in version control.',
//       docStyle: 'AsyncSession from sqlalchemy.ext.asyncio — all DB calls awaited. Connection pooling via asyncpg. No blocking I/O on the event loop.',
//       highlights: [
//         { k: 'AsyncSession',       v: 'All DB operations are async — no thread blocking. Injected via Depends(get_db) — session scoped to request lifecycle.' },
//         { k: 'begin() context',    v: 'async with db.begin(): auto-commits on exit, rolls back on exception. Explicit transaction control per operation.' },
//         { k: 'selectinload',       v: 'Async-safe eager loading. Issues a second SELECT IN query — safe for event-loop, prevents N+1 without blocking.' },
//       ],
//     },
//   },

//   Performance: {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     shared: {
//       title: 'Performance Strategy',
//       subtitle: 'Caching, async, pagination, and connection efficiency',
//       principles: [
//         { label: 'Redis Caching',       text: 'Read-heavy endpoints cached with Redis. Cache-aside pattern: read from cache, fallback to DB on miss, write result to cache. TTL enforced per resource type.' },
//         { label: 'Pagination',          text: 'Unbounded queries are a P0 performance risk. All list endpoints paginated. Cursor-based pagination considered for real-time feeds.' },
//         { label: 'DB Connection Pool',  text: 'Connection pooling prevents per-request DB handshakes. Pool size tuned to worker count. Idle connections recycled.' },
//         { label: 'Query Optimization',  text: 'EXPLAIN ANALYZE run on slow queries. Composite indexes for multi-field filters. Partial indexes for status-filtered queries.' },
//         { label: 'Background Workers',  text: 'Expensive operations (email, AI, report generation) offloaded to async workers. Response returns immediately with task_id.' },
//         { label: 'Response Profiling',  text: 'Response time tracked per endpoint. p95 and p99 latencies monitored. Alerts on sustained >200ms average.' },
//       ],
//     },
//     django: {
//       tag: 'Gunicorn + Celery + Redis',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `# cache.py — cache-aside pattern
// from django.core.cache import cache

// def get_user_profile(user_id: int) -> dict:
//     cache_key = f"user:{user_id}:profile"
//     cached = cache.get(cache_key)
//     if cached:
//         return cached                      # cache HIT

//     user = User.objects.get(pk=user_id)
//     data = UserSerializer(user).data
//     cache.set(cache_key, data, timeout=120) # 120s TTL
//     return data                            # cache MISS → DB`,
//       errorNote: 'Django cache framework abstracts the backend. swap Redis for Memcached without changing application code. Cache key namespacing prevents collisions across services.',
//       paginationFormat: `# celery tasks — background worker
// @shared_task(bind=True, max_retries=3)
// def send_order_confirmation(self, order_id: int):
//     try:
//         order = Order.objects.select_related('user').get(pk=order_id)
//         send_email(order.user.email, order)
//     except Exception as exc:
//         raise self.retry(exc=exc, countdown=30)  # retry in 30s`,
//       paginationNote: 'Celery task with automatic retry. bind=True exposes self for retry logic. countdown=30 waits before next retry. max_retries=3 prevents infinite loops.',
//       router: 'Gunicorn with multiple sync workers handles concurrency. Each worker is a full Python process. Worker count = 2×CPU+1 is the standard formula.',
//       docStyle: 'Django Debug Toolbar shows query count, query time, and cache hits per request. Silk middleware for production-safe request profiling.',
//       highlights: [
//         { k: 'cache.get_or_set()', v: 'Atomic cache-or-compute in one call. Thread-safe — prevents cache stampede in high-concurrency scenarios.' },
//         { k: 'Celery Beat',        v: 'Periodic tasks (daily reports, cache warmup, cleanup jobs) scheduled via Celery Beat — cron without cron.' },
//         { k: 'DB conn pooling',    v: 'CONN_MAX_AGE in settings reuses DB connections per worker. Reduces handshake overhead on every request.' },
//       ],
//     },
//     fastapi: {
//       tag: 'Uvicorn + asyncio + Redis',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `# cache.py — async cache-aside
// import aioredis

// async def get_user_profile(
//     user_id: int,
//     redis: Redis,
//     db: AsyncSession
// ) -> dict:
//     cache_key = f"user:{user_id}:profile"
//     cached = await redis.get(cache_key)
//     if cached:
//         return json.loads(cached)            # cache HIT

//     user = await db.get(User, user_id)
//     data = UserResponse.from_orm(user).dict()
//     await redis.setex(cache_key, 120, json.dumps(data))
//     return data                              # cache MISS → DB`,
//       errorNote: 'aioredis provides non-blocking Redis access. All cache reads/writes are awaited — never block the event loop. Redis injected as FastAPI dependency.',
//       paginationFormat: `# background task — FastAPI BackgroundTasks
// @router.post("/orders/", status_code=201)
// async def create_order(
//     data: OrderCreate,
//     background_tasks: BackgroundTasks,
//     db: AsyncSession = Depends(get_db),
//     user: User = Depends(get_current_user),
// ):
//     order = await create_order_db(data, user, db)
//     background_tasks.add_task(send_order_email, order)  # non-blocking
//     return order  # response returned immediately`,
//       paginationNote: 'BackgroundTasks runs after response is sent. For heavy jobs, use Celery or ARQ (async Redis queue). FastAPI itself is not a task queue.',
//       router: 'Uvicorn with Gunicorn as process manager. Single-process Uvicorn for dev. Uvicorn workers behind Gunicorn for production — async-first throughout.',
//       docStyle: 'asyncpg is the async PostgreSQL driver. Dramatically faster than psycopg2 for concurrent workloads — no thread-per-connection model.',
//       highlights: [
//         { k: 'Event Loop',        v: 'Single event loop handles all requests concurrently. I/O operations yield to other requests while waiting. No threads needed for I/O concurrency.' },
//         { k: 'Connection Pool',   v: 'asyncpg maintains async connection pool. create_pool() at startup, shared across all requests via app.state. No blocking handshakes.' },
//         { k: 'ARQ / Celery',      v: 'Heavy tasks (AI, reports) use ARQ (async Redis queue) or standard Celery. BackgroundTasks is for lightweight post-response work only.' },
//       ],
//     },
//   },

//   Scalability: {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
//       </svg>
//     ),
//     shared: {
//       title: 'Scalability Plan',
//       subtitle: 'Horizontal scaling, queues, and service boundaries',
//       principles: [
//         { label: 'Horizontal Scaling',  text: 'Stateless design enables horizontal scaling. Add more instances behind a load balancer. No shared memory — state lives in DB and Redis.' },
//         { label: 'Load Balancing',      text: 'Nginx or cloud ALB routes traffic across instances. Sticky sessions not needed — JWT is stateless. Health checks on /api/health.' },
//         { label: 'Message Queues',      text: 'When to introduce: if a task can fail independently, retry independently, or run on a different machine — it belongs in a queue.' },
//         { label: 'DB Read Replicas',    text: 'Read-heavy endpoints routed to read replicas. Writes still go to primary. Replication lag acceptable for non-critical reads.' },
//         { label: 'Service Splitting',   text: 'Monolith first. Split when: a domain scales differently, a team owns it independently, or a failure in it should not cascade.' },
//         { label: 'Microservices Gate',  text: 'Split to microservices only when team size, deployment frequency, or scaling requirements genuinely demand it. Not premature.' },
//       ],
//     },
//     django: {
//       tag: 'Gunicorn Workers + Celery',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `# Gunicorn config — gunicorn.conf.py
// workers = multiprocessing.cpu_count() * 2 + 1
// worker_class = "sync"           # sync for CPU-bound
// # worker_class = "gevent"       # async I/O if needed
// bind = "0.0.0.0:8000"
// timeout = 30
// keepalive = 5
// max_requests = 1000             # recycle workers — prevent memory bloat
// max_requests_jitter = 100`,
//       errorNote: 'Each Gunicorn worker is a full process. workers = 2×CPU+1 is the rule. max_requests recycles workers after N requests to prevent slow memory leaks.',
//       paginationFormat: `# Database routing — multiple DBs
// # settings.py
// DATABASES = {
//     "default": { ... },          # primary — writes
//     "replica": { ... },          # read replica
// }
// DATABASE_ROUTERS = ['myapp.routers.ReadReplicaRouter']

// # routers.py
// class ReadReplicaRouter:
//     def db_for_read(self, model, **hints):
//         return "replica"         # all reads → replica
//     def db_for_write(self, model, **hints):
//         return "default"         # all writes → primary`,
//       paginationNote: 'Django multi-DB routing is transparent to application code. Views and serializers do not change. Router decides backend based on operation type.',
//       router: 'Celery workers run as separate processes, separate machines. Scale workers independently from web workers. Auto-scaling workers based on queue depth.',
//       docStyle: 'Django monolith scales well to medium traffic. Split to microservices when a domain needs independent deployment or separate team ownership.',
//       highlights: [
//         { k: 'Worker Autoscale',  v: 'Celery autoscale feature dynamically adjusts worker concurrency based on queue depth. No manual intervention needed.' },
//         { k: 'Cache Warming',     v: 'Celery Beat pre-populates cache for high-traffic endpoints before traffic hits. Prevents cold-cache latency spikes.' },
//         { k: 'Django Channels',   v: 'When WebSocket support needed — Django Channels adds async layer without full framework rewrite.' },
//       ],
//     },
//     fastapi: {
//       tag: 'Uvicorn Workers + ARQ',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `# Gunicorn with Uvicorn workers
// # Dockerfile CMD
// CMD ["gunicorn", "app.main:app",
//      "--workers", "4",
//      "--worker-class", "uvicorn.workers.UvicornWorker",
//      "--bind", "0.0.0.0:8000",
//      "--timeout", "30",
//      "--keepalive", "5"
// ]
// # Each Uvicorn worker = 1 event loop
// # 4 workers × async concurrency = high throughput`,
//       errorNote: 'Uvicorn workers replace Gunicorn sync workers. Each worker runs its own event loop. 4 workers handle far more concurrent requests than 4 sync workers.',
//       paginationFormat: `# ARQ async task queue
// # tasks.py
// async def send_email_task(ctx, order_id: int):
//     db = ctx["db"]
//     order = await db.get(Order, order_id)
//     await send_email_async(order.user.email, order)

// # Enqueue from endpoint
// await arq_pool.enqueue_job("send_email_task", order_id)

// # worker.py
// class WorkerSettings:
//     functions = [send_email_task]
//     redis_settings = RedisSettings(host="localhost")`,
//       paginationNote: 'ARQ is the async-native alternative to Celery. All task functions are async. No thread overhead. Redis-backed queue. Ideal for FastAPI async architecture.',
//       router: 'FastAPI\'s async-first design makes it naturally suited for microservices. Each service can be a focused FastAPI app with its own DB, deployed independently.',
//       docStyle: 'WebSocket support is first-class in FastAPI — @app.websocket() decorator. No additional library needed. Event loop handles WS connections alongside HTTP.',
//       highlights: [
//         { k: 'Service Mesh Ready',  v: 'Stateless FastAPI services integrate naturally with Kubernetes, Istio, or AWS ECS. Health endpoints, graceful shutdown built in.' },
//         { k: 'Event-Driven',        v: 'Async architecture makes event-driven patterns natural. Publish to Redis Streams or Kafka from async endpoints without blocking.' },
//         { k: 'OpenTelemetry',       v: 'FastAPI middleware for distributed tracing. Propagate trace IDs across service calls — essential for microservice debugging.' },
//       ],
//     },
//   },

//   'Framework Comparison': {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
//       </svg>
//     ),
//     shared: {
//       title: 'Framework Comparison',
//       subtitle: 'Django vs FastAPI — when to choose which',
//       principles: [
//         { label: 'Both are production-ready', text: 'Django and FastAPI are both battle-tested. The choice is driven by team, use-case, and scaling requirements — not maturity.' },
//         { label: 'Django sweet spot',         text: 'Rapid development, admin-heavy apps, teams that want convention over configuration. Batteries included means less glue code.' },
//         { label: 'FastAPI sweet spot',         text: 'High-concurrency APIs, microservices, teams comfortable with async Python. Best-in-class performance for I/O-bound workloads.' },
//         { label: 'Async matters for I/O',     text: 'If your endpoints mostly wait for DB/Redis/HTTP — async wins. If CPU-bound — async gives no benefit over sync Django workers.' },
//         { label: 'Team velocity',             text: 'Django\'s admin, ORM, and auth out-of-box can be 2–3× faster to ship initially. FastAPI requires more explicit wiring.' },
//         { label: 'Both can scale',            text: 'Neither forces microservices. Both can scale horizontally. Performance difference matters only at high concurrency (100+ rps).' },
//       ],
//     },
//     django: {
//       tag: 'Django — Active Mode',
//       tagColor: 'text-green-400 border-green-800 bg-green-950/30',
//       errorFormat: `# Django advantages summary
// ✅ Built-in Admin (zero-cost back-office)
// ✅ ORM migrations — makemigrations / migrate
// ✅ DRF — serializers, viewsets, permissions
// ✅ Auth — users, groups, permissions built-in
// ✅ Session, CSRF, security headers by default
// ✅ Large ecosystem — packages for everything
// ✅ Strong conventions — less architectural debate
// ✅ Signals, middleware, management commands`,
//       errorNote: 'Django\'s "batteries included" philosophy reduces decision fatigue. The right tool when you need to ship fast and maintain long-term.',
//       paginationFormat: `# Django limitations
// ⚠  Sync-first — async requires explicit opt-in
// ⚠  Heavier memory footprint per worker
// ⚠  DRF boilerplate grows with complex APIs
// ⚠  Less performant at high concurrency vs async
// ⚠  OpenAPI spec requires drf-spectacular add-on
// ⚠  Pydantic-style validation needs extra setup`,
//       paginationNote: 'Not weaknesses — tradeoffs. Django\'s sync model is perfectly adequate for most use cases under 10k rpm with proper caching.',
//       router: 'Choose Django when: building admin-heavy SaaS, working with legacy DB, needing built-in auth/permissions, or shipping fast with a small team.',
//       docStyle: 'This portfolio was built assuming Django as the primary backend — the School Management System demonstrates Django\'s real-world application at SaaS scale.',
//       highlights: [
//         { k: 'Signals',         v: 'post_save, pre_delete signals for decoupled side effects. Dangerous if overused, but powerful for audit logs, cache invalidation.' },
//         { k: 'Admin',           v: 'Django Admin generates CRUD UI from models automatically. Saved hundreds of hours in internal tooling across real projects.' },
//         { k: 'Management Cmds', v: 'python manage.py custom_command for one-off scripts, data migrations, seed scripts. Built-in scheduling via Celery Beat.' },
//       ],
//     },
//     fastapi: {
//       tag: 'FastAPI — Active Mode',
//       tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
//       errorFormat: `# FastAPI advantages summary
// ✅ Async-first — native event loop concurrency
// ✅ Automatic OpenAPI / Swagger UI at /docs
// ✅ Pydantic validation — type-safe, explicit
// ✅ Dependency injection — clean, testable
// ✅ 3–5× faster than Django under high I/O load
// ✅ First-class WebSocket support
// ✅ Lightweight — only what you need
// ✅ Python type hints enforced throughout`,
//       errorNote: 'FastAPI\'s explicit architecture means every piece is intentional. Ideal for teams that value clarity and type safety over convention.',
//       paginationFormat: `# FastAPI limitations
// ⚠  No built-in Admin — must build or use SQLAdmin
// ⚠  No built-in auth — must implement or use fastapi-users
// ⚠  Async bugs harder to debug than sync
// ⚠  Smaller ecosystem than Django for add-ons
// ⚠  Alembic migrations less ergonomic than Django
// ⚠  Requires more upfront architectural decisions`,
//       paginationNote: 'FastAPI requires you to assemble your own stack. More flexible, but more decisions. Right for experienced teams, trickier for greenfield solo projects.',
//       router: 'Choose FastAPI when: building high-throughput APIs, microservices, ML model serving, real-time features (WS), or when team values explicit type safety.',
//       docStyle: 'Datavo (AI schema architect) was built with FastAPI — the async AI job pattern, streaming responses, and schema validation all leverage FastAPI\'s strengths.',
//       highlights: [
//         { k: 'Type Safety',       v: 'End-to-end type safety from request schema to DB model to response model. Runtime validation via Pydantic catches mismatches early.' },
//         { k: '/docs auto-gen',    v: 'Zero-config Swagger UI. Pydantic models auto-generate JSON Schema. API documentation is always in sync with code.' },
//         { k: 'Testability',       v: 'Dependencies are injectable — override get_db or get_current_user in tests with mocks. No monkey-patching required.' },
//       ],
//     },
//   },
// }

// // ─────────────────────────────────────────────────────────────
// // SUB-COMPONENTS
// // ─────────────────────────────────────────────────────────────

// function SectionNav({ active, onChange, mode }) {
//   return (
//     <nav className="hidden lg:flex flex-col gap-0.5 w-52 xl:w-60 shrink-0">
//       {sections.map((s, i) => {
//         const sec = content[s]
//         return (
//           <button
//             key={s}
//             onClick={() => onChange(s)}
//             style={{ animationDelay: `${i * 50}ms` }}
//             className={`animate-slide-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
//               active === s
//                 ? 'bg-gray-800 border border-gray-700 text-white'
//                 : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
//             }`}
//           >
//             <span className={`transition-colors duration-200 ${active === s ? (mode === 'django' ? 'text-emerald-400' : 'text-blue-400') : 'text-gray-600 group-hover:text-gray-400'}`}>
//               {sec.icon}
//             </span>
//             <span className="text-xs font-mono">{s}</span>
//             {active === s && (
//               <div className={`ml-auto w-1 h-4 rounded-full ${mode === 'django' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
//             )}
//           </button>
//         )
//       })}

//       {/* Framework reminder */}
//       <div className="mt-4 px-3 py-3 border border-gray-800 rounded-lg bg-gray-900/50">
//         <p className="text-xs font-mono text-gray-600 mb-2">Active mode</p>
//         <div className={`flex items-center gap-2 text-xs font-mono font-semibold ${mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}`}>
//           <div className={`w-1.5 h-1.5 rounded-full ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
//           {mode === 'django' ? 'Django' : 'FastAPI'}
//         </div>
//         <p className="text-xs font-mono text-gray-700 mt-1.5 leading-relaxed">
//           Toggle in header to see how this section changes.
//         </p>
//       </div>
//     </nav>
//   )
// }

// function CodeBlock({ code, label, note, mode }) {
//   const [copied, setCopied] = useState(false)
//   function handleCopy() {
//     navigator.clipboard.writeText(code).catch(() => {})
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }
//   return (
//     <div className="border border-gray-800 rounded-xl overflow-hidden">
//       <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
//         <div className="flex items-center gap-2">
//           <div className="flex gap-1.5">
//             <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
//             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
//             <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
//           </div>
//           {label && <span className="text-xs font-mono text-gray-500 ml-1">{label}</span>}
//         </div>
//         <button
//           onClick={handleCopy}
//           className="text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"
//         >
//           {copied ? (
//             <><svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span className="text-emerald-400">Copied</span></>
//           ) : (
//             <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3"/></svg><span>Copy</span></>
//           )}
//         </button>
//       </div>
//       <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-5 bg-gray-950/60 whitespace-pre">{code}</pre>
//       {note && <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/40"><p className="text-xs font-mono text-gray-500 leading-relaxed">{note}</p></div>}
//     </div>
//   )
// }

// // Animated section reveal
// function useInView(ref) {
//   const [visible, setVisible] = useState(false)
//   useEffect(() => {
//     const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
//     if (ref.current) obs.observe(ref.current)
//     return () => obs.disconnect()
//   }, [ref])
//   return visible
// }

// function AnimatedSection({ children, delay = 0 }) {
//   const ref = useRef(null)
//   const visible = useInView(ref)
//   return (
//     <div
//       ref={ref}
//       style={{ animationDelay: `${delay}ms` }}
//       className={visible ? 'animate-fade-up' : 'opacity-0'}
//     >
//       {children}
//     </div>
//   )
// }

// function SectionContent({ sectionKey, mode }) {
//   const sec = content[sectionKey]
//   const fm = sec[mode]
//   const shared = sec.shared

//   return (
//     <div className="space-y-8">
//       {/* Section header */}
//       <AnimatedSection>
//         <div className="flex items-start gap-4">
//           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
//             mode === 'django' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'
//           }`}>
//             {sec.icon}
//           </div>
//           <div>
//             <div className="flex items-center gap-2 flex-wrap mb-1">
//               <h2 className="text-lg font-mono font-bold text-white">{shared.title}</h2>
//               <span className={`text-xs font-mono px-2 py-0.5 rounded border ${fm.tagColor}`}>{fm.tag}</span>
//             </div>
//             <p className="text-sm font-mono text-gray-500">{shared.subtitle}</p>
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* Principles grid */}
//       <AnimatedSection delay={60}>
//         <div>
//           <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Core Principles</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {shared.principles.map((p, i) => (
//               <div
//                 key={p.label}
//                 className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700"
//                 style={{ animationDelay: `${i * 40}ms` }}
//               >
//                 <div className={`text-xs font-mono font-semibold mb-1.5 ${mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}`}>
//                   {p.label}
//                 </div>
//                 <p className="text-xs font-mono text-gray-400 leading-relaxed">{p.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* Framework-specific code blocks */}
//       <AnimatedSection delay={120}>
//         <div>
//           <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
//             {mode === 'django' ? 'Django Implementation' : 'FastAPI Implementation'}
//           </h3>
//           <div className="space-y-4">
//             <CodeBlock code={fm.errorFormat} note={fm.errorNote} mode={mode} />
//             <CodeBlock code={fm.paginationFormat} note={fm.paginationNote} mode={mode} />
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* Framework notes */}
//       <AnimatedSection delay={160}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
//             <p className="text-xs font-mono text-gray-500 mb-1.5">Routing / Structure</p>
//             <p className="text-xs font-mono text-gray-400 leading-relaxed">{fm.router}</p>
//           </div>
//           <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
//             <p className="text-xs font-mono text-gray-500 mb-1.5">Documentation / Tooling</p>
//             <p className="text-xs font-mono text-gray-400 leading-relaxed">{fm.docStyle}</p>
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* Highlights */}
//       <AnimatedSection delay={200}>
//         <div>
//           <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Key Concepts</h3>
//           <div className="space-y-2">
//             {fm.highlights.map((h, i) => (
//               <div key={h.k} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
//                 <code className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded border ${
//                   mode === 'django' ? 'text-emerald-400 border-emerald-900 bg-emerald-950/40' : 'text-blue-400 border-blue-900 bg-blue-950/40'
//                 }`}>
//                   {h.k}
//                 </code>
//                 <p className="text-xs font-mono text-gray-400 leading-relaxed">{h.v}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* Framework comparison strip — shown only on Framework Comparison section */}
//       {sectionKey === 'Framework Comparison' && (
//         <AnimatedSection delay={240}>
//           <div className="border border-gray-800 rounded-xl overflow-hidden">
//             <div className="grid grid-cols-2 divide-x divide-gray-800">
//               <div className="p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <div className="w-2 h-2 rounded-full bg-emerald-400" />
//                   <span className="text-xs font-mono font-semibold text-emerald-400">Choose Django when...</span>
//                 </div>
//                 {['Admin panel needed', 'Fast initial shipping', 'Built-in auth/perms', 'Convention over config', 'Sync is fine for load', 'SaaS / CRUD heavy'].map(t => (
//                   <div key={t} className="flex items-center gap-2 py-1 text-xs font-mono text-gray-400">
//                     <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
//                     {t}
//                   </div>
//                 ))}
//               </div>
//               <div className="p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <div className="w-2 h-2 rounded-full bg-blue-400" />
//                   <span className="text-xs font-mono font-semibold text-blue-400">Choose FastAPI when...</span>
//                 </div>
//                 {['High concurrency I/O', 'Microservices', 'ML model serving', 'WebSocket / streaming', 'Type safety critical', 'Async-first team'].map(t => (
//                   <div key={t} className="flex items-center gap-2 py-1 text-xs font-mono text-gray-400">
//                     <svg className="w-3 h-3 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
//                     {t}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </AnimatedSection>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────

// export default function Architecture({ onNavigate }) {
//   const { mode } = useFramework()
//   const [activeSection, setActiveSection] = useState('API Design')
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

//   // Reset to top section on mode change
//   useEffect(() => {
//     setActiveSection('API Design')
//   }, [mode])

//   return (
//     <div className="page-enter min-h-screen">

//       {/* ── Page Header ──────────────────────────────────── */}
//       <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-14 z-30">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
//           <div className="flex items-start justify-between gap-4 flex-wrap">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <button
//                   onClick={() => onNavigate('home')}
//                   className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors"
//                 >
//                   ← Home
//                 </button>
//                 <span className="text-gray-700">/</span>
//                 <span className="text-xs font-mono text-gray-400">Architecture Decisions</span>
//               </div>
//               <h1 className="text-xl font-mono font-bold text-white">Architecture Decisions</h1>
//               <p className="text-xs font-mono text-gray-500 mt-1">
//                 Engineering documentation — content adapts to{' '}
//                 <span className={mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}>
//                   {mode === 'django' ? 'Django' : 'FastAPI'}
//                 </span>{' '}
//                 mode
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Active section badge */}
//               <span className={`hidden sm:block text-xs font-mono px-2.5 py-1 rounded-lg border ${
//                 mode === 'django' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'
//               }`}>
//                 {activeSection}
//               </span>

//               {/* Mobile section picker */}
//               <div className="relative lg:hidden">
//                 <button
//                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                   className="text-xs font-mono text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 flex items-center gap-2"
//                 >
//                   Sections
//                   <svg className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 {mobileMenuOpen && (
//                   <div className="absolute right-0 top-full mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl min-w-[180px]">
//                     {sections.map(s => (
//                       <button
//                         key={s}
//                         onClick={() => { setActiveSection(s); setMobileMenuOpen(false) }}
//                         className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors ${activeSection === s ? (mode === 'django' ? 'text-emerald-400 bg-emerald-950/30' : 'text-blue-400 bg-blue-950/30') : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Mobile section tabs */}
//           <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 lg:hidden">
//             {sections.map(s => (
//               <button
//                 key={s}
//                 onClick={() => setActiveSection(s)}
//                 className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
//                   activeSection === s
//                     ? mode === 'django'
//                       ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30'
//                       : 'text-blue-400 border-blue-800 bg-blue-950/30'
//                     : 'text-gray-500 border-gray-800 hover:border-gray-600'
//                 }`}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Body ─────────────────────────────────────────── */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <div className="flex gap-10">

//           {/* Left sidebar nav */}
//           <SectionNav active={activeSection} onChange={setActiveSection} mode={mode} />

//           {/* Main content */}
//           <div className="flex-1 min-w-0">
//             <SectionContent key={`${activeSection}-${mode}`} sectionKey={activeSection} mode={mode} />
//           </div>
//         </div>
//       </div>

//       {/* ── Bottom nav ────────────────────────────────────── */}
//       <div className="border-t border-gray-800 bg-gray-950">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div>
//               <p className="text-xs font-mono text-gray-500">
//                 Architecture decisions reflect real-world backend engineering patterns.
//               </p>
//               <p className="text-xs font-mono text-gray-700 mt-0.5">
//                 All code examples are illustrative — adapted from actual project implementations.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => onNavigate('playground')}
//                 className="btn-primary text-xs font-mono px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
//               >
//                 Try API Playground
//               </button>
//               <button
//                 onClick={() => onNavigate('projects')}
//                 className="btn-outline text-xs font-mono px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg"
//               >
//                 View Projects
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }