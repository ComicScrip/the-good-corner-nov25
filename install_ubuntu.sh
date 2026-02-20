#!/bin/bash

DEFAULT_DNS="thegoodcorner.dedyn.io"
read -p "domain (default: $DEFAULT_DNS): " DNS
DNS=${DNS:-$DEFAULT_DNS} && \
DEFAULT_REPO="https://github.com/ComicScrip/the-good-corner-nov25.git"
read -p "repo HTTPS URL (default: $DEFAULT_REPO): " REPO_URL
REPO_URL=${REPO_URL:-$DEFAULT_REPO} && \
read -p "SSL provider (letsencrypt/zerossl, default: letsencrypt): " SSL_PROVIDER
SSL_PROVIDER=${SSL_PROVIDER:-letsencrypt} && \
if [ "$SSL_PROVIDER" = "zerossl" ]; then
    echo "To get ZeroSSL EAB credentials:"
    echo "1. Go to https://dashboard.zerossl.com/developer"
    echo "2. Create a free account if you don't have one"
    echo "3. Click 'Create EAB Credentials' and copy KID and HMAC Key"
    read -p "ZeroSSL EAB KID: " EAB_KID
    read -p "ZeroSSL EAB HMAC Key: " EAB_HMAC_KEY
fi && \
WEBHOOK_SECRET=$(openssl rand -base64 24)

sudo apt-get update && \

# Configure DNS (Quad9 primary, Cloudflare secondary)
echo "Configuring DNS servers..."
sudo systemctl stop systemd-resolved 2>/dev/null || true
sudo systemctl disable systemd-resolved 2>/dev/null || true
sudo rm -f /etc/resolv.conf
sudo bash -c 'cat > /etc/resolv.conf <<EOF
nameserver 9.9.9.9
nameserver 1.1.1.1
EOF'
echo "✓ DNS configured: 9.9.9.9 (primary), 1.1.1.1 (secondary)"

# Docker install : https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
# Add Docker's official GPG key:
sudo apt install -y ca-certificates curl git-all && \
sudo install -m 0755 -d /etc/apt/keyrings && \
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && \
sudo chmod a+r /etc/apt/keyrings/docker.asc && \
# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt-get update && \

# Install Docker, Caddy, Go (snap), Webhook, Fail2ban, nftables
sudo apt-get install -y webhook debian-keyring debian-archive-keyring apt-transport-https fail2ban nftables caddy docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin snapd && \
sudo snap install go --classic && \
export PATH=/snap/bin:$PATH && \

sudo service apache2 stop && \
sudo apt-get purge apache2 -y && \
sudo apt-get autoremove -y && \

# Configure docker
sudo groupadd -f docker && \
sudo usermod -aG docker $USER && \

# Disable Docker iptables management for nftables compatibility
sudo mkdir -p /etc/docker && \
sudo cat <<'DOCKERCONFIG' > /etc/docker/daemon.json
{
  "iptables": false
}
DOCKERCONFIG
\

# Restart Docker to apply iptables=false configuration
sudo systemctl restart docker && \

# Configure fail2ban
sudo touch /etc/fail2ban/jail.local && \
sudo cat <<EOF > /etc/fail2ban/jail.local
[ssh-ddos]
enabled = true
EOF
sudo /etc/init.d/fail2ban restart && \

# ============================================
# PROMETHEUS + GRAFANA MONITORING SETUP
# ============================================

echo ""
echo "=== Setting up Prometheus + Grafana Monitoring ==="
echo ""

# Configuration
MONITORING_DIR="$HOME/monitoring"
MONITORING_DOMAIN="monitoring.$DNS"

# Generate random Grafana admin password
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-20)

# Create monitoring directory structure
mkdir -p $MONITORING_DIR/{prometheus,grafana}
mkdir -p $MONITORING_DIR/prometheus/data
mkdir -p $MONITORING_DIR/grafana/data

