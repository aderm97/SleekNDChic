#!/usr/bin/env bash
# AWS EC2 Ubuntu Setup Script for SleekNDChic
# This script installs Docker, Docker Compose, and Git.

set -euo pipefail

echo "=========================================="
echo " Starting SleekNDChic EC2 Setup"
echo "=========================================="

# 1. Update and Upgrade System
echo "[1/4] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install prerequisites and Node.js v20
echo "[2/4] Installing system dependencies and Node.js..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs


# 3. Install Docker Engine
echo "[3/4] Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    echo "Docker is already installed."
fi

# Add current user to docker group to run docker without sudo
if ! groups $USER | grep &>/dev/null "\bdocker\b"; then
    echo "Adding $USER to the docker group..."
    sudo usermod -aG docker $USER
    echo "Please log out and log back in (or run 'newgrp docker') for docker group changes to take effect."
fi

# 4. Verify installation
echo "[4/4] Verifying installation..."
docker --version
docker compose version
git --version
node --version
npm --version

echo "=========================================="
echo " Setup complete!"
echo " Next steps:"
echo " 1. Run 'newgrp docker' (or re-login) to apply docker permissions."
echo " 2. Clone/pull the repository code."
echo " 3. Copy your .env file into the repository root."
echo " 4. Run './deploy.sh' to launch the containers."
echo "=========================================="
