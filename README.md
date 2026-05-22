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
| Backend | Python Flask |
| Database | SQLCipher (encrypted SQLite) |
| Firewall | UFW |
| Remote Access | Cloudflare Tunnel (coming soon) |
| Auth | Cloudflare Access (coming soon) |
| Frontend | HTML / CSS / JS (Jinja2 templates) |

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

Security-first approach — only necessary ports are opened.

```bash
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw allow 5000
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
pip install flask python-dotenv
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

---

## Step 7 — Auto-Start Flask on Boot (systemd)

```ini
[Unit]
Description=MSSP Flask Server
After=network.target

[Service]
User=<server-user>
WorkingDirectory=/home/<server-user>/mssp
Environment="PATH=/home/<server-user>/mssp/venv/bin"
ExecStart=/home/<server-user>/mssp/venv/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mssp
sudo systemctl start mssp
sudo systemctl restart mssp   # apply changes after updates
```

---

## Architecture Diagram

```
[ Mac / Remote Device ]
        |
        | SSH (key auth only) / Cloudflare Tunnel (coming soon)
        |
[ Proxmox Hypervisor ]
        |
        |-- [ mssp-server VM ] ← Flask + SQLCipher + Dashboard
        |       ops.stratusitsec.com (coming soon)
        |
        |-- [ unifi-vm ]       ← Network management
```

---

## Domain Structure (Coming Soon)

| Subdomain | Purpose |
|-----------|---------|
| `stratusitsec.com` | Public website |
| `ops.stratusitsec.com` | Internal ops dashboard (this project) |
| `client.stratusitsec.com` | Client portal |
| `onboard.stratusitsec.com` | Client onboarding form |

All subdomains will be routed through Cloudflare Tunnel with Cloudflare Access restricting access to authorized emails only.

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
- [x] Flask auto-starts on boot (systemd)
- [ ] Purchase domain (stratusitsec.com)
- [ ] Cloudflare Tunnel → ops.stratusitsec.com
- [ ] Cloudflare Access (restrict to 2 emails)
- [ ] GitHub Actions CI/CD (auto-deploy on push)

**Phase 2 — Backend**
- [ ] Wire Flask routes to SQLCipher database
- [ ] Client data persists across sessions
- [ ] Tickets and billing data persists

**Phase 3 — Tools**
- [ ] Invoice generator
- [ ] SOW generator
- [ ] TPN compliance checker
- [ ] Automated backups (cron job)
- [ ] SLA timer

**Phase 4 — Client Portal**
- [ ] client.stratusitsec.com
- [ ] onboard.stratusitsec.com

---

## Skills Demonstrated

- Linux server administration (Ubuntu Server 24.04)
- Virtualization (Proxmox VE)
- Python backend development (Flask, Jinja2)
- Database encryption (SQLCipher)
- Firewall configuration (UFW)
- SSH hardening (key auth, password login disabled)
- Service management (systemd)
- Security-first infrastructure design
- Self-hosted architecture (no cloud dependency)
- Cloudflare Tunnel + Access (remote access without port forwarding)
- CI/CD pipeline (GitHub Actions — coming soon)

---

## About

Built by a two-person team as the backend foundation for a real MSSP business. All tooling is self-hosted to keep costs low, maintain full control over client data, and demonstrate hands-on infrastructure skills.
