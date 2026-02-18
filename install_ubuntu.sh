#!/bin/bash

DEFAULT_DNS="thegoodcorner.duckdns.org"
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

sudo service apache2 stop
sudo apt-get purge apache2 -y
sudo apt-get autoremove -y

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

# Configure fail2ban
sudo touch /etc/fail2ban/jail.local && \
sudo cat <<EOF > /etc/fail2ban/jail.local
[ssh-ddos]
enabled = true
EOF
sudo /etc/init.d/fail2ban restart && \

# Build Caddy with rate limiting module
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

sudo cat <<EOF > /etc/caddy/Caddyfile
$CADDY_GLOBAL_OPTS

$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:82
}

staging.$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:81
}

ops.$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:9000
}
EOF
sudo systemctl start caddy && \

# Enable IP forwarding for Docker
sudo sysctl -w net.ipv4.ip_forward=1 && \
sudo sysctl -w net.ipv6.conf.all.forwarding=1 && \
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf && \
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf && \

# Ensure DNS works (some VPS providers don't configure systemd-resolved properly)
sudo systemctl stop systemd-resolved 2>/dev/null || true
echo "nameserver 9.9.9.9" | sudo tee /etc/resolv.conf > /dev/null
echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf > /dev/null

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

# Restart Docker to apply iptables=false configuration
sudo systemctl restart docker && \

# Configure webhook and restart

sudo cat <<EOF > /etc/webhook.conf
[
  {
    "id": "redeploy-tgc-staging",
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
    "id": "redeploy-tgc-prod",
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

echo "✨ DONE ! ✨" && \
echo "Staging: https://staging.$DNS" && \
echo "Prod: https://$DNS" && \
echo "WEBHOOK_SECRET: $WEBHOOK_SECRET" && \

ADMIN_PASSWORD=$(openssl rand -base64 20)
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"

docker exec -it staging-backend /bin/sh -c "ADMIN_PASSWORD=$ADMIN_PASSWORD npm run resetDB"
docker exec -it prod-backend /bin/sh -c "ADMIN_PASSWORD=$ADMIN_PASSWORD npm run resetDB"

# To enable running docker without sudo
newgrp docker
