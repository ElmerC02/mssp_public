// ── Billing Page ──────────────────────────────────────────

function renderBilling() {
  const mrr = state.clients.reduce((a, c) => a + c.retainer, 0);
  const now = new Date();
  const monthsIn = now.getMonth() + 1;

  document.getElementById('billing-mrr').textContent = formatMoney(mrr);
  document.getElementById('billing-ytd').textContent = formatMoney(mrr * monthsIn);
  document.getElementById('billing-ytd-sub').textContent = `${monthsIn} month${monthsIn > 1 ? 's' : ''} in`;

  document.getElementById('billing-list').innerHTML = state.clients.map(c => `
    <div class="billing-row">
      <div class="billing-client">${escapeHtml(c.name)}</div>
      <div class="billing-plan">${escapeHtml(c.plan)}</div>
      <div class="billing-amount mono">${formatMoney(c.retainer)}</div>
      <div class="billing-status pill ${c.billing_status === 'paid' ? 'pill-pass' : 'pill-warn'}">${escapeHtml(c.billing_status)}</div>
      <div class="billing-due">${escapeHtml(c.next_due)}</div>
    </div>`).join('');
}

// ── Init ──────────────────────────────────────────────────
renderBilling();
