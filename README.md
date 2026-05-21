# MSSP Homelab Infrastructure — Server Setup

A from-scratch build of the backend infrastructure for a two-person Managed Security Service Provider (MSSP) targeting media/production companies, legal firms, and small businesses.

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
| Hypervisor | Proxmox VE |
| Server OS | Ubuntu Server 24.04 LTS |
| Backend | Python Flask |
| Database | SQLite |
| Firewall | UFW |
| Remote Access | Cloudflare Tunnel |
| Frontend | HTML/CSS/JS |

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
```

```bash
sudo ufw status
```

---

## Step 4 — Flask Backend Setup

### Create Project Structure
```bash
mkdir ~/mssp && cd ~/mssp
python3 -m venv venv
source venv/bin/activate
pip install flask
mkdir templates
```

### app.py
```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('mssp_dashboard.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## Step 5 — Auto-Start Flask on Boot (systemd)

Configured Flask to run as a systemd service so the dashboard survives reboots with zero manual intervention.

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
```

---

## Architecture Diagram

```
[ Mac / Remote Device ]
        |
        | SSH / Cloudflare Tunnel
        |
[ Proxmox Hypervisor ]
        |
        |-- [ mssp-server VM ] ← Flask backend + Dashboard
        |-- [ unifi-vm ]       ← Network management
```

---

## Roadmap

- [x] Proxmox VM created
- [x] Ubuntu Server 24.04 LTS installed
- [x] SSH enabled and secured
- [x] Firewall configured (UFW)
- [x] Flask backend running
- [x] MSSP dashboard served via Flask
- [x] Flask auto-starts on boot
- [ ] Cloudflare Tunnel for remote access
- [ ] SQLite database integration
- [ ] Invoice generator
- [ ] TPN compliance checker
- [ ] SOW generator
- [ ] Client onboarding portal
- [ ] Offboarding automation script
- [ ] SLA timer

---

## Skills Demonstrated

- Linux server administration (Ubuntu Server)
- Virtualization (Proxmox)
- Python backend development (Flask)
- Firewall configuration (UFW)
- Service management (systemd)
- Security-first infrastructure design
- Self-hosted architecture (no cloud dependency)
- Cloudflare Tunnel (remote access without port forwarding)

---

## About

Built by a two-person team as the backend foundation for a real MSSP business. All tooling is self-hosted to keep costs low, maintain full control over client data, and demonstrate hands-on infrastructure skills.