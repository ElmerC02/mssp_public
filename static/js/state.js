// ── Shared State ─────────────────────────────────────────
// This is temporary in-memory state. Once the SQLite backend
// is connected, this will be replaced with API calls to Flask.

const PLAN_COLORS = {
  'Starter': '#4ade80',
  'Professional': '#60a5fa',
  'Enterprise': '#c084fc',
  'Residential': '#fb923c'
};

const PLAN_AMOUNTS = {
  'Starter': 500,
  'Professional': 2500,
  'Enterprise': 5000,
  'Residential': 750
};

function escapeHtml(value) {
  const el = document.createElement('div');
  el.textContent = value == null ? '' : String(value);
  return el.innerHTML;
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function encodeQueryValue(value) {
  return encodeURIComponent(value == null ? '' : String(value));
}

function clientInitials(name) {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return initials || 'NA';
}

function planColor(plan) {
  return PLAN_COLORS[plan] || '#888888';
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value) {
  return '$' + toNumber(value).toLocaleString();
}

function safeFileName(value) {
  return String(value || 'client')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'client';
}

let state = {
  clients: [
    {
      id: 'c1', name: 'Acme Productions', contact: 'Sarah Lee', email: 'sarah@acme.com',
      plan: 'Professional', retainer: 2500, users: 28, industry: 'Media & Production',
      health: 94, status: 'healthy',
      checklist: {
        'MFA enforcement': 'pass', 'Endpoint encryption': 'pass',
        'OS patches current': 'pass', 'Backup verified': 'pass',
        'Offboarding reviewed': 'warn', 'Firewall rules': 'pass'
      },
      incidents: [
        { title: 'Phishing attempt blocked', date: 'May 4', severity: 'high', status: 'resolved' },
        { title: 'Unauthorized login attempt', date: 'May 11', severity: 'medium', status: 'resolved' }
      ],
      recommendations: ['Review 2 offboarded user SSO sessions', 'Schedule quarterly security training'],
      threats: 7, tickets_resolved: 12, uptime: 99, avg_response: 2.1,
      billing_status: 'paid', next_due: 'Jun 1'
    },
    {
      id: 'c2', name: 'Harbor Law Group', contact: 'Mike Torres', email: 'mike@harborlaw.com',
      plan: 'Starter', retainer: 500, users: 8, industry: 'Legal',
      health: 88, status: 'healthy',
      checklist: {
        'MFA enforcement': 'pass', 'Endpoint encryption': 'pass',
        'OS patches current': 'warn', 'Backup verified': 'pass',
        'Offboarding reviewed': 'pass', 'Firewall rules': 'pass'
      },
      incidents: [
        { title: 'Outdated software flagged', date: 'May 15', severity: 'low', status: 'resolved' }
      ],
      recommendations: ['Patch 3 devices running outdated macOS'],
      threats: 2, tickets_resolved: 4, uptime: 100, avg_response: 6,
      billing_status: 'paid', next_due: 'Jun 1'
    },
    {
      id: 'c3', name: 'Nguyen Residence', contact: 'Kim Nguyen', email: 'kim@email.com',
      plan: 'Residential', retainer: 750, users: 4, industry: 'Residential',
      health: 90, status: 'healthy',
      checklist: {
        'Network secured': 'pass', 'Devices updated': 'pass',
        'Smart home audit': 'pass', 'Backup verified': 'warn',
        'Password manager': 'pass', 'Guest network': 'pass'
      },
      incidents: [],
      recommendations: ['Set up automated backup for NAS'],
      threats: 0, tickets_resolved: 2, uptime: 100, avg_response: 8,
      billing_status: 'paid', next_due: 'Jun 1'
    }
  ],
  tickets: [
    { id: 'TK-001', title: 'MFA not prompting on VPN login', client: 'c1', priority: 'critical', status: 'open', created: 'May 18' },
    { id: 'TK-002', title: 'macOS update failing on 3 devices', client: 'c2', priority: 'standard', status: 'in-progress', created: 'May 16' },
    { id: 'TK-003', title: 'New employee onboarding — James R.', client: 'c1', priority: 'standard', status: 'open', created: 'May 19' },
    { id: 'TK-004', title: 'Smart lock offline — front door', client: 'c3', priority: 'high', status: 'resolved', created: 'May 12' }
  ],
  ticketFilter: 'all'
};

// ── Shared Helpers ────────────────────────────────────────
function getClient(id) { return state.clients.find(c => c.id === id); }
function scoreColor(s) {
  const score = toNumber(s);
  return score >= 90 ? 'var(--green)' : score >= 75 ? 'var(--yellow)' : 'var(--red)';
}
function priClass(p) {
  return p === 'critical' ? 'pri-critical' : p === 'high' ? 'pri-high' : p === 'standard' ? 'pri-standard' : 'pri-low';
}

// ── Sidebar: Client Nav (runs on every page) ──────────────
function renderClientNav() {
  const el = document.getElementById('client-nav-list');
  if (!el) return;
  el.innerHTML = state.clients.map(c => `
    <a class="client-item" href="/clients?id=${encodeQueryValue(c.id)}">
      <div class="client-dot" style="background:${scoreColor(c.health)}"></div>
      <div class="client-name">${escapeHtml(c.name)}</div>
    </a>`).join('');
}

// ── Sidebar: Open Ticket Count (runs on every page) ───────
function updateTicketBadge() {
  const badge = document.getElementById('open-ticket-count');
  if (!badge) return;
  const open = state.tickets.filter(t => t.status !== 'resolved').length;
  badge.textContent = open;
}

// Run on every page load
renderClientNav();
updateTicketBadge();
