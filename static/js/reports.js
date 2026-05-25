// ── PDF Report Generator ──────────────────────────────────

function generateReport(clientId) {
  const c = getClient(clientId);
  if (!c) { showToast('Client not found'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header
  doc.setFillColor(26, 62, 110);
  doc.rect(0, 0, W, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('Stratus IT Sec', 14, 16);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('Monthly Security Health Report', 14, 24);
  doc.setFontSize(9); doc.setTextColor(180, 200, 230);
  const now = new Date();
  doc.text(`${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} · ${c.plan} Plan`, 14, 31);
  doc.text(`Health Score: ${c.health}/100`, W - 14, 20, { align: 'right' });
  doc.setTextColor(150, 230, 180);
  doc.setFontSize(8);
  doc.text(c.health >= 90 ? '● Healthy' : '● Needs Attention', W - 14, 28, { align: 'right' });
  y = 50;

  // Client Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Client Information', 14, y); y += 7;
  doc.setFillColor(240, 244, 250); doc.rect(14, y - 4, W - 28, 28, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Company: ${c.name}`, 18, y + 2);
  doc.text(`Contact: ${c.contact}`, 18, y + 9);
  doc.text(`Email: ${c.email}`, 18, y + 16);
  doc.text(`Industry: ${c.industry}`, W / 2, y + 2);
  doc.text(`Users: ${c.users}`, W / 2, y + 9);
  doc.text(`Monthly Retainer: $${c.retainer.toLocaleString()}`, W / 2, y + 16);
  y += 34;

  // Key Metrics
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text('Key Metrics', 14, y); y += 7;
  const metrics = [
    ['Devices Managed', c.users + ' (all compliant)'],
    ['Threats Blocked', c.threats + ' (0 breaches)'],
    ['Tickets Resolved', c.tickets_resolved],
    ['Avg Response Time', c.avg_response + 'hr'],
    ['Uptime', c.uptime + '%'],
  ];
  metrics.forEach((m, i) => {
    const x = i % 2 === 0 ? 14 : W / 2;
    if (i % 2 === 0 && i > 0) y += 10;
    doc.setFillColor(i % 2 === 0 ? 248 : 242, 248, 252);
    doc.rect(x, y - 4, W / 2 - 16, 9, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text(m[0] + ':', x + 3, y + 1);
    doc.setFont('helvetica', 'normal'); doc.text(String(m[1]), x + 60, y + 1);
    if (i === metrics.length - 1 || i % 2 !== 0) y += 10;
  });
  y += 8;

  // Security Checklist
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text('Security Checklist', 14, y); y += 7;
  Object.entries(c.checklist).forEach(([k, v]) => {
    const color = v === 'pass' ? [34, 197, 94] : v === 'warn' ? [251, 191, 36] : [248, 113, 113];
    doc.setFillColor(...color);
    doc.circle(18, y - 1.5, 2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30);
    doc.text(k, 23, y);
    doc.setTextColor(...color.map(x => Math.min(x * 0.6, 200)));
    doc.text(v === 'pass' ? 'Pass' : v === 'warn' ? 'Action Needed' : 'Fail', W - 14, y, { align: 'right' });
    doc.setTextColor(30, 30, 30);
    y += 7;
  });
  y += 4;

  // Incidents
  if (c.incidents.length > 0) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('Incidents', 14, y); y += 7;
    c.incidents.forEach(inc => {
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('• ' + inc.title, 18, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
      doc.text(inc.date + ' · ' + inc.severity + ' · ' + inc.status, 18, y + 5);
      doc.setTextColor(30, 30, 30);
      y += 12;
    });
    y += 2;
  }

  // Recommendations
  if (c.recommendations.length > 0) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
    doc.text('Recommendations', 14, y); y += 7;
    c.recommendations.forEach((r, i) => {
      doc.setFillColor(240, 244, 250); doc.rect(14, y - 4, W - 28, 9, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text((i + 1) + '.', 18, y + 1);
      doc.setFont('helvetica', 'normal');
      doc.text(r, 25, y + 1);
      y += 11;
    });
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(240, 244, 250); doc.rect(0, pageH - 14, W, 14, 'F');
  doc.setFontSize(8); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal');
  doc.text('Stratus IT Sec · Confidential', 14, pageH - 5);
  doc.text(`Generated ${now.toLocaleDateString()}`, W - 14, pageH - 5, { align: 'right' });

  const fname = safeFileName(c.name) + '_' + now.toLocaleString('default', { month: 'short' }) + now.getFullYear() + '_Report.pdf';
  doc.save(fname);
  showToast('Report downloaded: ' + fname);
}

function generateAllReports() {
  state.clients.forEach(c => generateReport(c.id));
  showToast('All reports generated');
}