# Save Grafana admin password to file
echo "$GRAFANA_ADMIN_PASSWORD" > $MONITORING_DIR/grafana-admin-password.txt
chmod 600 $MONITORING_DIR/grafana-admin-password.txt

# Create Prometheus configuration
cat > $MONITORING_DIR/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
EOF

# Create Docker Compose file for monitoring
cat > $MONITORING_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/etc/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://${MONITORING_DOMAIN}
      - GF_SERVER_DOMAIN=${MONITORING_DOMAIN}
      - GF_PLUGINS_PREINSTALL=grafana-clock-panel
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
EOF

# Create Grafana provisioning directories
mkdir -p $MONITORING_DIR/grafana/provisioning/{datasources,dashboards}

# Create Prometheus datasource
cat > $MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF

# Create dashboards directory
mkdir -p $MONITORING_DIR/grafana/dashboards

# Download Node Exporter Full dashboard (ID: 1860)
echo "Downloading Node Exporter Full dashboard..."
curl -sL "https://grafana.com/api/dashboards/1860/revisions/latest/download" -o $MONITORING_DIR/grafana/dashboards/node-exporter-full.json

# Download cAdvisor exporter dashboard (ID: 14282)
echo "Downloading cAdvisor exporter dashboard..."
curl -sL "https://grafana.com/api/dashboards/14282/revisions/latest/download" -o $MONITORING_DIR/grafana/dashboards/cadvisor-exporter.json

# Fix datasource reference in cAdvisor dashboard (replace ${DS_PROMETHEUS} with Prometheus)
sed -i 's/\${DS_PROMETHEUS}/Prometheus/g' $MONITORING_DIR/grafana/dashboards/cadvisor-exporter.json

# Create dashboards.yml configuration to provision dashboards automatically
cat > $MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/dashboards
      foldersFromFilesStructure: true
EOF

# Start monitoring stack
echo "Starting Prometheus + Grafana stack..."
cd $MONITORING_DIR
docker compose up -d

# Build Caddy with rate limiting module
cd /tmp
curl -L "https://github.com/caddyserver/xcaddy/releases/download/v0.4.5/xcaddy_0.4.5_linux_amd64.tar.gz" -o /tmp/xcaddy.tar.gz && \
sudo tar -xzf /tmp/xcaddy.tar.gz -C /tmp && \
sudo chmod +x /tmp/xcaddy && \
sudo /tmp/xcaddy build --with github.com/mholt/caddy-ratelimit && \
sudo cp /usr/bin/caddy /usr/bin/caddy.bak.$(date +%s) && \
sudo cp /tmp/caddy /usr/bin/caddy && \
sudo chown root:root /usr/bin/caddy && \
sudo chmod 0755 /usr/bin/caddy && \

if [ "$SSL_PROVIDER" = "zerossl" ]; then
    CADDY_GLOBAL_OPTS="{
  acme_ca https://acme.zerossl.com/v2/DV90
  acme_eab {
    key_id \"$EAB_KID\"
    mac_key \"$EAB_HMAC_KEY\"
  }
  order rate_limit before respond
}"
else
    CADDY_GLOBAL_OPTS="{
  order rate_limit before respond
}"
fi

CADDY_RATE_LIMIT="
rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 50
      window 1s
      burst 70
    }
}
"

sudo cat <<EOF > /etc/caddy/Caddyfile
$CADDY_GLOBAL_OPTS

$DNS {
  $CADDY_RATE_LIMIT
  reverse_proxy localhost:82
}

staging.$DNS {
  $CADDY_RATE_LIMIT
  reverse_proxy localhost:81
}

ops.$DNS {
  $CADDY_RATE_LIMIT
  reverse_proxy localhost:9000
}

$MONITORING_DOMAIN {
  $CADDY_RATE_LIMIT
  reverse_proxy localhost:3000 {
    header_up Host {host}
    header_up X-Real-IP {remote}
    header_up X-Forwarded-For {remote}
    header_up X-Forwarded-Proto {scheme}
  }
  
  # Grafana needs websockets for live features
  @websocket {
    header Connection *Upgrade*
    header Upgrade websocket
  }
  reverse_proxy @websocket localhost:3000
}
EOF

