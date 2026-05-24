// ── Overview Page ─────────────────────────────────────────
function renderOverview() {
  const mrr = state.clients.reduce((a, c) => a + c.retainer, 0);
  const openT = state.tickets.filter(t => t.status !== 'resolved').length;
  const avgH = Math.round(state.clients.reduce((a, c) => a + c.health, 0) / state.clients.length);
  const commercial = state.clients.filter(c => c.plan !== 'Residential').length;
  const residential = state.clients.filter(c => c.plan === 'Residential').length;
  const critical = state.tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length;
  const standard = state.tickets.filter(t => t.priority !== 'critical' && t.status !== 'resolved').length;

  document.getElementById('stat-clients').textContent = state.clients.length;
  document.getElementById('stat-clients-sub').textContent = `${commercial} commercial · ${residential} residential`;
  document.getElementById('stat-mrr').textContent = '$' + mrr.toLocaleString();
  document.getElementById('stat-tickets').textContent = openT;
  document.getElementById('stat-tickets-sub').textContent = `${critical} critical · ${standard} standard`;
  document.getElementById('stat-health').textContent = avgH;

  // Client health list
  document.getElementById('overview-client-list').innerHTML = state.clients.map(c => `
    <a class="client-row" href="/clients?id=${c.id}" style="text-decoration:none;color:inherit">
      <div class="client-avatar" style="background:${PLAN_COLORS[c.plan]}22;color:${PLAN_COLORS[c.plan]}">${c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div class="client-info">
        <div class="client-row-name">${c.name}</div>
        <div class="client-row-meta">${c.plan} · ${c.users} users</div>
      </div>
      <div class="client-score" style="color:${scoreColor(c.health)}">${c.health}</div>
    </a>`).join('');

  // Recent tickets
  document.getElementById('overview-tickets').innerHTML = state.tickets.slice(0, 4).map(t => `
    <div class="ticket-row" style="cursor:default">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-title" style="flex:1">${t.title}</div>
      <div class="ticket-pri ${priClass(t.priority)}">${t.priority}</div>
    </div>`).join('');

  // Billing summary
  document.getElementById('overview-billing').innerHTML = state.clients.map(c => `
    <div class="billing-row">
      <div class="billing-client">${c.name}</div>
      <div class="billing-amount mono">$${c.retainer.toLocaleString()}</div>
      <div class="billing-status ${c.billing_status === 'paid' ? 'pill-pass' : 'pill-warn'} pill">${c.billing_status}</div>
    </div>`).join('');
}

renderOverview();
