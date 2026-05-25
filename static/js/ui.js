// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Modal ─────────────────────────────────────────────────
function openModal() { document.getElementById('modal').classList.add('open'); }
function closeModal() { document.getElementById('modal').classList.remove('open'); }

function addClient() {
  const name = document.getElementById('new-company').value.trim();
  if (!name) { alert('Please enter a company name'); return; }
  const plan = document.getElementById('new-plan').value;
  const retainerInput = parseInt(document.getElementById('new-retainer').value, 10);
  const userInput = parseInt(document.getElementById('new-users').value, 10);
  const retainer = Math.max(0, Number.isNaN(retainerInput) ? PLAN_AMOUNTS[plan] : retainerInput);
  const newClient = {
    id: 'c' + Date.now(), name,
    contact: document.getElementById('new-contact').value || '—',
    email: document.getElementById('new-email').value || '—',
    plan, retainer,
    users: Math.max(0, Number.isNaN(userInput) ? 10 : userInput),
    industry: document.getElementById('new-industry').value,
    health: 100, status: 'healthy',
    checklist: {
      'MFA enforcement': 'pass', 'Endpoint encryption': 'pass',
      'OS patches current': 'pass', 'Backup verified': 'pass',
      'Offboarding reviewed': 'pass', 'Firewall rules': 'pass'
    },
    incidents: [],
    recommendations: ['Complete initial security assessment', 'Configure monitoring alerts'],
    threats: 0, tickets_resolved: 0, uptime: 100, avg_response: 0,
    billing_status: 'paid', next_due: 'Jun 1'
  };
  state.clients.push(newClient);
  closeModal();
  renderClientNav();
  showToast('Client added: ' + name);
  // Redirect to the new client's detail page
  window.location.href = '/clients?id=' + encodeQueryValue(newClient.id);
  ['new-company', 'new-contact', 'new-email', 'new-retainer', 'new-users'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  if (target.dataset.action === 'open-client-modal') openModal();
  if (target.dataset.action === 'close-client-modal') closeModal();
  if (target.dataset.action === 'add-client') addClient();
  if (target.dataset.action === 'generate-all-reports' && typeof generateAllReports === 'function') {
    generateAllReports();
  }
});
