import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'

// ─────────────────────────────────────────────────────────────
// DATA — all content keyed by framework mode
// ─────────────────────────────────────────────────────────────

const sections = [
  'API Design',
  'Authentication',
  'Database',
  'Async Pipelines',
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
        { label: 'Versioning',         text: 'API versioned at the URL level — /api/v1/. No breaking changes within a version. v2 for breaking changes only.' },
        { label: 'Pagination',         text: 'All list endpoints paginated. Default page_size: 10, max: 100. Clients must never receive unbounded lists — that\'s a P0 risk.' },
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
      errorNote: 'DRF returns field-keyed objects. Each key maps to a list of error strings. Great for form rendering — map directly to field-level UI errors. Used in GazaBridge and PathWeaver.',
      paginationFormat: `{
  "count": 142,
  "next": "/api/v1/users/?page=2",
  "previous": null,
  "results": [...]
}`,
      paginationNote: 'DRF PageNumberPagination. count is the total across all pages. next/previous are full URLs ready to use. GazaBridge uses this for paginated course and resource listings — cached in Redis DB 1.',
      router: 'Django Router auto-generates URL patterns from ViewSets. Reduces boilerplate, enforces RESTful conventions. GazaBridge uses this across 6 backend modules — users, auth, posts, courses, live sessions, resources.',
      docStyle: 'GazaBridge uses drf-spectacular for auto-generated OpenAPI 3.0 docs at /api/docs/. Zero manual maintenance — schema stays in sync with code automatically.',
      highlights: [
        { k: 'Serializer',   v: 'DRF Serializer handles input validation, output formatting, and nested relationships. Used in GazaBridge to serialize course enrollments with nested user profiles.' },
        { k: 'ViewSet',      v: 'Single class handles list, create, retrieve, update, destroy — wired automatically via Router. PathWeaver\'s job listings endpoint is a ViewSet.' },
        { k: 'Renderer',     v: 'JSONRenderer for production. BrowsableAPIRenderer in development for quick manual testing without Postman.' },
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
      errorNote: 'FastAPI returns a detail array with loc path, human-readable msg, and machine-readable type. More structured — easier to target specific nested fields. Used in Datavo for schema generation request validation.',
      paginationFormat: `{
  "total": 142,
  "page": 1,
  "page_size": 10,
  "items": [...]
}`,
      paginationNote: 'Custom Pydantic response model. total replaces count. items replaces results. Flat structure — client computes offset. Datavo uses this for paginated schema history.',
      router: 'FastAPI APIRouter groups endpoints by domain. Mounted into main app with prefix and tags. Automatic OpenAPI tag grouping — Datavo uses separate routers for schema generation, history, and user management.',
      docStyle: 'Auto-generated Swagger UI at /docs and ReDoc at /redoc. No additional packages — powered by Pydantic schema introspection. Datavo\'s entire API contract is always live and testable at /docs.',
      highlights: [
        { k: 'Pydantic Model',       v: 'Request/response schemas defined as Pydantic BaseModel. Automatic validation, serialization, and OpenAPI schema generation — all from one class.' },
        { k: 'Dependency Injection', v: 'FastAPI\'s Depends() system injects DB sessions, current user, auth checks cleanly without decorators. Datavo uses this for AI agent context injection.' },
        { k: 'Response Model',       v: 'response_model param on route decorator auto-filters output fields — prevents accidental sensitive field leakage in generated schemas.' },
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
      subtitle: 'Stateless JWT with Redis token blacklisting — instant revocation on logout',
      principles: [
        { label: 'Why JWT',            text: 'Stateless — server holds no session. Scales horizontally without shared session store. Token contains user_id, role, expiry embedded and signed.' },
        { label: 'Access Token TTL',   text: '15-minute expiry. Short TTL limits blast radius if token is stolen. Client refreshes silently before expiry using the refresh token.' },
        { label: 'Refresh Token',      text: 'Long-lived (7 days), stored in DB as a hash. One-time use — rotated on every refresh call. Invalidated immediately on logout.' },
        { label: 'Token Blacklisting', text: 'GazaBridge uses Redis DB 2 for JWT blacklisting — instant revocation on logout without waiting for access token TTL to expire.' },
        { label: 'Password Hashing',   text: 'bcrypt with cost factor 12. Never stored in plaintext. Never logged. Compare-only via bcrypt.checkpw().' },
        { label: 'Brute Force',        text: 'Login endpoint rate limited — 10/min per IP via GazaBridge\'s custom GlobalRateLimitMiddleware. Account lockout after repeated failures.' },
      ],
    },
    django: {
      tag: 'SimpleJWT + Redis Blacklist',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# settings.py — GazaBridge auth config
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":  True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
}

# Redis partition map (GazaBridge)
# DB 0  →  Celery broker + result backend
# DB 1  →  Django API cache (paginated views)
# DB 2  →  Rate limiter + JWT token blacklist`,
      errorNote: 'GazaBridge isolates the JWT blacklist into Redis DB 2 — completely separate from the task broker (DB 0) and API cache (DB 1). Flushing one partition never corrupts the others.',
      paginationFormat: `# auth_app/views.py — Google OAuth2 + JWT
class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")
        info  = verify_google_token(token)  # validate with Google

        user, _ = User.objects.get_or_create(
            email=info["email"],
            defaults={"name": info["name"]}
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            "access":  str(refresh.access_token),
            "refresh": str(refresh),
        })`,
      paginationNote: 'GazaBridge supports both standard JWT login and Google OAuth2 social login. Both flows return the same token pair — client code stays identical regardless of auth method.',
      router: 'JWTAuthentication middleware validates Bearer tokens globally. Per-view permission_classes override. GazaBridge uses IsAuthenticated on all write endpoints, AllowAny on public resource discovery.',
      docStyle: 'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and all secrets are env-separated. Never committed. Loaded via python-dotenv at startup.',
      highlights: [
        { k: 'Redis DB 2',         v: 'GazaBridge\'s blacklist lives in Redis DB 2 — isolated partition. Logout = instant revocation. Token TTL doesn\'t matter after blacklisting.' },
        { k: 'IP Spoofing Guard',  v: 'GlobalRateLimitMiddleware reads real IP from X-Forwarded-For only when request comes from a trusted proxy in RATE_LIMIT_TRUSTED_PROXIES. Direct requests always use REMOTE_ADDR.' },
        { k: 'Custom Claims',      v: 'Extend TokenObtainPairSerializer to embed role, org_id into token payload at generation time. Decoded on every request — no extra DB lookup.' },
      ],
    },
    fastapi: {
      tag: 'python-jose / PyJWT',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# auth/dependencies.py — Datavo pattern
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    AsyncSession = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=["HS256"]
        )
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(401, "Could not validate credentials")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(401, "User not found")
    return user`,
      errorNote: 'Auth is a FastAPI dependency — injected via Depends(get_current_user) on any protected route. Clean, testable, composable. No class hierarchy needed.',
      paginationFormat: `# Protected route — Datavo schema history
@router.get("/schemas/", response_model=list[SchemaResponse])
async def list_schemas(
    current_user: User = Depends(get_current_user),
    db: AsyncSession  = Depends(get_db),
):
    result = await db.execute(
        select(Schema)
        .where(Schema.user_id == current_user.id)
        .order_by(Schema.created_at.desc())
    )
    return result.scalars().all()`,
      paginationNote: 'get_current_user dependency is composable — build get_admin_user on top by adding a role check. No class hierarchy, no decorators. Just function composition.',
      router: 'OAuth2PasswordBearer defines the token URL for Swagger UI auto-auth. /docs shows a working Authorize button — every protected endpoint gets a lock icon automatically.',
      docStyle: 'Swagger UI at /docs shows lock icons on protected endpoints. Authorize once — all subsequent requests in the UI carry the Bearer token automatically.',
      highlights: [
        { k: 'Depends()',       v: 'Dependency injection is first-class. Auth, DB session, rate limiting — all injectable, all independently testable without mocking globals.' },
        { k: 'HTTPException',  v: 'Raise HTTPException(status_code, detail) anywhere — FastAPI catches and serializes to correct error format automatically. No error handler boilerplate.' },
        { k: 'Security Scopes', v: 'OAuth2 scopes supported natively. Define scopes per endpoint, validate in dependency — fine-grained role control without a full RBAC framework.' },
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
      subtitle: 'Schema-first, migration-safe, query-optimized',
      principles: [
        { label: 'Normalization',      text: 'Schema normalized to 3NF. No redundant data. Every field depends on the key, the whole key, and nothing but the key.' },
        { label: 'Foreign Keys',       text: 'Enforced at DB level — not just application level. Prevents orphaned records even if application code has bugs.' },
        { label: 'Indexing Strategy',  text: 'Primary keys auto-indexed. All FK columns indexed. High-cardinality filter fields (email, status, created_at) explicitly indexed.' },
        { label: 'N+1 Prevention',     text: 'ORM queries audited for N+1. select_related / joinedload for known joins. Django Debug Toolbar / SQLAlchemy logging in dev to catch regressions.' },
        { label: 'Transactions',       text: 'Multi-table writes wrapped in atomic transactions. Rollback on any failure — DB never left in partial state. Critical in PathWeaver\'s resume + job write pipeline.' },
        { label: 'Connection Pooling', text: 'GazaBridge connects to Supabase PostgreSQL via PgBouncer on port 6543 — not a direct connection. Pooler handles handshake overhead at scale.' },
      ],
    },
    django: {
      tag: 'Django ORM + PostgreSQL (Supabase)',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# GazaBridge — course enrollment model
class Enrollment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,    # never orphan — user delete blocked
        related_name='enrollments',
        db_index=True
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        db_index=True
    )
    enrolled_at = models.DateTimeField(
        auto_now_add=True, db_index=True
    )

    class Meta:
        unique_together = ('user', 'course')  # no duplicate enrollments
        ordering = ['-enrolled_at']`,
      errorNote: 'on_delete=PROTECT prevents accidental user deletion from cascading into enrollment records. unique_together enforces data integrity at the DB level — not just application code.',
      paginationFormat: `# GazaBridge — N+1 safe queryset
def get_queryset(self):
    return (
        Enrollment.objects
        .select_related('user', 'course')          # JOIN in one query
        .prefetch_related('course__live_sessions') # batch-fetch M2M
        .filter(user=self.request.user)
        .only('id', 'course__title', 'enrolled_at')  # no SELECT *
    )`,
      paginationNote: 'select_related generates a SQL JOIN. prefetch_related issues a second IN query for M2M — Python-side join. .only() prevents SELECT * — lean projections on paginated list endpoints.',
      router: 'Supabase connection: HOST=aws-1-ap-northeast-1.pooler.supabase.com, PORT=6543 (PgBouncer). Direct port 5432 only for migration runs — pooler doesn\'t support DDL statements.',
      docStyle: 'Django migrations track schema changes in version control. makemigrations detects model changes, migrate applies. GazaBridge has a clean migration history across all 6 app modules.',
      highlights: [
        { k: 'atomic()',         v: '@transaction.atomic wraps multi-step writes — enrollment + notification + cache invalidation as one unit. Exception triggers full rollback.' },
        { k: 'F() expressions', v: 'Update fields relative to current DB value without a round-trip — atomic counter increments, no race conditions in concurrent enrollment flows.' },
        { k: 'Annotations',     v: 'QuerySet.annotate() adds computed fields in SQL — enrollment counts, completion rates — without Python-side loops on paginated lists.' },
      ],
    },
    fastapi: {
      tag: 'SQLAlchemy 2.0 + Alembic',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# Datavo — schema history model (SQLAlchemy 2.0)
class GeneratedSchema(Base):
    __tablename__ = "generated_schemas"

    id: Mapped[int]      = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )
    title:   Mapped[str]      = mapped_column(String(255))
    content: Mapped[str]      = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(), index=True
    )
    user: Mapped["User"] = relationship(back_populates="schemas")`,
      errorNote: 'SQLAlchemy 2.0 mapped_column is fully type-annotated. Alembic generates migration scripts from model diffs — alembic revision --autogenerate. Full migration history in version control.',
      paginationFormat: `# Datavo — async N+1 safe query
