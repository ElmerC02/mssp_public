# MSSP Homelab Infrastructure — Server Setup

A from-scratch build of the backend infrastructure for a two-person Managed Security Service Provider (MSSP) targeting media/production companies, legal firms, and small businesses in LA.

> This is a live project. Infrastructure is actively being built out.

---

## Overview

This repo documents the full setup of a self-hosted MSSP backend running on a homelab server. The goal is to run all internal tooling — ops dashboard, client portal, billing, compliance checks — from our own infrastructure with zero reliance on expensive third-party SaaS platforms.

### Services We're Building
- Endpoint management consulting
- Identity & access management
- Network security monitoring
- TPN compliance assessments (media/production clients)
- Monthly health reports
- Ticketing & billing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hypervisor | Proxmox VE 9.1.4 |
| Server OS | Ubuntu Server 24.04 LTS |
| Backend | Python Flask + Gunicorn (4 workers) |
| Database | SQLCipher (encrypted SQLite) |
| Firewall | UFW |
| Remote Access | Cloudflare Tunnel |
| Auth | Cloudflare Access (email verification) |
| SSH Access | Cloudflare Tunnel (SSH over Zero Trust) |
| Frontend | HTML / CSS / JS (Jinja2 templates) |
| CI/CD | GitHub Actions (auto-deploy on push) |

---

## VM Specs

| Resource | Allocated |
|----------|-----------|
| CPU | 4 cores |
| RAM | 16 GB |
| Storage | 200 GB |

---

## Step 1 — Proxmox VM Creation

- Hypervisor: Proxmox VE running on dedicated home server
- Created a new VM with Ubuntu Server 24.04 LTS (Live Server ISO)
- Configured resources appropriate for a small business backend workload

---

## Step 2 — Initial Server Setup

### Enable SSH
```bash
sudo apt install openssh-server -y
sudo systemctl enable ssh --now
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Core Tools
```bash
sudo apt install -y python3 python3-pip python3-venv git curl wget ufw
```

---

## Step 3 — Firewall Configuration (UFW)

Security-first approach — no Flask port is opened to the public internet. Cloudflare Tunnel connects outbound to the local Gunicorn service.

```bash
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

---

## Step 4 — SSH Key Authentication

Password login disabled. SSH key auth only.

```bash
# Generate key on local machine
ssh-keygen -t ed25519 -C "mssp-server" -f ~/.ssh/mssp-server

# Copy key to server
ssh-copy-id -i ~/.ssh/mssp-server.pub <user>@<server-ip>
```

Disable password login in `/etc/ssh/sshd_config`:
```
PasswordAuthentication no
```

```bash
sudo systemctl restart ssh
```

---

## Step 5 — Flask Backend Setup

### Create Project Structure
```bash
mkdir ~/mssp && cd ~/mssp
python3 -m venv venv
source venv/bin/activate
pip install flask python-dotenv gunicorn
mkdir templates static/css static/js database
```

### Project Structure
```
mssp/
├── app.py
├── database.py
├── .env                    ← gitignored, holds DB encryption key
├── templates/
│   ├── base.html           ← shared layout (sidebar, topbar, modal)
│   ├── overview.html
│   ├── clients.html
│   ├── tickets.html
│   └── billing.html
├── static/
│   ├── css/main.css
│   └── js/
│       ├── state.js        ← shared data, runs on every page
│       ├── ui.js           ← toast, modal helpers
│       ├── overview.js
│       ├── clients.js
│       ├── tickets.js
│       ├── billing.js
│       └── reports.js      ← PDF health report generator
└── database/
    ├── schema.sql
    └── mssp.db             ← gitignored, encrypted with SQLCipher
```

### Flask Routes (app.py)
```python
@app.route('/')          # Overview dashboard
@app.route('/clients')   # Client list + detail
@app.route('/tickets')   # Ticket management
@app.route('/billing')   # Billing & MRR
```

---

## Step 6 — Encrypted Database (SQLCipher)

```bash
sudo apt install -y sqlcipher libsqlcipher-dev
pip install sqlcipher3
```

Encryption key stored in `.env` (never committed to git):
```
DB_ENCRYPTION_KEY=<strong-passphrase>
```

Generate a strong local key and lock down the file:
```bash
openssl rand -base64 48
chmod 600 .env
```

---

## Step 7 — Production Server (Gunicorn)

Replaced Flask development server with Gunicorn for production use.

```bash
pip install gunicorn
```

Runs 4 worker processes to handle concurrent requests.

---

## Step 8 — Auto-Start on Boot (systemd)

```ini
[Unit]
Description=MSSP Flask Server
After=network.target

[Service]
User=<server-user>
WorkingDirectory=/home/<server-user>/mssp
Environment="PATH=/home/<server-user>/mssp/venv/bin"
ExecStart=/home/<server-user>/mssp/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mssp
sudo systemctl start mssp
```

---

## Step 9 — Cloudflare Tunnel + Access

Remote access without exposing home IP or opening router ports.

