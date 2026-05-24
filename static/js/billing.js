// ── Billing Page ──────────────────────────────────────────

function renderBilling() {
  const mrr = state.clients.reduce((a, c) => a + c.retainer, 0);
  const now = new Date();
  const monthsIn = now.getMonth() + 1;

  document.getElementById('billing-mrr').textContent = '$' + mrr.toLocaleString();
  document.getElementById('billing-ytd').textContent = '$' + (mrr * monthsIn).toLocaleString();
  document.getElementById('billing-ytd-sub').textContent = `${monthsIn} month${monthsIn > 1 ? 's' : ''} in`;

  document.getElementById('billing-list').innerHTML = state.clients.map(c => `
    <div class="billing-row">
      <div class="billing-client">${c.name}</div>
      <div class="billing-plan">${c.plan}</div>
      <div class="billing-amount mono">$${c.retainer.toLocaleString()}</div>
      <div class="billing-status pill ${c.billing_status === 'paid' ? 'pill-pass' : 'pill-warn'}">${c.billing_status}</div>
      <div class="billing-due">${c.next_due}</div>
    </div>`).join('');
}

// ── Init ──────────────────────────────────────────────────
renderBilling();
