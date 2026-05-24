#!/bin/bash
cd ~/mssp
git pull origin main
source venv/bin/activate
pip install -r requirements.txt -q
sudo systemctl restart mssp
echo "Deployed at $(date)"
