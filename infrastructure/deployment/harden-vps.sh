#!/bin/bash
set -e

echo "=== Updating Package Lists ==="
apt-get update

echo "=== Installing Required Packages ==="
apt-get install -y ufw fail2ban unattended-upgrades sudo

echo "=== Creating Dedicated Deploy User ==="
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
    # Allow sudo without password for deploy to run docker/traefik restarts easily
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    
    # Set up SSH keys for deploy user by copying from root
    mkdir -p /home/deploy/.ssh
    if [ -f /root/.ssh/authorized_keys ]; then
        cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
    fi
    chown -R deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chmod 600 /home/deploy/.ssh/authorized_keys
    echo "Deploy user created successfully."
else
    echo "Deploy user already exists."
fi

echo "=== Configuring SSH (Disable Password Auth) ==="
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
# Ensure sshd configuration is tested before restart
sshd -t
systemctl restart sshd

echo "=== Configuring UFW Firewall ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=== Configuring fail2ban ==="
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl restart fail2ban

echo "=== Configuring unattended-upgrades ==="
echo "unattended-upgrades unattended-upgrades/enable_auto_updates boolean true" | debconf-set-selections
dpkg-reconfigure -f noninteractive unattended-upgrades
systemctl restart unattended-upgrades

echo "=== Hardening Complete ==="
