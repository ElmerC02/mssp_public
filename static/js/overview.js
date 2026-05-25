// ── Overview Page ─────────────────────────────────────────
function renderOverview() {
  const mrr = state.clients.reduce((a, c) => a + c.retainer, 0);
  const openT = state.tickets.filter(t => t.status !== 'resolved').length;
  const avgH = state.clients.length
    ? Math.round(state.clients.reduce((a, c) => a + c.health, 0) / state.clients.length)
    : 0;
  const commercial = state.clients.filter(c => c.plan !== 'Residential').length;
  const residential = state.clients.filter(c => c.plan === 'Residential').length;
  const critical = state.tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length;
  const standard = state.tickets.filter(t => t.priority !== 'critical' && t.status !== 'resolved').length;

  document.getElementById('stat-clients').textContent = state.clients.length;
  document.getElementById('stat-clients-sub').textContent = `${commercial} commercial · ${residential} residential`;
  document.getElementById('stat-mrr').textContent = formatMoney(mrr);
  document.getElementById('stat-tickets').textContent = openT;
  document.getElementById('stat-tickets-sub').textContent = `${critical} critical · ${standard} standard`;
  document.getElementById('stat-health').textContent = avgH;

  // Client health list
  document.getElementById('overview-client-list').innerHTML = state.clients.map(c => `
    <a class="client-row" href="/clients?id=${encodeQueryValue(c.id)}" style="text-decoration:none;color:inherit">
      <div class="client-avatar" style="background:${planColor(c.plan)}22;color:${planColor(c.plan)}">${escapeHtml(clientInitials(c.name))}</div>
      <div class="client-info">
        <div class="client-row-name">${escapeHtml(c.name)}</div>
        <div class="client-row-meta">${escapeHtml(c.plan)} · ${escapeHtml(c.users)} users</div>
      </div>
      <div class="client-score" style="color:${scoreColor(c.health)}">${escapeHtml(c.health)}</div>
    </a>`).join('');

  // Recent tickets
  document.getElementById('overview-tickets').innerHTML = state.tickets.slice(0, 4).map(t => `
    <div class="ticket-row" style="cursor:default">
      <div class="ticket-id">${escapeHtml(t.id)}</div>
      <div class="ticket-title" style="flex:1">${escapeHtml(t.title)}</div>
      <div class="ticket-pri ${priClass(t.priority)}">${escapeHtml(t.priority)}</div>
    </div>`).join('');

  // Billing summary
  document.getElementById('overview-billing').innerHTML = state.clients.map(c => `
    <div class="billing-row">
      <div class="billing-client">${escapeHtml(c.name)}</div>
      <div class="billing-amount mono">${formatMoney(c.retainer)}</div>
      <div class="billing-status ${c.billing_status === 'paid' ? 'pill-pass' : 'pill-warn'} pill">${escapeHtml(c.billing_status)}</div>
    </div>`).join('');
}

renderOverview();
