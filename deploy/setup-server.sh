#!/bin/bash
set -e

echo "============================================"
echo "  BGS HelpDesk - Server Setup Script"
echo "  Phase 3: Install Docker, Git, Dependencies"
echo "============================================"

# Update packages
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install essential tools
echo "[2/5] Installing essential tools..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Install Docker
echo "[3/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker installed successfully."
else
    echo "Docker already installed."
fi

# Install Docker Compose (standalone, as backup)
echo "[4/5] Verifying Docker Compose..."
docker compose version

# Create app directory
echo "[5/5] Creating application directory..."
sudo mkdir -p /opt/bgs-helpdesk
sudo chown $USER:$USER /opt/bgs-helpdesk

echo ""
echo "============================================"
echo "  Server setup complete!"
echo "  Docker: $(docker --version)"
echo "  Compose: $(docker compose version)"
echo "============================================"
