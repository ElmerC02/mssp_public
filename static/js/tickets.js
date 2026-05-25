// ── Tickets Page ──────────────────────────────────────────

function renderTickets() {
  const filtered = state.ticketFilter === 'all'
    ? state.tickets
    : state.tickets.filter(t => t.status === state.ticketFilter);

  document.getElementById('ticket-list').innerHTML = filtered.length === 0
    ? '<div class="empty-state">No tickets found</div>'
    : filtered.map(t => {
        const c = getClient(t.client);
        return `<div class="ticket-row">
          <div class="ticket-id">${escapeHtml(t.id)}</div>
          <div class="ticket-title">${escapeHtml(t.title)}</div>
          <div class="ticket-client">${c ? escapeHtml(c.name) : '—'}</div>
          <div class="ticket-pri ${priClass(t.priority)}">${escapeHtml(t.priority)}</div>
          <div class="ticket-status ${t.status === 'open' ? 'status-open' : t.status === 'in-progress' ? 'status-progress' : 'status-resolved'}">${escapeHtml(t.status)}</div>
        </div>`;
      }).join('');
}

function filterTickets(f, el) {
  state.ticketFilter = f;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderTickets();
}

function openNewTicket() {
  const title = prompt('Ticket title:');
  if (!title) return;
  const newTicket = {
    id: 'TK-' + (state.tickets.length + 1).toString().padStart(3, '0'),
    title,
    client: state.clients[0]?.id || '',
    priority: 'standard',
    status: 'open',
    created: 'Today'
  };
  state.tickets.unshift(newTicket);
  updateTicketBadge();
  renderTickets();
  showToast('Ticket created: ' + newTicket.id);
}

// ── Init ──────────────────────────────────────────────────
document.getElementById('new-ticket-button')?.addEventListener('click', openNewTicket);
document.querySelectorAll('[data-ticket-filter]').forEach(button => {
  button.addEventListener('click', () => filterTickets(button.dataset.ticketFilter, button));
});

renderTickets();
