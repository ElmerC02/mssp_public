// ── Clients Page ──────────────────────────────────────────

function renderClientList() {
  document.getElementById('client-list-full').innerHTML = state.clients.map(c => `
    <div class="client-row" onclick="showClientDetail('${c.id}')">
      <div class="client-avatar" style="background:${PLAN_COLORS[c.plan]}22;color:${PLAN_COLORS[c.plan]};width:38px;height:38px;font-size:13px">${c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div class="client-info">
        <div class="client-row-name">${c.name}</div>
        <div class="client-row-meta">${c.industry} · ${c.users} users · ${c.contact}</div>
      </div>
      <div class="client-plan-tag pill" style="background:${PLAN_COLORS[c.plan]}22;color:${PLAN_COLORS[c.plan]}">${c.plan}</div>
      <div class="client-score mono" style="color:${scoreColor(c.health)};font-size:15px;width:48px">${c.health}</div>
      <div class="mono" style="color:var(--muted);font-size:13px;width:80px;text-align:right">$${c.retainer.toLocaleString()}/mo</div>
    </div>`).join('');
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
  history.pushState({}, '', `/clients?id=${id}`);
}

function showClientList() {
  document.getElementById('view-client-detail').style.display = 'none';
  document.getElementById('view-clients').style.display = 'block';
  history.pushState({}, '', '/clients');
}

function renderClientDetail(c) {
  document.getElementById('client-detail-content').innerHTML = `
    <div class="metrics">
      <div class="metric ${c.health >= 90 ? 'metric-green' : 'metric-yellow'}">
        <div class="metric-label">Health Score</div>
        <div class="metric-value">${c.health}</div>
        <div class="metric-sub">${c.health >= 90 ? 'Healthy' : 'Needs attention'}</div>
      </div>
      <div class="metric metric-blue">
        <div class="metric-label">Devices Managed</div>
        <div class="metric-value">${c.users}</div>
        <div class="metric-sub">all users</div>
      </div>
      <div class="metric">
        <div class="metric-label">Threats Blocked</div>
        <div class="metric-value">${c.threats}</div>
        <div class="metric-sub">this month</div>
      </div>
      <div class="metric metric-green">
        <div class="metric-label">Uptime</div>
        <div class="metric-value">${c.uptime}%</div>
        <div class="metric-sub">no outages</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Security Checklist</div></div>
        ${Object.entries(c.checklist).map(([k, v]) => `
          <div class="check-item">
            <div class="check-name">${k}</div>
            <div class="pill ${v === 'pass' ? 'pill-pass' : v === 'warn' ? 'pill-warn' : 'pill-fail'}">${v === 'pass' ? 'Pass' : v === 'warn' ? 'Action needed' : 'Fail'}</div>
          </div>`).join('')}
      </div>
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">Incidents This Month</div></div>
          ${c.incidents.length === 0
            ? '<div class="text-muted" style="font-size:12px">No incidents this month</div>'
            : c.incidents.map(i => `
              <div class="incident">
                <div class="incident-dot" style="background:${i.severity === 'high' ? 'var(--red)' : i.severity === 'medium' ? 'var(--yellow)' : 'var(--dim)'}"></div>
                <div>
                  <div class="incident-title">${i.title}</div>
                  <div class="incident-meta">${i.date} · ${i.severity} · ${i.status}</div>
                </div>
              </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Recommendations</div></div>
          ${c.recommendations.map((r, i) => `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
              <div style="width:18px;height:18px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);flex-shrink:0;margin-top:1px">${i + 1}</div>
              <div style="font-size:12px;color:var(--muted)">${r}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:0.5rem">
      <button class="btn btn-primary" onclick="generateReport('${c.id}')">⬇ Generate Health Report PDF</button>
      <button class="btn" onclick="editClientHealth('${c.id}')">✎ Update Health Score</button>
      <button class="btn" style="margin-left:auto;color:var(--red)" onclick="removeClient('${c.id}')">Remove Client</button>
    </div>`;
}

function editClientHealth(id) {
  const c = getClient(id);
  const score = prompt('Update health score (0-100):', c.health);
  if (score === null) return;
  c.health = Math.min(100, Math.max(0, parseInt(score) || c.health));
  renderClientDetail(c);
  renderClientNav();
  showToast('Health score updated');
}

function removeClient(id) {
  if (!confirm('Remove this client?')) return;
  state.clients = state.clients.filter(c => c.id !== id);
  renderClientNav();
  showClientList();
  renderClientList();
  showToast('Client removed');
}

// ── Init ──────────────────────────────────────────────────
// Check if a client ID is in the URL (e.g. /clients?id=c1)
const params = new URLSearchParams(window.location.search);
const clientIdParam = params.get('id');

if (clientIdParam) {
  renderClientList(); // still render list in background
  showClientDetail(clientIdParam);
} else {
  renderClientList();
}