sudo systemctl start caddy && \

# Enable IP forwarding for Docker
sudo sysctl -w net.ipv4.ip_forward=1 && \
sudo sysctl -w net.ipv6.conf.all.forwarding=1 && \
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf && \
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf && \

# Configure nftables (kernel-level rate limiting + Docker networking)
sudo cat <<'NFTABLES' > /etc/nftables.conf
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    set rate_limit_http {
        type ipv4_addr
        flags dynamic,timeout
        timeout 1m
    }
    
    set rate_limit_http6 {
        type ipv6_addr
        flags dynamic,timeout
        timeout 1m
    }
    
    set rate_limit_ssh {
        type ipv4_addr
        flags dynamic,timeout
        timeout 5m
    }
    
    set rate_limit_ssh6 {
        type ipv6_addr
        flags dynamic,timeout
        timeout 5m
    }

    chain input {
        type filter hook input priority filter; policy drop;
        
        # Allow loopback
        iif "lo" accept
        
        # Allow established/related connections FIRST (critical for DNS to work)
        ct state established,related accept
        
        # Allow DNS traffic (queries and responses)
        udp dport 53 accept
        tcp dport 53 accept
        udp sport 53 accept
        tcp sport 53 accept
        
        # Allow ICMP (ping)
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept
        
        # Rate limit SSH (22) - 10/min per IP
        tcp dport 22 ct state new \
            add @rate_limit_ssh { ip saddr limit rate over 10/minute } \
            drop
        
        tcp dport 22 ct state new \
            add @rate_limit_ssh6 { ip6 saddr limit rate over 10/minute } \
            drop
        
        # Rate limit HTTP (80) - 30/sec per IP, burst 20
        tcp dport 80 ct state new \
            add @rate_limit_http { ip saddr limit rate over 30/second burst 20 packets } \
            drop
        
        tcp dport 80 ct state new \
            add @rate_limit_http6 { ip6 saddr limit rate over 30/second burst 20 packets } \
            drop
        
        # Rate limit HTTPS (443) - 30/sec per IP, burst 20
        tcp dport 443 ct state new \
            add @rate_limit_http { ip saddr limit rate over 30/second burst 20 packets } \
            drop
        
        tcp dport 443 ct state new \
            add @rate_limit_http6 { ip6 saddr limit rate over 30/second burst 20 packets } \
            drop
        
        # Accept remaining HTTP/HTTPS after rate limit check
        tcp dport { 80, 443 } ct state new accept
        
        # Accept SSH after rate limit check
        tcp dport 22 ct state new accept
    }

    chain forward {
        type filter hook forward priority filter; policy drop;
        
        # Allow established/related connections
        ct state established,related accept
        
        # Allow forwarding from Docker containers to external networks
        iifname "br-*" oifname != "br-*" accept
        
        # Allow forwarding from external to Docker containers (published ports)
        iifname != "br-*" oifname "br-*" ct state new accept
        
        # Allow forwarding between Docker containers
        iifname "br-*" oifname "br-*" accept
    }

    chain output {
        type filter hook output priority filter; policy accept;
    }
}

table ip nat {
    chain postrouting {
        type nat hook postrouting priority srcnat; policy accept;
        
        # Masquerade traffic from Docker containers to external networks
        oifname != "br-*" masquerade
        
        # Also handle Docker's default bridge (docker0)
        oifname != "docker0" masquerade
    }
}
NFTABLES

sudo systemctl enable nftables && \
sudo systemctl start nftables && \

# Configure webhook and restart

