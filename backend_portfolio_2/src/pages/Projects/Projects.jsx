import { useState, useRef, useEffect } from 'react'
import { useFramework } from '../../context/FrameworkContext'

// ─────────────────────────────────────────────────────────────
// PROJECT DATA
// ─────────────────────────────────────────────────────────────

const PROJECTS = [
  // ── Django ────────────────────────────────────────────────
  {
    id: 1,
    title: 'GazaBridge — Humanitarian Volunteer Platform',
    frameworks: ['django'],
    tags: ['Django', 'DRF', 'Channels', 'OAuth2', 'Celery'],
    tagIcons: {
      Django:    { color: 'text-green-400 border-green-800 bg-green-950/30' },
      DRF:       { color: 'text-emerald-400 border-emerald-800 bg-emerald-950/30' },
      Channels:  { color: 'text-cyan-400 border-cyan-800 bg-cyan-950/30' },
      OAuth2:    { color: 'text-red-400 border-red-800 bg-red-950/30' },
      Celery:    { color: 'text-orange-400 border-orange-800 bg-orange-950/30' },
    },
    status: 'completed',
    type: 'Humanitarian API',
    image: '/images/gazabridge.webp',
    description:
      'A humanitarian Django REST Framework API connecting Palestinian individuals with global volunteers offering mentorship, courses, live sessions, real-time chat, and curated resources. Built with production-grade infrastructure — Google OAuth, a custom JWT blacklist/rotation scheme, WebSocket chat via Django Channels, Celery async tasks, and a custom rate-limiting middleware.',
    highlights: [
      'Real-time WebSocket chat (group + 1:1) via Django Channels + channels_redis',
      'Google OAuth2 login alongside custom JWT auth with manual Redis-based refresh-token rotation',
      'Custom sliding-window rate limiter with trusted-proxy IP handling — 100 req/min (auth), 20 (anon)',
      'drf-spectacular OpenAPI docs; Celery async tasks for email verification & password reset',
    ],
    architecture: [
      { k: 'Framework', v: 'Django REST Framework + drf-spectacular' },
      { k: 'Auth',      v: 'SimpleJWT (custom blacklist/rotation) + Google OAuth2' },
      { k: 'Realtime',  v: 'Django Channels + Redis (WebSocket chat)' },
      { k: 'Tasks',     v: 'Celery + Redis broker & result backend' },
      { k: 'DB',        v: 'PostgreSQL via Supabase connection pooler' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/GazaBridge',
    linkedin: null,
  },
  {
    id: 2,
    title: 'School Management System',
    frameworks: ['django'],
    tags: ['Django', 'SaaS', 'Multi-Branch', 'RBAC', 'PostgreSQL'],
    tagIcons: {
      Django:         { color: 'text-green-400 border-green-800 bg-green-950/30' },
      SaaS:           { color: 'text-purple-400 border-purple-800 bg-purple-950/30' },
      'Multi-Branch': { color: 'text-blue-400 border-blue-800 bg-blue-950/30' },
      RBAC:           { color: 'text-yellow-400 border-yellow-800 bg-yellow-950/30' },
      PostgreSQL:     { color: 'text-indigo-400 border-indigo-800 bg-indigo-950/30' },
    },
    status: 'completed',
    type: 'SaaS Platform',
    image: '/images/School Management System.webp',
    description:
      'A fully functional SaaS-based School Management System designed to manage multi-branch institutions under a single platform. Focuses heavily on financial intelligence, institutional workflows, and structured role management — suitable for real-world deployment.',
    highlights: [
      'Multi-branch architecture under single SaaS tenant',
      'Role-based access control — Admin, Teacher, Student, Parent',
      'Financial module: fee tracking, invoicing, payment status',
      'Institutional workflows: attendance, timetable, grades',
    ],
    architecture: [
      { k: 'Pattern',    v: 'Django MVT with service layer' },
      { k: 'Auth',       v: 'Custom RBAC via Django Groups & Permissions' },
      { k: 'DB',         v: 'PostgreSQL with normalized 3NF schema' },
      { k: 'Deployment', v: 'Gunicorn + Nginx' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/SMS',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-this-one-activity-7430745190128046080-sDeg',
  },
  {
    id: 3,
    title: 'PathWeaver — AI Job Assistant',
    frameworks: ['django'],
    tags: ['Django', 'DRF', 'Celery Beat', 'AI Agents', 'PostgreSQL'],
    tagIcons: {
      Django:         { color: 'text-green-400 border-green-800 bg-green-950/30' },
      DRF:            { color: 'text-emerald-400 border-emerald-800 bg-emerald-950/30' },
      'Celery Beat':  { color: 'text-orange-400 border-orange-800 bg-orange-950/30' },
      'AI Agents':    { color: 'text-pink-400 border-pink-800 bg-pink-950/30' },
      PostgreSQL:     { color: 'text-indigo-400 border-indigo-800 bg-indigo-950/30' },
    },
    status: 'completed',
    type: 'AI Automation System',
    image: '/images/pathweaver.webp',
    description:
      'An AI-powered job assistant that automates the entire job search pipeline — scraping listings, parsing your resume, scoring compatibility, optimizing your CV per job, and sending email notifications. Not just endpoints: a fully orchestrated async system built around Celery, Redis, and scheduled task automation.',
    highlights: [
      'Scrapes jobs from multiple platforms, filtered by your preferences',
      'AI reads resume, calculates match score, auto-optimizes if score > 80',
      'Celery Beat schedules scraping every 24 hrs — runs without user input',
      'Email notifications with matched job + tailored resume attached',
    ],
    architecture: [
      { k: 'Backend',   v: 'Django REST Framework + React frontend' },
      { k: 'Tasks',     v: 'Celery workers + Celery Beat scheduler' },
      { k: 'Broker',    v: 'Redis as message broker & result backend' },
      { k: 'AI Layer',  v: 'AI models for resume parsing & job matching' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/PathWeaver',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%97%94%F0%9D%98%80%F0%9D%98%80%F0%9D%97%AE%F0%9D%97%B9%F0%9D%97%AE%F0%9D%97%BA%F0%9D%98%82%F0%9D%97%AE%F0%9D%97%B9%F0%9D%97%AE%F0%9D%97%B6%F0%9D%97%B8%F0%9D%98%82%F0%9D%97%BA-this-is-activity-7440292374653612032-L8GZ',
  },
  {
    id: 4,
    title: 'UzairMart — Django eCommerce',
    frameworks: ['django'],
    tags: ['Django', 'Authentication', 'Cart Logic', 'Email Verification', 'PostgreSQL'],
    tagIcons: {
      Django:               { color: 'text-green-400 border-green-800 bg-green-950/30' },
      Authentication:       { color: 'text-yellow-400 border-yellow-800 bg-yellow-950/30' },
      'Cart Logic':         { color: 'text-red-400 border-red-800 bg-red-950/30' },
      'Email Verification': { color: 'text-blue-400 border-blue-800 bg-blue-950/30' },
      PostgreSQL:           { color: 'text-indigo-400 border-indigo-800 bg-indigo-950/30' },
    },
    status: 'completed',
    type: 'eCommerce App',
    image: '/images/UzairMart.webp',
    description:
      'A Django-based eCommerce web application simulating a real-world online store. Focused heavily on backend logic, user authentication security, and real-world cart handling complexity — including multi-item cart, email verification, and secure password reset.',
    highlights: [
      'Email verification on registration — token-based',
      'Secure password reset via time-limited signed URLs',
      'Multi-item cart with quantity management',
      'Session-based cart for guests, DB-persisted for users',
    ],
    architecture: [
      { k: 'Auth',     v: 'Custom Django auth + email verification' },
      { k: 'Cart',     v: 'Session cart (guest) + DB cart (user)' },
      { k: 'Email',    v: 'Django send_mail + HTML templates' },
      { k: 'Security', v: 'CSRF, signed tokens, bcrypt passwords' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/uzairmart',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-another-activity-7420964103248039936-AHLP',
  },
  {
    id: 7,
    title: 'AlphaPK — Wholesale Inventory & Accounting System',
    frameworks: ['django'],
    tags: ['Django', 'DRF', 'FIFO Ledger', 'WeasyPrint', 'PostgreSQL'],
    tagIcons: {
      Django:        { color: 'text-green-400 border-green-800 bg-green-950/30' },
      DRF:           { color: 'text-emerald-400 border-emerald-800 bg-emerald-950/30' },
      'FIFO Ledger': { color: 'text-pink-400 border-pink-800 bg-pink-950/30' },
      WeasyPrint:    { color: 'text-yellow-400 border-yellow-800 bg-yellow-950/30' },
      PostgreSQL:    { color: 'text-indigo-400 border-indigo-800 bg-indigo-950/30' },
    },
    status: 'completed',
    type: 'Wholesale/Inventory Backend',
    image: '/images/alphapk.webp',
    description:
      'A backend for a wholesale/retail distribution and accounting system — inventory, purchasing, invoicing, payments, returns, cash flow, and financial ledger reporting. Built with a disciplined selectors/services layer per app rather than fat DRF views, and a FIFO ledger that tracks real inventory costing across purchases and returns.',
    highlights: [
      'FIFO ledger for real inventory costing across purchases/returns',
      'Layered selectors/services architecture per app, not fat views',
      'Custom email-as-primary-key user model with role-derived permissions',
      'WeasyPrint-generated PDF invoices, JazzCash/Easypaisa payment methods',
    ],
    architecture: [
      { k: 'Backend', v: 'Django REST Framework, selectors/services layers' },
      { k: 'Costing', v: 'FIFO ledger tracks purchase-batch consumption' },
      { k: 'Auth',    v: 'Custom User model (email PK) + SimpleJWT' },
      { k: 'PDF',     v: 'WeasyPrint invoice generation' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/AlphaPK',
    linkedin: null,
  },
  // ── FastAPI ───────────────────────────────────────────────
  {
    id: 5,
    title: 'Datavo — AI Database Schema Architect',
    frameworks: ['fastapi'],
    tags: ['FastAPI', 'React', 'OpenAI SDK', 'AI Agents', 'PostgreSQL'],
    tagIcons: {
      FastAPI:      { color: 'text-blue-400 border-blue-800 bg-blue-950/30' },
      React:        { color: 'text-cyan-400 border-cyan-800 bg-cyan-950/30' },
      'OpenAI SDK': { color: 'text-purple-400 border-purple-800 bg-purple-950/30' },
      'AI Agents':  { color: 'text-pink-400 border-pink-800 bg-pink-950/30' },
      PostgreSQL:   { color: 'text-indigo-400 border-indigo-800 bg-indigo-950/30' },
    },
    status: 'completed',
    type: 'AI Tool',
    image: '/images/Datavo.webp',
    description:
      'An AI-powered system that generates clean, structured database schemas — but only after refining requirements through structured clarification. Unlike generic LLM schema generators, Datavo asks questions, avoids assumptions, and produces structured output.',
    highlights: [
      'Multi-turn AI agent with structured clarification flow',
      'Avoids blind assumptions — refines before generating',
      'Produces schema with relationships, indexes, constraints',
      'Built from real failures while designing the SMS project',
    ],
    architecture: [
      { k: 'Backend',  v: 'FastAPI with async endpoints' },
      { k: 'AI Layer', v: 'OpenAI SDK — GPT-4o agent loop' },
      { k: 'Frontend', v: 'React with streaming response UI' },
      { k: 'Pattern',  v: 'Async task queue for AI jobs' },
    ],
    github: 'https://github.com/Uzair-Waseem-390/Datavo',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-some-projects-activity-7433219597077700608-KByW',
  },
  {
    id: 6,
    title: 'BusinessPulse — AI Decision Support',
    frameworks: ['fastapi'],
    tags: ['Next.js', 'JavaScript', 'AI', 'Data-Driven', 'SaaS'],
    tagIcons: {
      'Next.js':     { color: 'text-white border-gray-600 bg-gray-800/50' },
      JavaScript:    { color: 'text-yellow-400 border-yellow-800 bg-yellow-950/30' },
      AI:            { color: 'text-purple-400 border-purple-800 bg-purple-950/30' },
      'Data-Driven': { color: 'text-blue-400 border-blue-800 bg-blue-950/30' },
      SaaS:          { color: 'text-pink-400 border-pink-800 bg-pink-950/30' },
    },
    status: 'completed',
    type: 'AI SaaS Tool',
    image: '/images/BusinessPulse.webp',
    description:
      'A SaaS-based AI decision support system for low-budget startups and small business owners. Focuses on structured business data, scenario-based decision testing, and actionable insights — built with a marketing-first mindset, not hype-driven AI features.',
    highlights: [
      'Scenario-based decision testing — model business situations',
      'Pattern & trend identification from business data',
      'Structured input — not a raw chat interface',
      'Designed for non-technical founders and operators',
    ],
    architecture: [
      { k: 'Frontend', v: 'Next.js with server-side rendering' },
      { k: 'AI Layer', v: 'Structured prompting — data-in, insight-out' },
      { k: 'Pattern',  v: 'Marketing-first product design' },
      { k: 'Target',   v: 'SMB founders with no technical background' },
    ],
    github: null,
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-today-activity-7408600825926742016-G7oU',
  },
]

// ─────────────────────────────────────────────────────────────
// TECH ICONS (SVG)
// ─────────────────────────────────────────────────────────────

const TechIcon = ({ tag }) => {
  const icons = {
    Django: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M11.146 0h3.924v18.166c-2.013.382-3.491.535-5.096.535-4.791 0-7.288-2.166-7.288-6.32 0-4.002 2.65-6.6 6.753-6.6.637 0 1.121.05 1.707.203zm0 9.143a3.894 3.894 0 0 0-1.325-.204c-1.988 0-3.134 1.223-3.134 3.365 0 2.09 1.096 3.236 3.109 3.236.433 0 .79-.025 1.35-.102zM21.314 6.06v11.874c0 4.105-.306 6.07-1.198 7.768-.84 1.645-1.945 2.691-4.231 3.84l-3.644-1.732c2.287-1.07 3.392-2.04 4.105-3.506.739-1.494.968-3.2.968-7.59V6.06z"/>
      </svg>
    ),
    DRF: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M11.146 0h3.924v18.166c-2.013.382-3.491.535-5.096.535-4.791 0-7.288-2.166-7.288-6.32 0-4.002 2.65-6.6 6.753-6.6.637 0 1.121.05 1.707.203zm0 9.143a3.894 3.894 0 0 0-1.325-.204c-1.988 0-3.134 1.223-3.134 3.365 0 2.09 1.096 3.236 3.109 3.236.433 0 .79-.025 1.35-.102zM21.314 6.06v11.874c0 4.105-.306 6.07-1.198 7.768-.84 1.645-1.945 2.691-4.231 3.84l-3.644-1.732c2.287-1.07 3.392-2.04 4.105-3.506.739-1.494.968-3.2.968-7.59V6.06z"/>
      </svg>
    ),
    FastAPI: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 0C5.375 0 0 5.375 0 12c0 6.627 5.375 12 12 12 6.626 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-.624 21.62v-7.528H7.19L13.203 2.38v7.528h4.029L11.376 21.62z"/>
      </svg>
    ),
    React: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.292zM5.131 6.67c1.018 0 2.511.81 4.104 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.973-.254-1.43-.23-1.868.054-3.32.714-3.7.147-.085.328-.127.57-.127zm4.52 1.02c.67.795 1.335 1.67 1.966 2.61.66-.06 1.33-.093 2.005-.093.672 0 1.345.03 2.006.092.63-.94 1.3-1.82 1.966-2.614C15.67 6.19 13.802 5.9 12 5.9c-1.8 0-3.67.29-5.35.79zm9.505 2.87c-.96-.236-2.007-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.292.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44z"/>
      </svg>
    ),
    'Next.js': (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/>
      </svg>
    ),
    Redis: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75zm2.03 5.47a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-.97.97.97.97a.75.75 0 0 1-1.06 1.06l-.97-.97-.97.97a.75.75 0 1 1-1.06-1.06l.97-.97-.97-.97a.75.75 0 0 1 0-1.06z"/>
      </svg>
    ),
    'JWT + Redis': (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z"/>
      </svg>
    ),
    Celery: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    'AI Agents': (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/>
      </svg>
    ),
    'OpenAI SDK': (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.073 14.08a4.501 4.501 0 0 1-1.734-6.184zm16.597 3.855l-5.843-3.368 2.019-1.164a.076.076 0 0 1 .072 0l4.743 2.739a4.5 4.5 0 0 1-.696 8.121V11.43a.804.804 0 0 0-.295-.679zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.74-2.736a4.5 4.5 0 0 1 6.69 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.603 1.496v2.999l-2.597 1.5-2.603-1.494z"/>
      </svg>
    ),
    PostgreSQL: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M17.128 0a10.134 10.134 0 0 0-2.755.403 9.732 9.732 0 0 0-.664.23c-.11-.03-.218-.054-.33-.08C11.87.148 10.228.152 8.688.8 4.744 2.413 2.828 6.226 3.11 9.82a6.07 6.07 0 0 0 .114.84c.04.2.087.396.146.57.087.257.257.463.408.656.1.13.282.378.384.37.108-.01.19-.283.258-.512.08-.26.155-.525.208-.794.017-.082.035-.165.043-.248.016-.217.019-.35.031-.523.012-.168.018-.22.019-.275.018-.284.024-.363.026-.44.005-.162.006-.27.012-.39.006-.12.02-.247.046-.388.046-.245.13-.495.196-.742.065-.243.12-.487.163-.733.045-.256.088-.512.16-.765.08-.275.19-.537.268-.81.041-.144.056-.293.027-.44a.6.6 0 0 0-.057-.167c-.022-.043-.038-.088-.055-.13-.058-.15-.143-.3-.177-.46.003.003-.023-.004.004.038.023.036.05.072.076.108.06.082.116.168.158.267a1.122 1.122 0 0 1 .083.325c.013.155-.014.32.027.471.04.144.12.27.174.41.053.137.087.285.1.43a3.69 3.69 0 0 1-.02.6c-.025.205-.07.41-.102.615-.033.208-.075.415-.108.624-.033.21-.064.42-.08.634-.017.23-.016.46.007.69a3.7 3.7 0 0 0 .086.576c.04.165.093.323.13.493.025.114.035.233.014.348-.018.104-.06.196-.103.287-.047.1-.09.202-.133.305a3.94 3.94 0 0 0-.197.756 2.58 2.58 0 0 0-.025.576 1.97 1.97 0 0 0 .086.517c.042.127.1.25.124.38.025.14.023.29.003.434-.018.13-.05.257-.085.387-.034.13-.073.26-.113.392-.052.172-.107.348-.18.512-.072.163-.164.316-.231.483a3.87 3.87 0 0 0-.207.795 3.58 3.58 0 0 0-.013.872c.033.3.1.584.14.878.038.278.064.57.006.85-.058.285-.198.535-.31.802a4.1 4.1 0 0 0-.226.79c-.04.218-.045.44-.047.661-.002.167.008.333.016.5.003.06.008.12.012.18-.088-.04-.173-.087-.257-.138-.12-.072-.237-.15-.356-.225a9.8 9.8 0 0 1-1.498-1.13 9.49 9.49 0 0 1-1.99-2.8A9.49 9.49 0 0 1 .25 9.79C.077 6.03 2.007 2.313 5.532.917 7.08.3 8.707.127 10.397.383c.27.042.536.098.795.17a9.84 9.84 0 0 1 2.28 1.018 9.7 9.7 0 0 1 1.71 1.414 9.587 9.587 0 0 1 1.2 1.728 9.61 9.61 0 0 1 .787 2.145 9.7 9.7 0 0 1 .208 2.24 9.5 9.5 0 0 1-.378 2.255 9.42 9.42 0 0 1-.908 2.097 9.51 9.51 0 0 1-1.393 1.778 9.57 9.57 0 0 1-1.794 1.396 9.49 9.49 0 0 1-2.066.878 9.6 9.6 0 0 1-2.247.3h-.193a9.47 9.47 0 0 1-2.217-.311c-.12.362-.22.732-.31 1.107l-.048.208c-.022.1-.04.2-.057.3a9.55 9.55 0 0 1-.243.907 9.5 9.5 0 0 1-.394.946c-.08.171-.167.34-.263.506h.024a10.01 10.01 0 0 0 2.588.616 10.13 10.13 0 0 0 2.824-.117 9.96 9.96 0 0 0 2.63-.916 10.11 10.11 0 0 0 2.187-1.617 10.06 10.06 0 0 0 1.56-2.2 9.85 9.85 0 0 0 .844-2.548 9.99 9.99 0 0 0 .074-2.694A9.88 9.88 0 0 0 17.7 7.4a9.92 9.92 0 0 0-1.39-2.193A10.08 10.08 0 0 0 14.2 3.6a10.07 10.07 0 0 0-2.367-1.17A10.02 10.02 0 0 0 9.313.966 10.14 10.14 0 0 0 6.716.99a9.89 9.89 0 0 0-2.55.755 9.82 9.82 0 0 0-2.2 1.4C.84 4.11.085 5.23-.295 6.47A10.16 10.16 0 0 0-.5 9.34a10.04 10.04 0 0 0 .52 2.86 10.06 10.06 0 0 0 1.336 2.6 10.14 10.14 0 0 0 2.026 2.15 10.04 10.04 0 0 0 2.56 1.44 9.87 9.87 0 0 0 2.86.56c.235.013.47.018.705.018.44 0 .878-.026 1.312-.084a10.15 10.15 0 0 0 2.695-.8 10.1 10.1 0 0 0 2.258-1.517 10.16 10.16 0 0 0 1.685-2.124 10.07 10.07 0 0 0 .977-2.614 10.09 10.09 0 0 0 .146-2.836 10.01 10.01 0 0 0-.628-2.737 10.06 10.06 0 0 0-1.345-2.44A10.12 10.12 0 0 0 15.7 2.67a10.07 10.07 0 0 0-2.424-1.217A10.03 10.03 0 0 0 10.6.89a10.14 10.14 0 0 0-2.827.317 10.08 10.08 0 0 0-2.578 1.1 9.98 9.98 0 0 0-2.1 1.852A9.9 9.9 0 0 0 1.63 6.69a9.9 9.9 0 0 0-.508 2.79 9.9 9.9 0 0 0 .415 2.826 9.87 9.87 0 0 0 1.275 2.566 9.95 9.95 0 0 0 1.995 2.08 9.97 9.97 0 0 0 2.587 1.364 9.88 9.88 0 0 0 2.91.497"/>
      </svg>
    ),
  }
  const icon = icons[tag]
  if (!icon) return null
  return icon
}

// ─────────────────────────────────────────────────────────────
// ANIMATED ENTRY
// ─────────────────────────────────────────────────────────────

function useInView(ref, threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

// ─────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────

function ProjectCard({ project, index, mode }) {
  const ref = useRef(null)
  const visible = useInView(ref, 0.08)
  const isEven = index % 2 === 0

  const accentColor = mode === 'django' ? 'text-emerald-400' : 'text-blue-400'
  const accentBorder = mode === 'django' ? 'border-emerald-700' : 'border-blue-700'
  const accentBg = mode === 'django' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${index * 80}ms` }}
      className={visible ? (isEven ? 'animate-slide-left' : 'animate-slide-right') : 'opacity-0'}
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-800 rounded-2xl overflow-hidden bg-gray-900/30 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40`}>

        {/* Image side — alternates */}
        <div className={`relative overflow-hidden bg-gray-900 min-h-[220px] sm:min-h-[280px] ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          {/* Fallback */}
          <div className="w-full h-full absolute inset-0 items-center justify-center bg-gray-900/80 text-gray-700 font-mono text-xs hidden flex-col gap-2">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{project.title}</span>
          </div>
          {/* Type badge overlay */}
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-mono px-2 py-1 rounded-lg border backdrop-blur-sm bg-gray-950/70 ${accentColor} ${accentBorder}`}>
              {project.type}
            </span>
          </div>
        </div>

        {/* Content side */}
        <div className={`flex flex-col p-6 lg:p-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-lg font-mono font-bold text-white leading-tight">{project.title}</h2>
              <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'} glow-dot`} />
            </div>
            <p className="text-xs font-mono text-gray-500 leading-relaxed">{project.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.map(tag => (
              <span key={tag} className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md border ${project.tagIcons[tag]?.color || 'text-gray-400 border-gray-700'}`}>
                <TechIcon tag={tag} />
                {tag}
              </span>
            ))}
          </div>

          {/* Highlights */}
          <div className="mb-5">
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">Highlights</p>
            <ul className="space-y-1.5">
              {project.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-mono text-gray-400">
                  <span className={`mt-0.5 shrink-0 ${accentColor}`}>▸</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture table */}
          <div className="border border-gray-800 rounded-xl overflow-hidden mb-5">
            {project.architecture.map((row, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 text-xs font-mono ${i < project.architecture.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <span className="text-gray-600 shrink-0 w-20">{row.k}:</span>
                <span className="text-gray-300">{row.v}</span>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className={`btn-primary flex items-center gap-1.5 text-xs font-mono px-3 py-2 ${accentBg} text-white rounded-lg`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </a>
            )}
            {project.linkedin && (
              <a
                href={project.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn-outline flex items-center gap-1.5 text-xs font-mono px-3 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn Post
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function Projects({ onNavigate }) {
  const { mode } = useFramework()

  const filtered = PROJECTS.filter(p => p.frameworks.includes(mode))
  const all = PROJECTS

  const [showAll, setShowAll] = useState(false)
  const displayedProjects = showAll ? all : filtered

  const accentColor = mode === 'django' ? 'text-emerald-400' : 'text-blue-400'
  const accentBg = mode === 'django' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
  const accentBadge = mode === 'django' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'

  return (
    <div className="page-enter min-h-screen">

      {/* ── Page Header (static, not sticky) ───────────────── */}
      <div className="border-b border-gray-800 bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <button onClick={() => onNavigate('home')} className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
                  ← Home
                </button>
                <span className="text-gray-700">/</span>
                <span className="text-xs font-mono text-gray-400">Projects</span>
              </div>
              <h1 className="text-xl font-mono font-bold text-white">Projects</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${accentBadge}`}>
                {showAll ? `All ${all.length} Projects` : `${filtered.length} ${mode === 'django' ? 'Django' : 'FastAPI'} Projects`}
              </span>
              {showAll && (
                <button
                  onClick={() => setShowAll(false)}
                  className="text-xs font-mono text-gray-500 hover:text-white transition-colors border border-gray-800 px-2.5 py-1 rounded-lg"
                >
                  Filter by mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Intro */}
        <div className="mb-10 animate-fade-up">
          <p className="text-sm font-mono text-gray-500 max-w-2xl">
            {showAll
              ? 'All projects — spanning Django, FastAPI, Next.js, and OpenAI SDK. Toggle the framework mode to filter.'
              : mode === 'django'
              ? 'Projects built with Django — demonstrating backend architecture, authentication systems, and real-world SaaS design.'
              : 'Projects built with FastAPI — demonstrating async API design, AI agent systems, and modern Python backend patterns.'
            }
          </p>
        </div>

        {/* Mode banner (when filtered) */}
        {!showAll && (
          <div className={`mb-8 flex items-center gap-3 px-4 py-3 border rounded-xl animate-fade-up delay-100 ${
            mode === 'django' ? 'border-emerald-900 bg-emerald-950/20' : 'border-blue-900 bg-blue-950/20'
          }`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'} glow-dot`} />
            <p className="text-xs font-mono text-gray-400">
              Showing <span className={`font-semibold ${accentColor}`}>{mode === 'django' ? 'Django' : 'FastAPI'}</span> projects.{' '}
              Toggle the framework mode in the header, or click{' '}
              <button onClick={() => setShowAll(true)} className={`underline underline-offset-2 ${accentColor}`}>View All Projects</button>
              {' '}to see everything.
            </p>
          </div>
        )}

        {/* Project cards */}
        <div className="space-y-10">
          {displayedProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} mode={showAll ? (project.frameworks[0] === 'django' ? 'django' : 'fastapi') : mode} />
          ))}
        </div>

        {/* ── Bottom CTA ──────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center gap-6">
          {/* Divider */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs font-mono text-gray-700">More</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Two CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* View All Projects */}
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className={`btn-primary flex items-center gap-2 px-6 py-3 text-sm font-mono text-white rounded-xl shadow-lg ${accentBg}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View All Projects
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="btn-outline flex items-center gap-2 px-6 py-3 text-sm font-mono text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white rounded-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Framework
              </button>
            )}

            {/* LinkedIn — Live Projects & Updates */}
            <a
              href="https://www.linkedin.com/in/uzair-waseem-digital/"
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex items-center gap-2 px-6 py-3 text-sm font-mono text-gray-300 border border-gray-700 hover:border-blue-700 hover:text-blue-400 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>Live Projects & Updates</span>
              <svg className="w-3 h-3 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>

          <p className="text-xs font-mono text-gray-700 text-center max-w-sm">
            Active builds, project breakdowns, and engineering posts shared regularly on LinkedIn.
          </p>
        </div>
      </div>
    </div>
  )
}