- Tunnel routes `ops.stratusitsec.com` → `localhost:5000`
- Cloudflare Access restricts access to authorized emails only
- SSH tunnel at `ssh.stratusitsec.com` also protected by Cloudflare Access
- Home IP is never exposed to the internet

---

## Step 10 — CI/CD Pipeline (GitHub Actions)

Auto-deploys to the homelab server on every push to `main`.

```
Push to GitHub
      ↓
GitHub Actions triggers
      ↓
SSHes into server via Cloudflare Tunnel
      ↓
Pulls new code + restarts Gunicorn
      ↓
Live on ops.stratusitsec.com in seconds
```

Uses a base64-encoded SSH key stored as a GitHub secret. Cloudflare Tunnel handles the SSH routing — no open ports on the router.

Required GitHub Actions secrets:
- `SSH_PRIVATE_KEY`: base64-encoded private deploy key
- `SSH_KNOWN_HOSTS`: trusted host key entry for `ssh.stratusitsec.com`

Host key checking stays enabled in CI so deploys fail closed if the SSH endpoint identity changes unexpectedly.

---

## Architecture Diagram

```
[ Mac / Remote Device ]
        |
        | Cloudflare Access (email verification)
        |
[ Cloudflare Network ]
        |
        |-- ops.stratusitsec.com → Cloudflare Tunnel → Gunicorn:5000
        |-- ssh.stratusitsec.com → Cloudflare Tunnel → SSH:22
        |
[ Proxmox Hypervisor ]
        |
        |-- [ mssp-server VM ] ← Gunicorn + Flask + SQLCipher
        |
        |-- [ unifi-vm ]       ← Network management
```

---

## Domain Structure

| Subdomain | Purpose | Status |
|-----------|---------|--------|
| `stratusitsec.com` | Public website | Planned |
| `ops.stratusitsec.com` | Internal ops dashboard | ✅ Live |
| `ssh.stratusitsec.com` | Secure SSH access | ✅ Live |
| `client.stratusitsec.com` | Client portal | Planned |
| `onboard.stratusitsec.com` | Client onboarding form | Planned |

---

## Roadmap

**Phase 1 — Foundation**
- [x] Proxmox VM created and configured
- [x] Ubuntu Server 24.04 LTS installed
- [x] SSH key authentication (password login disabled)
- [x] Firewall configured (UFW)
- [x] Flask backend running with 4 routes
- [x] Multi-page dashboard (Overview, Clients, Tickets, Billing)
- [x] PDF health report generator
- [x] Encrypted database (SQLCipher)
- [x] Auto-starts on boot (systemd)
- [x] Gunicorn production server (4 workers)
- [x] Domain purchased (stratusitsec.com)
- [x] DNS managed by Cloudflare
- [x] Cloudflare Tunnel → ops.stratusitsec.com
- [x] Cloudflare Access (email verification)
- [x] SSH tunnel via Cloudflare Zero Trust
- [x] GitHub Actions CI/CD (auto-deploy on push)
- [x] SPF + DMARC email security records
- [ ] DKIM email authentication (pending Google 72hr window)
- [ ] Automated backups to AWS S3

**Phase 2 — Backend**
- [ ] Wire Flask routes to SQLCipher database
- [ ] Client data persists across sessions
- [ ] Tickets and billing data persists
- [ ] Zoho CRM integration via webhook

**Phase 3 — Tools**
- [ ] Invoice generator
- [ ] SOW generator
- [ ] TPN compliance checker
- [ ] SLA timer
- [ ] Rate limiting on Flask

**Phase 4 — Client Portal**
- [ ] client.stratusitsec.com
- [ ] onboard.stratusitsec.com

---

## Security Posture

| Control | Status |
|---------|--------|
| SSH password auth | ❌ Disabled |
| SSH key auth | ✅ Enabled |
| Firewall (UFW) | ✅ Configured |
| Home IP exposed | ❌ Never |
| Flask direct public exposure | ❌ Bound to localhost behind tunnel |
| Database encryption | ✅ SQLCipher |
| Secrets in git | ❌ Never (.gitignore) |
| Remote access auth | ✅ Cloudflare Access |
| SSH access auth | ✅ Cloudflare Access |
| CI SSH host key checking | ✅ Enabled |
| Email spoofing protection | ✅ SPF + DMARC |
| DKIM | ⏳ Pending |
| Automated backups | ⏳ Pending |

---

## Skills Demonstrated

- Linux server administration (Ubuntu Server 24.04)
- Virtualization (Proxmox VE)
- Python backend development (Flask, Jinja2, Gunicorn)
- Database encryption (SQLCipher)
- Firewall configuration (UFW)
- SSH hardening (key auth, password login disabled)
- Service management (systemd)
- Zero Trust network architecture (Cloudflare Tunnel + Access)
- CI/CD pipeline (GitHub Actions + Cloudflare SSH Tunnel)
- DNS management (Cloudflare)
- Email security (SPF, DMARC)
- Security-first infrastructure design
- Self-hosted architecture (no cloud dependency)

---

## About

Built by a two-person team as the backend foundation for a real MSSP business. All tooling is self-hosted to keep costs low, maintain full control over client data, and demonstrate hands-on infrastructure skills.