sudo cat <<EOF > /etc/webhook.conf
[
  {
    "id": "redeploy-staging",
    "execute-command": "$HOME/apps/$DNS/staging/start.sh",
    "pass-arguments-to-command": [{"source": "string", "name": "staging"}],
    "command-working-directory": "$HOME/apps/$DNS/staging",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "value",
            "value": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Webhook-Secret"
            }
          }
        }
      ]
    }
  },
  {
    "id": "redeploy-prod",
    "execute-command": "$HOME/apps/$DNS/prod/start.sh",
    "pass-arguments-to-command": [{"source": "string", "name": "prod"}],
    "command-working-directory": "$HOME/apps/$DNS/prod",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "value",
            "value": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Webhook-Secret"
            }
          }
        }
      ]
    }
  }
]
EOF

sudo chmod o+w /lib/systemd/system/webhook.service && \
sudo cat <<EOF > /lib/systemd/system/webhook.service
[Service]
ExecStart=/usr/bin/webhook -verbose -nopanic -hooks /etc/webhook.conf
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload && \
sudo systemctl enable webhook && \
sudo systemctl restart webhook && \

# downloading repo

mkdir -p "$HOME/apps/$DNS/prod" && cd "$HOME/apps/$DNS/prod" && \
git clone $REPO_URL .

# Generate secure credentials
JWT_SECRET=$(openssl rand -base64 32)
DB_USER="tgc_$(openssl rand -hex 4)"
DB_PASS=$(openssl rand -base64 24)
# Setup prod env
cp .env.production.example .env.production && \
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env.production && \
sed -i "s|DB_USER=.*|DB_USER=$DB_USER|g" .env.production && \
sed -i "s|DB_PASS=.*|DB_PASS=$DB_PASS|g" .env.production && \
sed -i "s|DEPLOY_ENV=.*|DEPLOY_ENV=prod|g" .env.production && \
sed -i "s|GATEWAY_PORT=.*|GATEWAY_PORT=82|g" .env.production && \
./start.sh prod

# Setup staging env
mkdir -p "$HOME/apps/$DNS/staging" && cd "$HOME/apps/$DNS/staging" && \
git clone $REPO_URL . && git checkout dev && \

JWT_SECRET=$(openssl rand -base64 32)
DB_USER="tgc_$(openssl rand -hex 4)"
DB_PASS=$(openssl rand -base64 24)

cp .env.production.example .env.production && \
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env.production && \
sed -i "s|DB_USER=.*|DB_USER=$DB_USER|g" .env.production && \
sed -i "s|DB_PASS=.*|DB_PASS=$DB_PASS|g" .env.production && \
sed -i "s|DEPLOY_ENV=.*|DEPLOY_ENV=staging|g" .env.production && \
sed -i "s|GATEWAY_PORT=.*|GATEWAY_PORT=81|g" .env.production && \
./start.sh

docker exec -it staging-backend /bin/sh -c "ADMIN_PASSWORD=$ADMIN_PASSWORD npm run resetDB"
docker exec -it prod-backend /bin/sh -c "ADMIN_PASSWORD=$ADMIN_PASSWORD npm run resetDB"

echo "✨ DONE ! ✨" && \
echo "Staging: https://staging.$DNS" && \
echo "Prod: https://$DNS" && \
echo "WEBHOOK_SECRET: $WEBHOOK_SECRET" && \

ADMIN_PASSWORD=$(openssl rand -base64 20)
echo "ADMIN_PASSWORD: $ADMIN_PASSWORD" && \

echo ""
echo "=== Monitoring Setup Complete ==="
echo ""
echo "Access Grafana at: https://${MONITORING_DOMAIN}"
echo ""
echo "Credentials:"
echo "  Username: admin"
echo "  Password: ${GRAFANA_ADMIN_PASSWORD}"
echo ""
echo "Password saved to: ${MONITORING_DIR}/grafana-admin-password.txt"
echo ""
echo "Metrics collected:"
echo "  - CPU usage"
echo "  - RAM usage"
echo "  - Disk I/O"
echo "  - Network traffic"
echo "  - Docker container metrics"
echo ""

# To enable running docker without sudo
newgrp docker

