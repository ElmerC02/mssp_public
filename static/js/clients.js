// ── Clients Page ──────────────────────────────────────────

function checklistClass(value) {
  return value === 'pass' ? 'pill-pass' : value === 'warn' ? 'pill-warn' : 'pill-fail';
}

function checklistLabel(value) {
  return value === 'pass' ? 'Pass' : value === 'warn' ? 'Action needed' : 'Fail';
}

function incidentColor(severity) {
  return severity === 'high' ? 'var(--red)' : severity === 'medium' ? 'var(--yellow)' : 'var(--dim)';
}

function renderClientList() {
  const list = document.getElementById('client-list-full');
  list.innerHTML = state.clients.map(c => `
    <div class="client-row" data-client-id="${escapeAttr(c.id)}">
      <div class="client-avatar" style="background:${planColor(c.plan)}22;color:${planColor(c.plan)};width:38px;height:38px;font-size:13px">${escapeHtml(clientInitials(c.name))}</div>
      <div class="client-info">
        <div class="client-row-name">${escapeHtml(c.name)}</div>
        <div class="client-row-meta">${escapeHtml(c.industry)} · ${escapeHtml(c.users)} users · ${escapeHtml(c.contact)}</div>
      </div>
      <div class="client-plan-tag pill" style="background:${planColor(c.plan)}22;color:${planColor(c.plan)}">${escapeHtml(c.plan)}</div>
      <div class="client-score mono" style="color:${scoreColor(c.health)};font-size:15px;width:48px">${escapeHtml(c.health)}</div>
      <div class="mono" style="color:var(--muted);font-size:13px;width:80px;text-align:right">${formatMoney(c.retainer)}/mo</div>
    </div>`).join('');

  list.querySelectorAll('[data-client-id]').forEach(row => {
    row.addEventListener('click', () => showClientDetail(row.dataset.clientId));
  });
}

function showClientDetail(id) {
  const c = getClient(id);
  if (!c) return;
  document.getElementById('view-clients').style.display = 'none';
  document.getElementById('view-client-detail').style.display = 'block';
  document.getElementById('detail-client-name').textContent = c.name;
  document.getElementById('detail-client-meta').textContent = `${c.industry} · ${c.plan} Plan · ${c.users} users`;
  renderClientDetail(c);
  // Update URL without reloading
  history.pushState({}, '', `/clients?id=${encodeQueryValue(id)}`);
}

function showClientList() {
  document.getElementById('view-client-detail').style.display = 'none';
  document.getElementById('view-clients').style.display = 'block';
  history.pushState({}, '', '/clients');
}

function renderClientDetail(c) {
  const container = document.getElementById('client-detail-content');
  const incidents = c.incidents || [];
  const recommendations = c.recommendations || [];
  const health = toNumber(c.health);

  container.innerHTML = `
    <div class="metrics">
      <div class="metric ${health >= 90 ? 'metric-green' : 'metric-yellow'}">
        <div class="metric-label">Health Score</div>
        <div class="metric-value">${escapeHtml(c.health)}</div>
        <div class="metric-sub">${health >= 90 ? 'Healthy' : 'Needs attention'}</div>
      </div>
      <div class="metric metric-blue">
        <div class="metric-label">Devices Managed</div>
        <div class="metric-value">${escapeHtml(c.users)}</div>
        <div class="metric-sub">all users</div>
      </div>
      <div class="metric">
        <div class="metric-label">Threats Blocked</div>
        <div class="metric-value">${escapeHtml(c.threats)}</div>
        <div class="metric-sub">this month</div>
      </div>
      <div class="metric metric-green">
        <div class="metric-label">Uptime</div>
        <div class="metric-value">${escapeHtml(c.uptime)}%</div>
        <div class="metric-sub">no outages</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Security Checklist</div></div>
        ${Object.entries(c.checklist || {}).map(([k, v]) => `
          <div class="check-item">
            <div class="check-name">${escapeHtml(k)}</div>
            <div class="pill ${checklistClass(v)}">${checklistLabel(v)}</div>
          </div>`).join('')}
      </div>
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">Incidents This Month</div></div>
          ${incidents.length === 0
            ? '<div class="text-muted" style="font-size:12px">No incidents this month</div>'
            : incidents.map(i => `
              <div class="incident">
                <div class="incident-dot" style="background:${incidentColor(i.severity)}"></div>
                <div>
                  <div class="incident-title">${escapeHtml(i.title)}</div>
                  <div class="incident-meta">${escapeHtml(i.date)} · ${escapeHtml(i.severity)} · ${escapeHtml(i.status)}</div>
                </div>
              </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Recommendations</div></div>
          ${recommendations.map((r, i) => `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
              <div style="width:18px;height:18px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);flex-shrink:0;margin-top:1px">${i + 1}</div>
              <div style="font-size:12px;color:var(--muted)">${escapeHtml(r)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:0.5rem">
      <button class="btn btn-primary" data-client-action="report" data-client-id="${escapeAttr(c.id)}">⬇ Generate Health Report PDF</button>
      <button class="btn" data-client-action="health" data-client-id="${escapeAttr(c.id)}">✎ Update Health Score</button>
      <button class="btn" style="margin-left:auto;color:var(--red)" data-client-action="remove" data-client-id="${escapeAttr(c.id)}">Remove Client</button>
    </div>`;

  container.querySelectorAll('[data-client-action]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.clientId;
      if (button.dataset.clientAction === 'report') generateReport(id);
      if (button.dataset.clientAction === 'health') editClientHealth(id);
      if (button.dataset.clientAction === 'remove') removeClient(id);
    });
  });
}

function editClientHealth(id) {
  const c = getClient(id);
  const score = prompt('Update health score (0-100):', c.health);
  if (score === null) return;
  const parsedScore = parseInt(score, 10);
  if (Number.isNaN(parsedScore)) {
    showToast('Health score must be a number');
    return;
  }
  c.health = Math.min(100, Math.max(0, parsedScore));
  renderClientDetail(c);
  renderClientNav();
  showToast('Health score updated');
}

function removeClient(id) {
  if (!confirm('Remove this client?')) return;
  state.clients = state.clients.filter(c => c.id !== id);
  state.tickets = state.tickets.filter(t => t.client !== id);
  renderClientNav();
  updateTicketBadge();
  showClientList();
  renderClientList();
  showToast('Client removed');
}

// ── Init ──────────────────────────────────────────────────
document.getElementById('back-to-clients')?.addEventListener('click', showClientList);

// Check if a client ID is in the URL (e.g. /clients?id=c1)
const params = new URLSearchParams(window.location.search);
const clientIdParam = params.get('id');

if (clientIdParam) {
  renderClientList(); // still render list in background
  showClientDetail(clientIdParam);
} else {
  renderClientList();
}