async def get_user_schemas(
    user_id: int,
    db: AsyncSession
) -> list[GeneratedSchema]:
    result = await db.execute(
        select(GeneratedSchema)
        .options(selectinload(GeneratedSchema.clarifications))
        .where(GeneratedSchema.user_id == user_id)
        .order_by(GeneratedSchema.created_at.desc())
    )
    return result.scalars().all()`,
      paginationNote: 'selectinload is the async-safe equivalent of prefetch_related. Issues a second SELECT IN query — safe for the event loop. joinedload blocks the loop on collections — selectinload is the correct choice.',
      router: 'Alembic manages all migrations. alembic upgrade head applies. alembic downgrade -1 rolls back one step. Full history tracked — no ad-hoc ALTER TABLE statements.',
      docStyle: 'AsyncSession from sqlalchemy.ext.asyncio — all DB calls awaited. asyncpg as the async PostgreSQL driver. Connection pool created at startup, shared via app.state across all requests.',
      highlights: [
        { k: 'AsyncSession',   v: 'All DB operations are async — no thread blocking. Injected via Depends(get_db) — session scoped to request lifecycle, auto-closed on response.' },
        { k: 'begin() context', v: 'async with db.begin(): auto-commits on exit, rolls back on exception. Explicit transaction control per operation — no accidental partial writes.' },
        { k: 'selectinload',   v: 'Async-safe eager loading. Issues a second SELECT IN query — safe for event-loop, prevents N+1 without blocking the async context.' },
      ],
    },
  },

  'Async Pipelines': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    shared: {
      title: 'Async Pipeline Architecture',
      subtitle: 'Celery + Redis — decouple everything that waits',
      principles: [
        { label: 'Why Async',          text: 'If a task can fail independently, retry independently, or run on a different machine — it belongs in a queue. Never block a request cycle with heavy work.' },
        { label: 'Celery + Redis',     text: 'Celery workers consume tasks from Redis queue. Each task is independent — retryable, monitorable, scalable. Redis broker is the contract between web and worker.' },
        { label: 'Celery Beat',        text: 'Periodic task scheduler — cron without cron. PathWeaver uses Beat to trigger job scraping every 24 hours without any user action.' },
        { label: 'Retry Strategy',     text: 'Tasks declare max_retries and countdown. Transient failures (SMTP timeout, DB lock) retry automatically with exponential backoff.' },
        { label: 'Task Isolation',     text: 'Each task does one thing. No task chains that silently fail mid-chain. Failure in step 2 does not corrupt step 1 output.' },
        { label: 'Result Backends',    text: 'GazaBridge uses Redis DB 0 as both broker and result backend. Task results stored temporarily — not a permanent log.' },
      ],
    },
    django: {
      tag: 'Celery + Redis + Celery Beat',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# GazaBridge — async email task (Celery)
# forget_password/tasks.py

@shared_task(bind=True, max_retries=3)
def send_reset_email(self, user_id: int, token: str):
    try:
        user = User.objects.get(pk=user_id)
        reset_url = f"{FRONTEND_BASE_URL}/reset?token={token}"
        send_mail(
            subject="Password Reset — GazaBridge",
            message=render_to_string(
                "emails/reset_password.html",
                {"user": user, "url": reset_url}
            ),
            from_email=EMAIL_HOST_USER,
            recipient_list=[user.email],
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)`,
      errorNote: 'GazaBridge offloads all email to Celery — verification emails, password resets. bind=True exposes self for retry. countdown=30 waits 30s before retry. Request returns immediately — user never waits for SMTP.',
      paginationFormat: `# PathWeaver — Celery Beat scheduled pipeline
# celery.py / settings.py

CELERY_BEAT_SCHEDULE = {
    "scrape-jobs-daily": {
        "task":     "jobs.tasks.scrape_and_score",
        "schedule": crontab(hour=2, minute=0),  # 2 AM daily
    },
}

# jobs/tasks.py
@shared_task
def scrape_and_score():
    jobs = scrape_all_platforms()         # step 1: scrape
    for job in jobs:
        score_and_notify.delay(job.id)    # step 2: queue per-job scoring

@shared_task(bind=True, max_retries=3)
def score_and_notify(self, job_id: int):
    job    = Job.objects.get(pk=job_id)
    score  = run_ai_matcher(job)          # step 3: AI scoring
    if score >= 80:
        optimize_and_email.delay(job_id, score)  # step 4: only if match`,
      paginationNote: 'PathWeaver\'s full pipeline: scrape → queue individual jobs → AI score each → if score ≥ 80, optimize resume → send email. Every step is a separate Celery task — independently retryable, independently monitorable.',
      router: 'Celery workers run as separate processes, optionally separate machines. Scale workers independently from web workers. Redis DB 0 is the shared contract — broker and result backend.',
      docStyle: 'Three terminals in development: Django server · Redis server · Celery worker. Celery Beat runs as a fourth process for scheduled tasks. All four required for full PathWeaver pipeline.',
      highlights: [
        { k: 'Redis DB 0',      v: 'GazaBridge and PathWeaver both use Redis DB 0 as the Celery broker and result backend — isolated from cache (DB 1) and rate limiter (DB 2).' },
        { k: 'Celery Beat',     v: 'PathWeaver\'s scraping runs on schedule via Celery Beat — no cron, no manual trigger. 2 AM daily, fully automated, survives server restarts.' },
        { k: 'Task Queuing',    v: 'score_and_notify.delay(job_id) enqueues without waiting. Web request returns instantly. Worker picks up job from Redis and processes independently.' },
      ],
    },
    fastapi: {
      tag: 'FastAPI BackgroundTasks + ARQ',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# Datavo — background task after schema generation
@router.post("/schemas/generate", status_code=201)
async def generate_schema(
    data: SchemaRequest,
    background_tasks: BackgroundTasks,
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(get_current_user),
):
    schema = await run_ai_agent(data, db)      # AI generation (async)
    background_tasks.add_task(
        notify_and_cache, schema.id, user.id   # runs after response
    )
    return schema   # response returned immediately`,
      errorNote: 'BackgroundTasks runs after the response is sent — non-blocking. For Datavo, lightweight post-generation tasks (cache write, usage log) use this. For heavy tasks (batch AI jobs), use ARQ.',
      paginationFormat: `# ARQ — async-native task queue (FastAPI pattern)
# tasks.py
async def run_ai_batch(ctx, job_ids: list[int]):
    db = ctx["db"]
    for job_id in job_ids:
        job    = await db.get(Job, job_id)
        result = await ai_score(job)
        await db.execute(
            update(Job).where(Job.id == job_id)
            .values(score=result.score)
        )

# Enqueue from endpoint
await arq_pool.enqueue_job("run_ai_batch", job_ids)

# worker.py
class WorkerSettings:
    functions     = [run_ai_batch]
    redis_settings = RedisSettings(host="localhost", port=6379)`,
      paginationNote: 'ARQ is the async-native alternative to Celery for FastAPI. All task functions are async — no thread overhead. Redis-backed queue. Ideal for async-first architectures.',
      router: 'BackgroundTasks for lightweight post-response work. ARQ or Celery for heavy, retryable, scheduled jobs. FastAPI itself is not a task queue — it\'s the API layer.',
      docStyle: 'Async-first means the event loop is never blocked. All DB, Redis, and HTTP calls in tasks are awaited. asyncio.gather() for parallel task execution when order doesn\'t matter.',
      highlights: [
        { k: 'Non-blocking',    v: 'background_tasks.add_task() schedules work after the response. User gets result immediately. Notification, cache, logging all happen after the return.' },
        { k: 'ARQ vs Celery',   v: 'ARQ is async-native — all task functions use async/await. Celery with gevent works too but adds complexity. ARQ is the cleaner choice for async FastAPI stacks.' },
        { k: 'Event Loop',      v: 'Single event loop handles all requests concurrently. I/O operations yield to other requests while waiting. No threads needed for I/O concurrency.' },
      ],
    },
  },

  Performance: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    shared: {
      title: 'Performance Strategy',
      subtitle: 'Caching, pagination, connection pooling, and background offloading',
      principles: [
        { label: 'Redis Caching',      text: 'Read-heavy endpoints cached in Redis. Cache-aside pattern: read from cache, fallback to DB on miss, write to cache. TTL enforced per resource type.' },
        { label: '3-Partition Redis',  text: 'GazaBridge uses 3 isolated Redis partitions — DB 0 for Celery, DB 1 for API cache, DB 2 for rate limiting + JWT blacklist. Never a flat pool.' },
        { label: 'Pagination',         text: 'Unbounded queries are a P0 performance risk. All list endpoints paginated. Cursor-based pagination for real-time feeds.' },
        { label: 'DB Connection Pool', text: 'GazaBridge uses Supabase PgBouncer — connection pooler at port 6543. Prevents per-request DB handshakes under concurrent load.' },
        { label: 'Background Workers', text: 'Expensive operations (email, AI scoring, report generation) offloaded to Celery. Response returns immediately — user never waits.' },
        { label: 'Query Optimization', text: 'EXPLAIN ANALYZE on slow queries. Composite indexes for multi-field filters. select_related / prefetch_related on all list endpoints.' },
      ],
    },
    django: {
      tag: 'Redis 3-Partition + Gunicorn + Celery',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# GazaBridge — 3-partition Redis config
# settings.py

CACHES = {
    "default": {
        "BACKEND":  "django_redis.cache.RedisCache",
        "LOCATION": "redis://localhost:6379/1",   # DB 1 — API cache only
    }
}

CELERY_BROKER_URL    = "redis://localhost:6379/0"  # DB 0 — broker
CELERY_RESULT_BACKEND = "redis://localhost:6379/0" # DB 0 — results

RATE_LIMIT_REDIS = {
    "host": "localhost",
    "port": 6379,
    "db":   2,   # DB 2 — rate limiter + JWT blacklist
}`,
      errorNote: 'Three fully isolated Redis partitions. Flushing the rate limiter (DB 2) never corrupts cached responses (DB 1) or pending Celery tasks (DB 0). Critical for operational safety in GazaBridge.',
      paginationFormat: `# GazaBridge — cache-aside on paginated course list
from django.core.cache import cache

class CourseListView(ListAPIView):
    def list(self, request, *args, **kwargs):
        page    = request.query_params.get("page", 1)
        cache_key = f"courses:page:{page}"

        cached = cache.get(cache_key)
        if cached:
            return Response(cached)   # Redis DB 1 HIT

        qs   = self.get_queryset()
        data = self.get_serializer(qs, many=True).data
        cache.set(cache_key, data, timeout=120)  # 2-min TTL
        return Response(data)         # DB MISS → cache write`,
      paginationNote: 'Paginated course listings cached per page in Redis DB 1. TTL 120s — stale reads are acceptable for course discovery. Cache invalidated on course create/update via post_save signal.',
      router: 'Gunicorn with sync workers. CONN_MAX_AGE in settings reuses DB connections per worker. Celery handles all heavy lifting — web workers stay lean and fast.',
      docStyle: 'Django Debug Toolbar in dev shows query count, query time, and cache hits per request. Catches N+1 regressions immediately during development.',
      highlights: [
        { k: '3-Partition',     v: 'GazaBridge\'s Redis isolation principle: broker, cache, and rate limiter never share a database index. Operational safety and clear ownership per partition.' },
        { k: 'Celery Beat',     v: 'PathWeaver uses Celery Beat for cache warmup — pre-populates Redis before traffic hits. Prevents cold-cache latency spikes on schedule.' },
        { k: 'CONN_MAX_AGE',   v: 'Reuses DB connections per Gunicorn worker across requests. Reduces Supabase PgBouncer handshake overhead — especially important for short-lived requests.' },
      ],
    },
    fastapi: {
      tag: 'aioredis + asyncpg + Uvicorn',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# Datavo — async cache-aside
import aioredis, json

async def get_schema_list(
    user_id: int,
    redis:   Redis,
    db:      AsyncSession
) -> list[dict]:
    cache_key = f"schemas:user:{user_id}"
    cached    = await redis.get(cache_key)
    if cached:
        return json.loads(cached)          # Redis HIT — non-blocking

    schemas = await db.execute(
        select(GeneratedSchema)
        .where(GeneratedSchema.user_id == user_id)
        .order_by(GeneratedSchema.created_at.desc())
    )
    data = [s.dict() for s in schemas.scalars().all()]
    await redis.setex(cache_key, 120, json.dumps(data))
    return data                            # DB MISS → cache write`,
      errorNote: 'aioredis provides non-blocking Redis access — fully awaited. Never blocks the event loop. Redis injected as a FastAPI dependency — testable, swappable.',
      paginationFormat: `# Datavo — async connection pool at startup
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(
    DATABASE_URL,      # postgresql+asyncpg://...
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # detect stale connections
    echo=False,
)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session   # scoped to request, auto-closed`,
      paginationNote: 'asyncpg is the async PostgreSQL driver — dramatically faster than psycopg2 for concurrent workloads. pool_pre_ping=True detects and recycles stale connections automatically.',
      router: 'Uvicorn with Gunicorn as process manager. Uvicorn workers each run their own event loop. 4 Uvicorn workers handle far more concurrent requests than 4 Gunicorn sync workers under I/O load.',
      docStyle: 'Single event loop handles all requests concurrently. I/O operations yield to other requests while waiting. No per-request thread overhead — concurrency is free for I/O-bound workloads.',
      highlights: [
        { k: 'Event Loop',       v: 'Single event loop handles all concurrent requests. Awaiting DB or Redis yields control to the next request — thousands of concurrent connections with minimal memory.' },
        { k: 'asyncpg pool',     v: 'Created once at startup, shared across all requests via app.state. No per-request handshake. Pool recycled via pool_pre_ping — stale connections never returned to handlers.' },
        { k: 'aioredis',         v: 'All Redis operations fully async — get, set, setex all awaited. Never blocks the event loop. Critical for maintaining throughput on cache-heavy endpoints.' },
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
      subtitle: 'Horizontal scaling, isolated partitions, and service boundaries',
      principles: [
        { label: 'Stateless Design',    text: 'Stateless by design from row 1 — not bolted on later. JWT is stateless. No server-side sessions. Add more instances behind a load balancer without shared memory.' },
        { label: 'Horizontal Scaling',  text: 'Add more Gunicorn/Uvicorn workers behind Nginx or a cloud ALB. Sticky sessions not needed — JWT is stateless. Health checks on /api/health.' },
        { label: 'Partition Isolation', text: 'GazaBridge\'s 3-partition Redis design is a scalability primitive — each partition can move to its own Redis instance without changing application code.' },
        { label: 'DB Read Replicas',    text: 'Read-heavy endpoints routed to read replicas. Writes still go to primary. Replication lag acceptable for non-critical reads like course discovery.' },
        { label: 'Worker Scaling',      text: 'Celery workers scale independently from web workers. PathWeaver\'s AI scoring workers scale separately from the Django web tier — no coupling.' },
        { label: 'Monolith First',      text: 'Monolith first. Split when: a domain scales differently, a team owns it independently, or a failure in it should not cascade. Not premature.' },
      ],
    },
    django: {
      tag: 'Gunicorn + Celery Autoscale',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# Gunicorn config for GazaBridge
# gunicorn.conf.py

import multiprocessing

workers       = multiprocessing.cpu_count() * 2 + 1
worker_class  = "sync"
bind          = "0.0.0.0:8000"
timeout       = 30
keepalive     = 5
max_requests  = 1000   # recycle workers — prevent memory bloat
max_requests_jitter = 100

# Each worker is a full Python process
# max_requests recycles after N requests — slow memory leaks avoided`,
      errorNote: 'workers = 2×CPU+1 is the standard formula. max_requests recycles workers after N requests to prevent slow memory leaks. GazaBridge is deployed behind Nginx which handles SSL termination and static files.',
      paginationFormat: `# GazaBridge — Redis partition migration path
# Current: all 3 partitions on one Redis instance
# Scale path: move each to its own instance by changing one URL

CACHES["default"]["LOCATION"] = "redis://cache-server:6379/0"
CELERY_BROKER_URL              = "redis://broker-server:6379/0"
RATE_LIMIT_REDIS["host"]       = "ratelimit-server"

# Application code changes: zero
# Infrastructure change: three config values`,
      paginationNote: 'GazaBridge\'s partition design makes Redis scaling a config change — not a refactor. Each partition can move to a dedicated Redis instance independently. Zero application code changes.',
      router: 'Celery workers run as separate processes, optionally separate machines. Scale the AI scoring workers in PathWeaver independently from the web tier based on queue depth.',
      docStyle: 'Django monolith scales well to medium traffic. GazaBridge and PathWeaver are both designed as monoliths — split to microservices only when team size or scaling requirements genuinely demand it.',
      highlights: [
        { k: 'Worker Autoscale', v: 'Celery autoscale dynamically adjusts worker concurrency based on queue depth. PathWeaver\'s AI scoring workers scale up during peak job scraping and down otherwise.' },
        { k: 'Partition Path',   v: 'GazaBridge\'s 3-partition design is a scalability primitive — each partition migrates to its own Redis instance with a single config line change.' },
        { k: 'Nginx Layer',      v: 'Nginx handles SSL termination, static file serving, and upstream load balancing. Gunicorn workers stay focused on Python processing — no I/O multiplexing.' },
      ],
    },
    fastapi: {
      tag: 'Uvicorn Workers + Service-Ready',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# Dockerfile CMD — Datavo production
CMD [
  "gunicorn", "app.main:app",
  "--workers",      "4",
  "--worker-class", "uvicorn.workers.UvicornWorker",
  "--bind",         "0.0.0.0:8000",
  "--timeout",      "30",
  "--keepalive",    "5"
]
# 4 Uvicorn workers × async concurrency per worker
# = vastly more concurrent connections than 4 sync workers
# Each worker runs its own async event loop`,
      errorNote: 'Uvicorn workers replace Gunicorn sync workers. Each worker runs an async event loop. 4 Uvicorn workers handle far more concurrent I/O than 4 sync workers — Datavo\'s AI streaming responses benefit directly.',
      paginationFormat: `# FastAPI — graceful shutdown + health check
@app.on_event("startup")
async def startup():
    app.state.redis = await aioredis.create_redis_pool(REDIS_URL)
    app.state.db_pool = create_async_engine(DATABASE_URL, pool_size=10)

@app.on_event("shutdown")
async def shutdown():
    app.state.redis.close()
    await app.state.redis.wait_closed()
    await app.state.db_pool.dispose()

@app.get("/api/health")
async def health():
    return {"status": "ok"}   # load balancer probe endpoint`,
      paginationNote: 'Startup creates shared connection pools — Redis and DB — once for all workers. Graceful shutdown closes them cleanly. /api/health is the load balancer probe. FastAPI handles all of this natively.',
      router: 'FastAPI\'s async-first design makes it naturally suited for microservices. Each service can be a focused FastAPI app with its own DB, deployed independently with its own scaling policy.',
      docStyle: 'WebSocket support is first-class in FastAPI — @app.websocket() decorator. No additional library. Event loop handles WS connections alongside HTTP requests in the same process.',
      highlights: [
        { k: 'Service-Ready',   v: 'Stateless FastAPI services integrate naturally with Kubernetes or AWS ECS. Health endpoints, graceful shutdown, and async pools — all production primitives built in.' },
        { k: 'Event-Driven',    v: 'Async architecture makes event-driven patterns natural. Publish to Redis Streams from async endpoints — no blocking, no thread overhead.' },
        { k: 'Pool Sharing',    v: 'DB and Redis pools created once at startup via app.state — shared across all requests. No per-request connection overhead even under high concurrency.' },
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
        { label: 'Django sweet spot',         text: 'Rapid development, admin-heavy apps, async pipeline systems, teams that want convention over configuration. GazaBridge, PathWeaver, SMS — all Django.' },
        { label: 'FastAPI sweet spot',         text: 'High-concurrency APIs, microservices, AI model serving, streaming responses. Teams comfortable with async Python and explicit architecture.' },
        { label: 'Async matters for I/O',     text: 'If endpoints mostly wait for DB/Redis/HTTP — async wins. If CPU-bound — async gives no benefit. Django with Celery handles most async needs without switching frameworks.' },
        { label: 'Team velocity',             text: 'Django\'s admin, ORM, auth, and DRF can be 2–3× faster to ship initially. FastAPI requires more explicit wiring — right for experienced teams.' },
        { label: 'Real world',                text: 'This portfolio is Django-first. GazaBridge, PathWeaver, and School Management System all use Django — chosen because of its strength in production SaaS and async pipeline systems.' },
      ],
    },
    django: {
      tag: 'Django — Active Mode',
      tagColor: 'text-green-400 border-green-800 bg-green-950/30',
      errorFormat: `# Django advantages — why GazaBridge, PathWeaver, SMS use it
✅ Built-in Admin (zero-cost back-office)
✅ ORM migrations — makemigrations / migrate
✅ DRF — serializers, viewsets, permissions
✅ SimpleJWT — auth in one package
✅ Celery + Beat — async pipelines without framework switch
✅ Session, CSRF, security headers by default
✅ Large ecosystem — packages for everything
✅ Strong conventions — less architectural debate`,
      errorNote: 'GazaBridge demonstrates Django\'s production ceiling: JWT auth with Redis blacklisting, 3-partition Redis, Celery async pipeline, custom rate-limiting middleware, Google OAuth2, Supabase PostgreSQL.',
      paginationFormat: `# Django tradeoffs
⚠  Sync-first — async requires explicit async def views
⚠  Heavier memory per worker vs Uvicorn
⚠  DRF boilerplate grows with complex nested APIs
⚠  Less performant at extreme concurrency vs async FastAPI
⚠  OpenAPI spec requires drf-spectacular add-on
⚠  Pydantic-style validation needs extra setup`,
      paginationNote: 'Not weaknesses — tradeoffs. Django\'s sync model is perfectly adequate for most use cases under 10k rpm with proper caching, Celery for async, and Redis for performance.',
      router: 'Choose Django when: building SaaS platforms, admin-heavy systems, async pipeline apps (Celery + Beat), or shipping fast with a small team. This portfolio is the proof.',
      docStyle: 'GazaBridge, PathWeaver, and School Management System all demonstrate Django at production scale — each with different architectural patterns: API platform, automation pipeline, multi-tenant SaaS.',
      highlights: [
        { k: 'Admin',          v: 'Django Admin generates CRUD UI from models automatically. GazaBridge\'s admin_app module uses it for volunteer management without a single custom UI component.' },
        { k: 'Signals',        v: 'post_save signals for decoupled side effects — cache invalidation on course update, enrollment notification on create. Dangerous if overused, powerful when scoped.' },
        { k: 'Management Cmds', v: 'python manage.py custom_command for one-off scripts, data migrations, seed scripts. Combined with Celery Beat for scheduled automation in PathWeaver.' },
      ],
    },
    fastapi: {
      tag: 'FastAPI — Active Mode',
      tagColor: 'text-blue-400 border-blue-800 bg-blue-950/30',
      errorFormat: `# FastAPI advantages — why Datavo uses it
✅ Async-first — native event loop concurrency
✅ Automatic OpenAPI / Swagger UI at /docs
✅ Pydantic validation — type-safe, explicit
✅ Dependency injection — clean, testable
✅ Streaming responses — ideal for AI token streams
✅ First-class WebSocket support
✅ Lightweight — only what you need
✅ Python type hints enforced throughout`,
      errorNote: 'Datavo uses FastAPI for AI schema generation — streaming responses, Pydantic output validation, and async OpenAI SDK calls all align naturally with FastAPI\'s async-first design.',
      paginationFormat: `# FastAPI tradeoffs
⚠  No built-in Admin — must build or use SQLAdmin
⚠  No built-in auth — must implement or use fastapi-users
⚠  Async bugs harder to debug than sync Django
⚠  Smaller ecosystem than Django for add-ons
⚠  Alembic migrations less ergonomic than Django ORM
⚠  More upfront architectural decisions required`,
      paginationNote: 'FastAPI requires assembling your own stack. More flexible, but more decisions. Right for experienced teams, trickier for greenfield solo projects with tight deadlines.',
      router: 'Choose FastAPI when: building high-throughput APIs, AI streaming endpoints, microservices, ML model serving, or when the team values explicit type safety over convention.',
      docStyle: 'Datavo demonstrates FastAPI\'s strength — the AI clarification loop, streaming schema output, and Pydantic response validation all leverage what FastAPI does best.',
      highlights: [
        { k: 'Streaming',      v: 'StreamingResponse for AI token streams. Datavo uses this to stream schema generation output in real-time — tokens appear as they\'re generated. Not possible in sync Django without heavy workarounds.' },
        { k: '/docs auto-gen', v: 'Zero-config Swagger UI. Pydantic models auto-generate JSON Schema. API documentation is always in sync with code — no manual OpenAPI YAML.' },
        { k: 'Testability',    v: 'Dependencies are injectable — override get_db or get_current_user in tests with mocks. No monkey-patching, no global state. Test isolation by design.' },
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
  const sec    = content[sectionKey]
  const fm     = sec[mode]
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
            {fm.highlights.map((h) => (
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

      {/* Framework comparison strip — Framework Comparison section only */}
      {sectionKey === 'Framework Comparison' && (
        <AnimatedSection delay={240}>
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-800">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-emerald-400">Choose Django when...</span>
                </div>
                {['SaaS / CRUD heavy', 'Async pipelines (Celery)', 'Admin panel needed', 'Fast initial shipping', 'Built-in auth/perms', 'Convention over config'].map(t => (
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
                {['High concurrency I/O', 'AI streaming responses', 'Microservices', 'ML model serving', 'Type safety critical', 'Async-first team'].map(t => (
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

  useEffect(() => {
    setActiveSection('API Design')
  }, [mode])

  return (
    <div className="page-enter min-h-screen">

      {/* ── Page Header ───────────────────────────────────── */}
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
                Engineering decisions from real projects — adapted to{' '}
                <span className={mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}>
                  {mode === 'django' ? 'Django' : 'FastAPI'}
                </span>{' '}
                mode
              </p>
            </div>

            <div className="flex items-center gap-3">
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
          <SectionNav active={activeSection} onChange={setActiveSection} mode={mode} />
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
                Architecture decisions from real production systems — GazaBridge, PathWeaver, Datavo, SMS.
              </p>
              <p className="text-xs font-mono text-gray-700 mt-0.5">
                Every code example is adapted from an actual project implementation.
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